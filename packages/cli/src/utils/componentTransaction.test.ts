import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CliError } from "./errors";
import {
  readComponentStateSnapshot,
  serializeComponentState,
} from "./componentState";
import { applyComponentTransaction } from "./componentTransaction";
import type { ComponentMutation } from "./componentTypes";

const renameCtl = vi.hoisted(() => ({
  calls: 0,
  failOn: new Set<number>(),
  onRename: null as null | ((call: number) => void | Promise<void>),
}));

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...actual,
    rename: async (...args: [string, string]): Promise<void> => {
      renameCtl.calls += 1;
      if (renameCtl.onRename) {
        await renameCtl.onRename(renameCtl.calls);
      }
      if (renameCtl.failOn.has(renameCtl.calls)) {
        throw new Error("injected rename failure");
      }
      return (actual.rename as (...a: [string, string]) => Promise<void>)(
        ...args,
      );
    },
  };
});

function validStateBytes(): Buffer {
  return serializeComponentState({
    version: 1,
    destinationRoot: "components/ui",
    platform: "web",
    requests: [],
    files: {},
  });
}

async function makeRoot(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "synthex-txn-"));
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await lstat(target);
    return true;
  } catch {
    return false;
  }
}

beforeEach(() => {
  renameCtl.calls = 0;
  renameCtl.failOn.clear();
  renameCtl.onRename = null;
});

const LOCK_REL = path.join(".synthex", "components.lock");

async function lockExists(cwd: string): Promise<boolean> {
  return pathExists(path.join(cwd, LOCK_REL));
}

