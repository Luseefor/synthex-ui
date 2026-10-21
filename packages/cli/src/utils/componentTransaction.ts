import { randomUUID } from "node:crypto";
import { lstat, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  COMPONENT_STATE_REL_POSIX,
  assertSafeComponentPath,
} from "./componentState";
import { CliError } from "./errors";
import type { ComponentMutation } from "./componentTypes";

export interface ComponentBackupManifestFile {
  readonly path: string;
  readonly existed: boolean;
}

export interface ComponentBackupManifest {
  readonly version: 1;
  readonly files: readonly ComponentBackupManifestFile[];
}

export interface ComponentTransactionResult {
  readonly backupDir: string | null;
}

const BACKUPS_REL_POSIX = ".synthex/backups";
const LOCK_REL_POSIX = ".synthex/components.lock";

function fail(message: string, details?: unknown): never {
  throw new CliError(message, 1, details);
}

function isReservedSynthex(relativePosix: string): boolean {
  return (
    relativePosix === ".synthex" || relativePosix.startsWith(".synthex/")
  );
}

function bytesEqual(a: Buffer | null, b: Buffer | null): boolean {
  if (a === null || b === null) {
    return a === null && b === null;
  }
  return a.equals(b);
}

async function readCurrent(abs: string): Promise<Buffer | null> {
  try {
    return await readFile(abs);
  } catch (error) {
    if ((error as NodeJS.ErrnoException | null)?.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function ensureSafeStateDir(cwdResolved: string, rel: string): Promise<string> {
  const absolute = path.join(cwdResolved, ...rel.split("/"));
  let stats: Awaited<ReturnType<typeof lstat>> | null = null;
  try {
    stats = await lstat(absolute);
  } catch (error) {
    if ((error as NodeJS.ErrnoException | null)?.code !== "ENOENT") {
      fail(`Cannot inspect "${rel}": ${(error as Error)?.message ?? String(error)}.`, {
        path: rel,
      });
    }
  }
  if (stats === null) {
    try {
      await mkdir(absolute);
    } catch (error) {
      if ((error as NodeJS.ErrnoException | null)?.code !== "EEXIST") {
        fail(`Cannot create "${rel}": ${(error as Error)?.message ?? String(error)}.`, {
          path: rel,
        });
      }
      const retry = await lstat(absolute);
      if (retry.isSymbolicLink()) {
        fail(`Refusing symlink at "${rel}". Resolve or remove it before retrying.`, {
          path: rel,
        });
      }
      if (!retry.isDirectory()) {
        fail(`Cannot use "${rel}": exists and is not a directory.`, { path: rel });
      }
    }
    return absolute;
  }
  if (stats.isSymbolicLink()) {
    fail(`Refusing symlink at "${rel}". Resolve or remove it before retrying.`, {
      path: rel,
    });
  }
  if (!stats.isDirectory()) {
    fail(`Cannot use "${rel}": exists and is not a directory.`, { path: rel });
  }
  return absolute;
}

async function acquireTransactionLock(
  cwdResolved: string,
): Promise<{ lockAbs: string; token: string }> {
  const stateDir = await ensureSafeStateDir(cwdResolved, ".synthex");
  const lockAbs = path.join(stateDir, "components.lock");
  try {
    const stats = await lstat(lockAbs);
    if (stats.isSymbolicLink()) {
      fail(
        `Refusing symlink lock at "${LOCK_REL_POSIX}". Resolve or remove it before retrying.`,
        { path: LOCK_REL_POSIX },
      );
    }
    fail(
      `Another component transaction holds "${LOCK_REL_POSIX}". If no "synthex" transaction is running, remove the lock file and retry. This lock is never removed automatically.`,
      { path: LOCK_REL_POSIX, lock: lockAbs },
    );
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }
    if ((error as NodeJS.ErrnoException | null)?.code !== "ENOENT") {
      fail(
        `Cannot inspect "${LOCK_REL_POSIX}": ${(error as Error)?.message ?? String(error)}.`,
        { path: LOCK_REL_POSIX },
      );
    }
  }
  const token = `${process.pid}:${randomUUID()}`;
  try {
    await writeFile(lockAbs, token, { flag: "wx", encoding: "utf8" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException | null)?.code === "EEXIST") {
      fail(
        `Another component transaction holds "${LOCK_REL_POSIX}". If no "synthex" transaction is running, remove the lock file and retry. This lock is never removed automatically.`,
        { path: LOCK_REL_POSIX, lock: lockAbs },
      );
    }
    fail(
      `Cannot acquire "${LOCK_REL_POSIX}": ${(error as Error)?.message ?? String(error)}.`,
      { path: LOCK_REL_POSIX },
    );
  }
  return { lockAbs, token };
}

async function releaseTransactionLock(
  lockAbs: string,
  token: string,
): Promise<void> {
  let current: string;
  try {
    current = await readFile(lockAbs, "utf8");
  } catch {
    return;
  }
  if (current !== token) {
    return;
  }
  try {
    await unlink(lockAbs);
  } catch {
    // Finally-safe: a release failure must never mask the transaction result.
  }
}

/**
 * Apply file mutations atomically with backup + rollback.
 *
 * - Verifies EVERY path + `expected` byte-equality before ANY writes.
 * - Serializes transactions with an exclusive `.synthex/components.lock`
 *   (PID + UUID token, `wx` create) acquired BEFORE the post-acquire
 *   expected recheck and backups; the lock is released in a `finally`
 *   only when it still holds our token. A pre-existing lock aborts with
 *   an actionable error and is never auto-deleted.
 * - Only `.synthex/components.json` may touch reserved `.synthex` paths.
 * - Skips backup entirely when every mutation is a no-op (no lock taken).
 * - Backs up prior bytes under `.synthex/backups/<uuid>/files/<path>`
 *   plus `manifest.json { version: 1, files: [{ path, existed }] }`.
 * - Re-checks the safe path + `expected` bytes immediately before EACH
 *   mutation during apply, so a file changed after an earlier write aborts
 *   instead of being overwritten.
 * - Writes via temp file + same-directory rename; on failure rolls back
 *   already-applied files to `expected`, but never clobbers a concurrent
 *   user edit (a file whose current bytes no longer equal what this
 *   transaction wrote is left in place and reported as unrestored).
 */
export async function applyComponentTransaction(
  cwd: string,
  mutations: readonly ComponentMutation[],
): Promise<ComponentTransactionResult> {
  if (typeof cwd !== "string" || cwd.length === 0) {
    fail("Invalid cwd: expected a non-empty string.", { cwd });
  }
  if (!Array.isArray(mutations)) {
    fail("Invalid mutations: expected an array.", { mutations });
  }
  const cwdResolved = path.resolve(cwd);

  if (mutations.length === 0) {
    return { backupDir: null };
  }

  for (const [index, mutation] of mutations.entries()) {
    if (
      typeof mutation !== "object" ||
      mutation === null ||
      typeof (mutation as ComponentMutation).path !== "string"
    ) {
      fail(`Invalid mutation at index ${index}: "path" must be a string.`, {
        index,
      });
    }
    const m = mutation as ComponentMutation;
    if (
      (m.content !== null && !Buffer.isBuffer(m.content)) ||
      (m.expected !== null && !Buffer.isBuffer(m.expected))
    ) {
      fail(`Invalid mutation "${m.path}": "content" and "expected" must be Buffer or null.`, {
        path: m.path,
        index,
      });
    }
    if (isReservedSynthex(m.path)) {
      if (m.path !== COMPONENT_STATE_REL_POSIX) {
        fail(
          `Refusing reserved mutation "${m.path}". Only "${COMPONENT_STATE_REL_POSIX}" may be written under ".synthex".`,
          { path: m.path, index },
        );
      }
    }
  }

  const seen = new Set<string>();
  for (const mutation of mutations) {
    const p = (mutation as ComponentMutation).path;
    if (seen.has(p)) {
      fail(`Duplicate mutation path "${p}". Combine edits into a single mutation.`, {
        path: p,
      });
    }
    seen.add(p);
  }
  const paths = [...seen];
  for (const a of paths) {
    for (const b of paths) {
      if (a !== b && b.startsWith(`${a}/`)) {
        fail(`Mutually nested mutation paths "${a}" and "${b}". A file cannot contain another file.`, {
          paths: [a, b],
        });
      }
    }
  }

  const absoluteByPath = new Map<string, string>();
  for (const mutation of mutations) {
    const m = mutation as ComponentMutation;
    const allowState = m.path === COMPONENT_STATE_REL_POSIX;
    absoluteByPath.set(
      m.path,
      await assertSafeComponentPath(cwdResolved, m.path, { allowState }),
    );
  }

  const currentByPath = new Map<string, Buffer | null>();
  for (const mutation of mutations) {
    const m = mutation as ComponentMutation;
    const abs = absoluteByPath.get(m.path) as string;
    let current: Buffer | null;
    try {
      current = await readCurrent(abs);
    } catch (error) {
      fail(
        `Cannot read "${m.path}": ${(error as Error)?.message ?? String(error)}. Aborted before any writes.`,
        { path: m.path },
      );
    }
    if (!bytesEqual(current as Buffer | null, m.expected)) {
      fail(
        `Concurrent change detected at "${m.path}". Expected bytes no longer match the file on disk; re-run preflight and retry. Aborted before any writes.`,
        { path: m.path },
      );
    }
    currentByPath.set(m.path, current as Buffer | null);
  }

  const effective = mutations.filter((mutation) => {
    const m = mutation as ComponentMutation;
    return !bytesEqual(currentByPath.get(m.path) ?? null, m.content);
  }) as readonly ComponentMutation[];
  if (effective.length === 0) {
    return { backupDir: null };
  }

  const lock = await acquireTransactionLock(cwdResolved);
  try {
    return await applyLocked(
      cwdResolved,
      effective,
      currentByPath,
      absoluteByPath,
    );
  } finally {
    await releaseTransactionLock(lock.lockAbs, lock.token);
  }
}

async function applyLocked(
  cwdResolved: string,
  effective: readonly ComponentMutation[],
  currentByPath: Map<string, Buffer | null>,
  absoluteByPath: Map<string, string>,
): Promise<ComponentTransactionResult> {
  const backupsAbs = await ensureSafeStateDir(cwdResolved, BACKUPS_REL_POSIX);

  let backupDir: string | null = null;
  let lastCollision: unknown = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = path.join(backupsAbs, randomUUID());
    try {
      await mkdir(candidate);
      backupDir = candidate;
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException | null)?.code === "EEXIST") {
        lastCollision = error;
        continue;
      }
      fail(`Cannot create backup directory: ${(error as Error)?.message ?? String(error)}.`, {
        backups: backupsAbs,
      });
    }
  }
  if (backupDir === null) {
    fail("Cannot create a unique backup directory after several attempts.", {
      backups: backupsAbs,
      cause: String(lastCollision),
    });
  }
  const backupFilesDir = path.join(backupDir as string, "files");
  await mkdir(backupFilesDir, { recursive: true });

  for (const m of effective) {
    const prior = currentByPath.get(m.path) ?? null;
    if (prior !== null) {
      const target = path.join(backupFilesDir, ...m.path.split("/"));
      await mkdir(path.dirname(target), { recursive: true });
      try {
        await writeFile(target, prior, { flag: "wx" });
      } catch (error) {
        fail(
          `Cannot back up "${m.path}": ${(error as Error)?.message ?? String(error)}. Aborted before applying writes; backup at "${backupDir}" was kept.`,
          { path: m.path, backupDir },
        );
      }
    }
  }
  const manifest: ComponentBackupManifest = {
    version: 1,
    files: effective.map((m) => ({
      path: m.path,
      existed: (currentByPath.get(m.path) ?? null) !== null,
    })),
  };
  try {
    await writeFile(
      path.join(backupDir as string, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      { flag: "wx" },
    );
  } catch (error) {
    fail(
      `Cannot write backup manifest: ${(error as Error)?.message ?? String(error)}. Aborted before applying writes; backup at "${backupDir}" was kept.`,
      { backupDir },
    );
  }

  for (const m of effective) {
    const abs = absoluteByPath.get(m.path) as string;
    let fresh: Buffer | null;
    try {
      fresh = await readCurrent(abs);
    } catch (error) {
      fail(
        `Cannot re-read "${m.path}" before apply: ${(error as Error)?.message ?? String(error)}. Aborted without writes; backup at "${backupDir}" was kept.`,
        { path: m.path, backupDir },
      );
    }
    if (!bytesEqual(fresh, m.expected)) {
      fail(
        `Concurrent change detected at "${m.path}" just before apply. Aborted without writes; backup at "${backupDir}" was kept.`,
        { path: m.path, backupDir },
      );
    }
  }

  const applied: ComponentMutation[] = [];
  async function atomicWrite(abs: string, bytes: Buffer): Promise<void> {
    const temp = `${abs}.tmp-${randomUUID()}`;
    try {
      await writeFile(temp, bytes, { flag: "wx" });
      await rename(temp, abs);
    } catch (error) {
      try {
        await unlink(temp);
      } catch {
        // Best effort: never mask the original write failure.
      }
      throw error;
    }
  }
  try {
    for (const m of effective) {
      const allowState = m.path === COMPONENT_STATE_REL_POSIX;
      const abs = await assertSafeComponentPath(cwdResolved, m.path, {
        allowState,
      });
      absoluteByPath.set(m.path, abs);
      let fresh: Buffer | null;
      try {
        fresh = await readCurrent(abs);
      } catch (error) {
        fail(
          `Cannot re-read "${m.path}" just before writing: ${(error as Error)?.message ?? String(error)}. Aborted; ${applied.length} earlier file(s) will be rolled back; backup at "${backupDir}" was kept.`,
          { path: m.path, backupDir },
        );
      }
      if (!bytesEqual(fresh, m.expected)) {
        fail(
          `Concurrent change detected at "${m.path}" just before writing. Aborted instead of overwriting; ${applied.length} earlier file(s) will be rolled back; backup at "${backupDir}" was kept.`,
          { path: m.path, backupDir },
        );
      }
      if (m.content === null) {
        await unlink(abs);
      } else {
        await mkdir(path.dirname(abs), { recursive: true });
        await atomicWrite(abs, m.content);
      }
      applied.push(m);
    }
  } catch (error) {
    const restored: string[] = [];
    const unrestored: Array<{ path: string; message: string }> = [];
    for (let i = applied.length - 1; i >= 0; i -= 1) {
      const done = applied[i] as ComponentMutation;
      const abs = absoluteByPath.get(done.path) as string;
      let now: Buffer | null;
      try {
        now = await readCurrent(abs);
      } catch (readError) {
        unrestored.push({
          path: done.path,
          message: `cannot re-read before rollback (${(readError as Error)?.message ?? String(readError)}); left in place, recover from backup if needed`,
        });
        continue;
      }
      if (!bytesEqual(now, done.content)) {
        unrestored.push({
          path: done.path,
          message:
            "concurrent edit after apply preserved; expected bytes NOT restored (recover from backup if needed)",
        });
        continue;
      }
      try {
        if (done.expected === null) {
          try {
            await unlink(abs);
          } catch (unlinkError) {
            if ((unlinkError as NodeJS.ErrnoException | null)?.code !== "ENOENT") {
              throw unlinkError;
            }
          }
        } else {
          await atomicWrite(abs, done.expected);
        }
        restored.push(done.path);
      } catch (rollbackError) {
        unrestored.push({
          path: done.path,
          message: (rollbackError as Error)?.message ?? String(rollbackError),
        });
      }
    }
    fail(
      `Component update failed (${(error as Error)?.message ?? String(error)}). Restored ${restored.length} of ${applied.length} applied file(s) to expected bytes; backup at "${backupDir}" was kept. Restore unrestored files from ".synthex/backups" if needed.${unrestored.length > 0 ? ` Not restored: ${unrestored.map((r) => `${r.path} (${r.message})`).join("; ")}` : ""}`,
      { backupDir, restored, unrestored },
    );
  }

  return { backupDir: backupDir as string };
}