describe("applyComponentTransaction", () => {
  it("applies create/update/delete with backup and manifest", async () => {
    const cwd = await makeRoot();
    await writeFile(path.join(cwd, "a.txt"), "old-a");
    await writeFile(path.join(cwd, "del.txt"), "bye");
    await mkdir(path.join(cwd, ".synthex"), { recursive: true });
    await writeFile(path.join(cwd, ".synthex", "history.json"), "keep");

    const result = await applyComponentTransaction(cwd, [
      { path: "a.txt", content: Buffer.from("new-a"), expected: Buffer.from("old-a") },
      { path: "new.txt", content: Buffer.from("hello"), expected: null },
      { path: "del.txt", content: null, expected: Buffer.from("bye") },
    ]);

    if (result.backupDir === null) {
      throw new Error("expected a backup directory");
    }
    expect(result.backupDir.startsWith(path.join(cwd, ".synthex", "backups"))).toBe(true);
    expect(await readFile(path.join(cwd, "a.txt"), "utf8")).toBe("new-a");
    expect(await readFile(path.join(cwd, "new.txt"), "utf8")).toBe("hello");
    expect(await pathExists(path.join(cwd, "del.txt"))).toBe(false);

    expect(await readFile(path.join(result.backupDir, "files", "a.txt"), "utf8")).toBe("old-a");
    expect(await readFile(path.join(result.backupDir, "files", "del.txt"), "utf8")).toBe("bye");
    expect(
      await pathExists(path.join(result.backupDir, "files", "new.txt")),
    ).toBe(false);
    const manifest = JSON.parse(
      await readFile(path.join(result.backupDir, "manifest.json"), "utf8"),
    ) as {
      version: number;
      files: Array<{ path: string; existed: boolean }>;
    };
    expect(manifest.version).toBe(1);
    expect(manifest.files).toEqual([
      { path: "a.txt", existed: true },
      { path: "new.txt", existed: false },
      { path: "del.txt", existed: true },
    ]);
    expect(
      await readFile(path.join(cwd, ".synthex", "history.json"), "utf8"),
    ).toBe("keep");
  });

  it("returns null backup when all mutations are no-ops", async () => {
    const cwd = await makeRoot();
    await writeFile(path.join(cwd, "same.txt"), "same");
    const result = await applyComponentTransaction(cwd, [
      { path: "same.txt", content: Buffer.from("same"), expected: Buffer.from("same") },
      { path: "absent.txt", content: null, expected: null },
    ]);
    expect(result.backupDir).toBeNull();
    expect(await pathExists(path.join(cwd, ".synthex"))).toBe(false);
  });

  it("aborts every write on stale expected", async () => {
    const cwd = await makeRoot();
    await writeFile(path.join(cwd, "a.txt"), "current-a");
    await writeFile(path.join(cwd, "b.txt"), "current-b");
    await expect(
      applyComponentTransaction(cwd, [
        { path: "a.txt", content: Buffer.from("x"), expected: Buffer.from("current-a") },
        { path: "b.txt", content: Buffer.from("y"), expected: Buffer.from("stale") },
      ]),
    ).rejects.toThrow(CliError);
    expect(await readFile(path.join(cwd, "a.txt"), "utf8")).toBe("current-a");
    expect(await readFile(path.join(cwd, "b.txt"), "utf8")).toBe("current-b");
    expect(await pathExists(path.join(cwd, ".synthex", "backups"))).toBe(false);
  });

  it("rejects duplicate and mutually nested paths", async () => {
    const cwd = await makeRoot();
    await expect(
      applyComponentTransaction(cwd, [
        { path: "a.txt", content: Buffer.from("1"), expected: null },
        { path: "a.txt", content: Buffer.from("2"), expected: null },
      ]),
    ).rejects.toThrow(/duplicate/i);
    await expect(
      applyComponentTransaction(cwd, [
        { path: "a/b", content: Buffer.from("1"), expected: null },
        { path: "a/b/c", content: Buffer.from("2"), expected: null },
      ]),
    ).rejects.toThrow(/nested/i);
  });

  it("allows only .synthex/components.json under .synthex", async () => {
    const cwd = await makeRoot();
    await expect(
      applyComponentTransaction(cwd, [
        { path: ".synthex/evil.txt", content: Buffer.from("x"), expected: null },
      ]),
    ).rejects.toThrow(/reserved/i);

    const result = await applyComponentTransaction(cwd, [
      { path: ".synthex/components.json", content: validStateBytes(), expected: null },
    ]);
    if (result.backupDir === null) {
      throw new Error("expected a backup directory");
    }
    expect(
      await readFile(path.join(cwd, ".synthex", "components.json"), "utf8"),
    ).toBe(validStateBytes().toString("utf8"));
  });

  it("rejects conflict-artifact mutations (transaction reserves only state JSON)", async () => {
    const cwd = await makeRoot();
    const id = "123e4567-e89b-12d3-a456-426614174000";
    await expect(
      applyComponentTransaction(cwd, [
        {
          path: `.synthex/conflicts/${id}/manifest.json`,
          content: Buffer.from("{}"),
          expected: null,
        },
      ]),
    ).rejects.toThrow(/reserved/i);
  });

  it("rejects symlinks, dangling links and a symlinked .synthex", async () => {
    const cwd = await makeRoot();
    await writeFile(path.join(cwd, "real.txt"), "real");
    await symlink(path.join(cwd, "real.txt"), path.join(cwd, "link.txt"));
    await symlink(
      path.join(cwd, "missing.txt"),
      path.join(cwd, "dangling.txt"),
    );
    await expect(
      applyComponentTransaction(cwd, [
        { path: "link.txt", content: Buffer.from("x"), expected: Buffer.from("real") },
      ]),
    ).rejects.toThrow(/symlink/i);
    await expect(
      applyComponentTransaction(cwd, [
        { path: "dangling.txt", content: Buffer.from("x"), expected: null },
      ]),
    ).rejects.toThrow(/symlink/i);

    const other = await makeRoot();
    await mkdir(path.join(other, "target"));
    await symlink(path.join(other, "target"), path.join(other, ".synthex"));
    await expect(
      applyComponentTransaction(other, [
        { path: ".synthex/components.json", content: validStateBytes(), expected: null },
      ]),
    ).rejects.toThrow(/symlink/i);
  });

  it("rolls back applied files on IO failure and keeps the backup", async () => {
    const cwd = await makeRoot();
    await writeFile(path.join(cwd, "one.txt"), "old-one");
    await writeFile(path.join(cwd, "two.txt"), "old-two");
    renameCtl.failOn.add(2);

    const mutations: readonly ComponentMutation[] = [
      { path: "one.txt", content: Buffer.from("new-one"), expected: Buffer.from("old-one") },
      { path: "two.txt", content: Buffer.from("new-two"), expected: Buffer.from("old-two") },
    ];
    const failure = await applyComponentTransaction(cwd, mutations).then(
      () => null,
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(CliError);
    expect(String((failure as Error).message)).toMatch(/backup/i);
    expect(await readFile(path.join(cwd, "one.txt"), "utf8")).toBe("old-one");
    expect(await readFile(path.join(cwd, "two.txt"), "utf8")).toBe("old-two");

    const details = (failure as CliError).details as
      | { backupDir?: string }
      | undefined;
    const backupDir = details?.backupDir;
    if (typeof backupDir !== "string") {
      throw new Error("expected backupDir in error details");
    }
    expect(await readFile(path.join(backupDir, "files", "one.txt"), "utf8")).toBe("old-one");
    expect(await readFile(path.join(backupDir, "files", "two.txt"), "utf8")).toBe("old-two");
  });

  it("uses snapshot raw as the state expected to avoid lost updates", async () => {
    const cwd = await makeRoot();
    await mkdir(path.join(cwd, ".synthex"), { recursive: true });
    await writeFile(path.join(cwd, ".synthex", "components.json"), validStateBytes());

    const snapshot = await readComponentStateSnapshot(cwd);
    if (snapshot.state === null || snapshot.raw === null) {
      throw new Error("expected an initial state");
    }
    const next = serializeComponentState({
      ...snapshot.state,
      requests: ["button"],
    });
    const result = await applyComponentTransaction(cwd, [
      { path: ".synthex/components.json", content: next, expected: snapshot.raw },
    ]);
    expect(typeof result.backupDir).toBe("string");
    expect(
      (await readFile(path.join(cwd, ".synthex", "components.json"))).equals(next),
    ).toBe(true);

    await expect(
      applyComponentTransaction(cwd, [
        {
          path: ".synthex/components.json",
          content: validStateBytes(),
          expected: snapshot.raw,
        },
      ]),
    ).rejects.toThrow(/concurrent/i);
  });

  it("aborts a later file changed mid-apply and rolls back the earlier file", async () => {
    const cwd = await makeRoot();
    await writeFile(path.join(cwd, "a.txt"), "old-a");
    await writeFile(path.join(cwd, "b.txt"), "old-b");
    renameCtl.onRename = async (call) => {
      if (call === 1) {
        await writeFile(path.join(cwd, "b.txt"), "mid-apply-edit");
      }
    };
    const failure = await applyComponentTransaction(cwd, [
      { path: "a.txt", content: Buffer.from("new-a"), expected: Buffer.from("old-a") },
      { path: "b.txt", content: Buffer.from("new-b"), expected: Buffer.from("old-b") },
    ]).then(
      () => null,
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(CliError);
    expect(String((failure as Error).message)).toMatch(/concurrent/i);
    expect(await readFile(path.join(cwd, "a.txt"), "utf8")).toBe("old-a");
    expect(await readFile(path.join(cwd, "b.txt"), "utf8")).toBe("mid-apply-edit");
    const details = (failure as CliError).details as
      | { backupDir?: string }
      | undefined;
    if (typeof details?.backupDir !== "string") {
      throw new Error("expected backupDir in error details");
    }
    expect(
      await readFile(path.join(details.backupDir, "files", "a.txt"), "utf8"),
    ).toBe("old-a");
    expect(await lockExists(cwd)).toBe(false);
  });

  it("rollback preserves a concurrent edit to an already-applied file", async () => {
    const cwd = await makeRoot();
    await writeFile(path.join(cwd, "one.txt"), "old-one");
    await writeFile(path.join(cwd, "two.txt"), "old-two");
    renameCtl.onRename = async (call) => {
      if (call === 2) {
        await writeFile(path.join(cwd, "one.txt"), "user-edit");
      }
    };
    renameCtl.failOn.add(2);
    const failure = await applyComponentTransaction(cwd, [
      { path: "one.txt", content: Buffer.from("new-one"), expected: Buffer.from("old-one") },
      { path: "two.txt", content: Buffer.from("new-two"), expected: Buffer.from("old-two") },
    ]).then(
      () => null,
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(CliError);
    const message = String((failure as Error).message);
    expect(message).toMatch(/restored 0 of 1/i);
    expect(message).toMatch(/not restored/i);
    expect(message).toMatch(/one\.txt/);
    expect(message).toMatch(/backup/i);
    expect(await readFile(path.join(cwd, "one.txt"), "utf8")).toBe("user-edit");
    expect(await readFile(path.join(cwd, "two.txt"), "utf8")).toBe("old-two");
    const details = (failure as CliError).details as
      | {
          backupDir?: string;
          restored?: string[];
          unrestored?: Array<{ path: string; message: string }>;
        }
      | undefined;
    expect(details?.restored).toEqual([]);
    expect(details?.unrestored?.map((entry) => entry.path)).toEqual(["one.txt"]);
    if (typeof details?.backupDir !== "string") {
      throw new Error("expected backupDir in error details");
    }
    expect(
      await readFile(path.join(details.backupDir, "files", "one.txt"), "utf8"),
    ).toBe("old-one");
    expect(await lockExists(cwd)).toBe(false);
  });

  it("an existing lock aborts without component writes and is never removed", async () => {
    const cwd = await makeRoot();
    await writeFile(path.join(cwd, "a.txt"), "keep-a");
    await mkdir(path.join(cwd, ".synthex"), { recursive: true });
    await writeFile(path.join(cwd, LOCK_REL), "foreign-token");
    const failure = await applyComponentTransaction(cwd, [
      { path: "a.txt", content: Buffer.from("new-a"), expected: Buffer.from("keep-a") },
    ]).then(
      () => null,
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(CliError);
    expect(String((failure as Error).message)).toMatch(
      /another component transaction holds/i,
    );
    expect(String((failure as Error).message)).toMatch(/never removed automatically/i);
    expect(await readFile(path.join(cwd, "a.txt"), "utf8")).toBe("keep-a");
    expect(await pathExists(path.join(cwd, ".synthex", "backups"))).toBe(false);
    expect(await readFile(path.join(cwd, LOCK_REL), "utf8")).toBe("foreign-token");
  });

  it("refuses symlink and dangling locks", async () => {
    const cwd = await makeRoot();
    await mkdir(path.join(cwd, ".synthex"), { recursive: true });
    await writeFile(path.join(cwd, "real.txt"), "real");
    await symlink(path.join(cwd, "real.txt"), path.join(cwd, LOCK_REL));
    await expect(
      applyComponentTransaction(cwd, [
        { path: "a.txt", content: Buffer.from("x"), expected: null },
      ]),
    ).rejects.toThrow(/symlink/i);

    const other = await makeRoot();
    await mkdir(path.join(other, ".synthex"), { recursive: true });
    await symlink(path.join(other, "missing.txt"), path.join(other, LOCK_REL));
    await expect(
      applyComponentTransaction(other, [
        { path: "a.txt", content: Buffer.from("x"), expected: null },
      ]),
    ).rejects.toThrow(/symlink/i);
  });

  it("a held lock serializes state updates: no overwrite off a stale snapshot", async () => {
    const cwd = await makeRoot();
    await mkdir(path.join(cwd, ".synthex"), { recursive: true });
    await writeFile(
      path.join(cwd, ".synthex", "components.json"),
      validStateBytes(),
    );
    const snapshot = await readComponentStateSnapshot(cwd);
    if (snapshot.state === null || snapshot.raw === null) {
      throw new Error("expected an initial state");
    }
    await writeFile(path.join(cwd, LOCK_REL), "other-pid:token");
    const next = serializeComponentState({
      ...snapshot.state,
      requests: ["button"],
    });
    const failure = await applyComponentTransaction(cwd, [
      { path: ".synthex/components.json", content: next, expected: snapshot.raw },
    ]).then(
      () => null,
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(CliError);
    expect(String((failure as Error).message)).toMatch(/another component transaction holds/i);
    expect(
      (await readFile(path.join(cwd, ".synthex", "components.json"))).equals(
        validStateBytes(),
      ),
    ).toBe(true);
  });

  it("releases the lock after success and after failure", async () => {
    const ok = await makeRoot();
    await writeFile(path.join(ok, "a.txt"), "x");
    await applyComponentTransaction(ok, [
      { path: "a.txt", content: Buffer.from("y"), expected: Buffer.from("x") },
    ]);
    expect(await lockExists(ok)).toBe(false);

    const bad = await makeRoot();
    await writeFile(path.join(bad, "a.txt"), "x");
    renameCtl.calls = 0;
    renameCtl.failOn.add(1);
    await expect(
      applyComponentTransaction(bad, [
        { path: "a.txt", content: Buffer.from("y"), expected: Buffer.from("x") },
      ]),
    ).rejects.toThrow(CliError);
    expect(await lockExists(bad)).toBe(false);
  });
});
