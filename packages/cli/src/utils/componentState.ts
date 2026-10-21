import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { CliError } from "./errors";
import type {
  ComponentState,
  InstalledComponentFile,
  RegistryComponentFile,
} from "./componentTypes";

/** POSIX-relative path of the component state file inside a project. */
export const COMPONENT_STATE_REL_POSIX = ".synthex/components.json";

/** POSIX-relative prefix under which the parent writes conflict artifacts. */
export const COMPONENT_CONFLICTS_REL_POSIX = ".synthex/conflicts";

const CONFLICT_SIDES = new Set(["base", "local", "incoming"]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Whether `relativePosix` is a permitted `.synthex` metadata path when
 * `allowState` is set: the state JSON itself, or a conflict artifact
 * (`manifest.json` or `<side>/<project path>` under a conflict id dir)
 * written by the parent's conflict writer. Anything else under `.synthex`
 * stays reserved.
 */
function isAllowedStateMetaPosix(relativePosix: string): boolean {
  if (relativePosix === COMPONENT_STATE_REL_POSIX) {
    return true;
  }
  const segments = relativePosix.split("/");
  if (!relativePosix.startsWith(`${COMPONENT_CONFLICTS_REL_POSIX}/`)) {
    return false;
  }
  const id = segments[2];
  if (id === undefined || !UUID_RE.test(id)) {
    return false;
  }
  const rest = segments.slice(3);
  if (rest.length === 1 && rest[0] === "manifest.json") {
    return true;
  }
  if (rest.length >= 2 && CONFLICT_SIDES.has(rest[0] as string)) {
    const inner = rest.slice(1);
    if (
      inner.some(
        (segment) =>
          segment.length === 0 ||
          segment === "." ||
          segment === ".." ||
          segment === ".synthex",
      )
    ) {
      return false;
    }
    return true;
  }
  return false;
}

export interface ComponentStateSnapshot {
  readonly state: ComponentState | null;
  readonly raw: Buffer | null;
}

export interface AssertSafeComponentPathOptions {
  readonly allowState?: boolean;
}

const PROTOTYPE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const SHA256_HEX = /^[0-9a-f]{64}$/;

function fail(message: string, details?: unknown): never {
  throw new CliError(message, 1, details);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertNoPrototypeKey(key: string, where: string): void {
  if (PROTOTYPE_KEYS.has(key)) {
    fail(`Invalid component state: forbidden key "${key}" in ${where}.`, {
      where,
      key,
    });
  }
}

function rejectBackslash(value: string, what: string): void {
  if (value.includes("\\")) {
    fail(`Invalid ${what} "${value}". Backslashes are not allowed; use POSIX "/" separators.`, {
      value,
    });
  }
}

function rejectNullByte(value: string, what: string): void {
  if (value.includes("\0")) {
    fail(`Invalid ${what}: path contains a null byte.`, { value });
  }
}

function isAbsolutePosixOrWin(value: string): boolean {
  return (
    path.posix.isAbsolute(value) ||
    path.win32.isAbsolute(value) ||
    /^[a-zA-Z]:[\\/]/.test(value) ||
    value.startsWith("\\\\")
  );
}

function splitPosixSegments(value: string, what: string): string[] {
  rejectNullByte(value, what);
  rejectBackslash(value, what);
  if (value.length === 0) {
    fail(`Invalid ${what}: path must not be empty.`, { value });
  }
  if (isAbsolutePosixOrWin(value)) {
    fail(`Invalid ${what} "${value}". Path must be relative, not absolute.`, {
      value,
    });
  }
  const segments = value.split("/");
  for (const segment of segments) {
    if (segment.length === 0) {
      fail(
        `Invalid ${what} "${value}". Empty segments ("//", leading or trailing "/") are not allowed.`,
        { value },
      );
    }
    if (segment === "." || segment === "..") {
      fail(`Invalid ${what} "${value}". "." and ".." segments are not allowed.`, {
        value,
      });
    }
  }
  return segments;
}

function isReservedSynthexPosix(relativePosix: string): boolean {
  return relativePosix === ".synthex" || relativePosix.startsWith(".synthex/");
}

function containsReservedSynthexSegment(segments: readonly string[]): boolean {
  return segments.includes(".synthex");
}

/**
 * Validate a project-relative file path lexically (no filesystem access).
 * Rejects absolute/empty/backslash/dot segments and reserved `.synthex`
 * entries unless `allowReserved` is true.
 */
function assertValidProjectFilePosix(
  value: unknown,
  what: string,
  allowReserved: boolean,
): string {
  if (typeof value !== "string") {
    fail(`Invalid ${what}: expected a string path.`, { value });
  }
  const text = value as string;
  const segments = splitPosixSegments(text, what);
  if (!allowReserved) {
    if (isReservedSynthexPosix(text) || containsReservedSynthexSegment(segments)) {
      fail(
        `Invalid ${what} "${text}". Paths under ".synthex" are reserved for component state.`,
        { value: text },
      );
    }
  }
  return text;
}

/** Validate `destinationRoot`: a relative POSIX directory path. File checks are separate. */
export function validateDestinationRoot(value: unknown): string {
  if (typeof value !== "string") {
    fail("Invalid component state: \"destinationRoot\" must be a string.", {
      value,
    });
  }
  const text = value as string;
  const segments = splitPosixSegments(text, "destinationRoot");
  if (containsReservedSynthexSegment(segments)) {
    fail(
      `Invalid component state: "destinationRoot" "${text}" must not point inside ".synthex".`,
      { value: text },
    );
  }
  return text;
}

/**
 * Require a state file record to live under
 * `destinationRoot/<component>/...` (at least one path segment below the
 * component dir). A record that is merely project-relative (e.g. `README.md`)
 * or that points at `.synthex` must never validate.
 */
function assertFileUnderDestinationRoot(
  key: string,
  component: string,
  destinationRoot: string,
): void {
  const destSegments = destinationRoot.split("/");
  const keySegments = key.split("/");
  if (keySegments.length < destSegments.length + 2) {
    fail(
      `Invalid component state: file "${key}" must live under "${destinationRoot}/${component}/...".`,
      { path: key },
    );
  }
  for (let index = 0; index < destSegments.length; index += 1) {
    if (keySegments[index] !== destSegments[index]) {
      fail(
        `Invalid component state: file "${key}" must live under "${destinationRoot}/${component}/...".`,
        { path: key },
      );
    }
  }
  if (keySegments[destSegments.length] !== component) {
    fail(
      `Invalid component state: file "${key}" must live under "${destinationRoot}/${component}/...".`,
      { path: key },
    );
  }
}

function validatePlatform(value: unknown): ComponentState["platform"] {
  if (value === null || value === "web" || value === "native") {
    return value;
  }
  fail("Invalid component state: \"platform\" must be \"web\", \"native\" or null.", {
    value,
  });
}

function validateRequests(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    fail("Invalid component state: \"requests\" must be an array of strings.", {
      value,
    });
  }
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || entry.length === 0 || entry.includes("\0")) {
      fail("Invalid component state: every \"requests\" entry must be a non-empty string.", {
        value: entry,
      });
    }
    out.push(entry);
  }
  return out;
}

function isStrictBase64(value: string): boolean {
  if (value.length % 4 !== 0) {
    return false;
  }
  if (value.length > 0 && !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    return false;
  }
  if (/=/.test(value) && !/==?$/.test(value.replace(/=+$/, (m) => m))) {
    return false;
  }
  try {
    const decoded = Buffer.from(value, "base64");
    return decoded.toString("base64") === value;
  } catch {
    return false;
  }
}

function validateInstalledFile(
  key: string,
  value: unknown,
  destinationRoot: string,
): InstalledComponentFile {
  if (!isRecord(value)) {
    fail(`Invalid component state: file "${key}" must be an object.`, {
      path: key,
      value,
    });
  }
  const allowed = new Set([
    "component",
    "path",
    "source",
    "registryVersion",
    "base",
    "sha256",
  ]);
  for (const own of Object.keys(value)) {
    assertNoPrototypeKey(own, `file "${key}"`);
    if (!allowed.has(own)) {
      fail(`Invalid component state: file "${key}" has unknown field "${own}".`, {
        path: key,
        field: own,
      });
    }
  }
  const entry = value as Record<string, unknown>;

  const component = entry["component"];
  if (
    typeof component !== "string" ||
    component.length === 0 ||
    component.includes("\0") ||
    component.includes("/") ||
    component.includes("\\")
  ) {
    fail(`Invalid component state: file "${key}" has an invalid "component" name.`, {
      path: key,
      value: component,
    });
  }

  const entryPath = entry["path"];
  if (entryPath !== key) {
    fail(
      `Invalid component state: file key "${key}" does not match entry path "${String(entryPath)}".`,
      { path: key, entryPath },
    );
  }
  assertValidProjectFilePosix(entryPath, `file "${key}" path`, false);
  assertFileUnderDestinationRoot(key, component as string, destinationRoot);

  const source = entry["source"];
  if (typeof source !== "string" || source.length === 0 || source.includes("\0")) {
    fail(`Invalid component state: file "${key}" has an invalid "source".`, {
      path: key,
      value: source,
    });
  }

  const registryVersion = entry["registryVersion"];
  if (typeof registryVersion !== "string" && registryVersion !== null) {
    fail(
      `Invalid component state: file "${key}" "registryVersion" must be a string or null.`,
      { path: key, value: registryVersion },
    );
  }

  const base = entry["base"];
  if (typeof base !== "string" || !isStrictBase64(base)) {
    fail(`Invalid component state: file "${key}" has invalid base64 "base".`, {
      path: key,
    });
  }
  const sha256 = entry["sha256"];
  if (typeof sha256 !== "string" || !SHA256_HEX.test(sha256)) {
    fail(`Invalid component state: file "${key}" has an invalid "sha256" (expected 64 lowercase hex).`, {
      path: key,
      value: sha256,
    });
  }
  const decoded = Buffer.from(base, "base64");
  const actual = createHash("sha256").update(decoded).digest("hex");
  if (actual !== sha256) {
    fail(`Invalid component state: file "${key}" sha256 does not match "base" bytes.`, {
      path: key,
    });
  }

  return {
    component: component as string,
    path: key,
    source: source as string,
    registryVersion: registryVersion as string | null,
    base: base as string,
    sha256: sha256 as string,
  };
}

/**
 * Validate unknown JSON as `ComponentState`.
 * Performs schema, base64/hash and lexical project-containment validation.
 * Every file record must satisfy `key === record.path` and live under
 * `destinationRoot/<component>/...`; `.synthex` records and prototype keys
 * are rejected. Filesystem symlink checks are done by
 * `assertSafeComponentPath`, not here.
 */
export function validateComponentState(value: unknown): ComponentState {
  if (!isRecord(value)) {
    fail("Invalid component state: expected a JSON object.", { value });
  }
  for (const own of Object.keys(value)) {
    assertNoPrototypeKey(own, "component state");
  }
  const allowedTop = new Set([
    "version",
    "destinationRoot",
    "platform",
    "requests",
    "files",
  ]);
  for (const own of Object.keys(value)) {
    if (!allowedTop.has(own)) {
      fail(`Invalid component state: unknown field "${own}".`, { field: own });
    }
  }

  if (value["version"] !== 1) {
    fail("Invalid component state: \"version\" must be 1.", {
      value: value["version"],
    });
  }
  const destinationRoot = validateDestinationRoot(value["destinationRoot"]);
  const platform = validatePlatform(value["platform"]);
  const requests = validateRequests(value["requests"]);

  const filesValue = value["files"];
  if (!isRecord(filesValue)) {
    fail("Invalid component state: \"files\" must be an object.", {
      value: filesValue,
    });
  }
  const files: Record<string, InstalledComponentFile> = {};
  const seen = new Set<string>();
  for (const key of Object.keys(filesValue)) {
    assertNoPrototypeKey(key, "component state \"files\"");
    assertValidProjectFilePosix(key, `file "${key}"`, false);
    if (seen.has(key)) {
      fail(`Invalid component state: duplicate file entry "${key}".`, {
        path: key,
      });
    }
    seen.add(key);
    files[key] = validateInstalledFile(key, filesValue[key], destinationRoot);
  }

  return {
    version: 1,
    destinationRoot,
    platform,
    requests,
    files,
  };
}

/** Serialize validated state to canonical UTF-8 JSON bytes (2-space indent + newline). */
export function serializeComponentState(state: unknown): Buffer {
  const valid = validateComponentState(state);
  const sortedFiles: Record<string, InstalledComponentFile> = {};
  for (const key of Object.keys(valid.files).sort()) {
    const entry = valid.files[key];
    if (entry !== undefined) {
      sortedFiles[key] = entry;
    }
  }
  const canonical = {
    version: 1 as const,
    destinationRoot: valid.destinationRoot,
    platform: valid.platform,
    requests: [...valid.requests],
    files: sortedFiles,
  };
  return Buffer.from(`${JSON.stringify(canonical, null, 2)}\n`, "utf8");
}

/**
 * Build an `InstalledComponentFile` from registry bytes.
 * Derives the project-relative POSIX `path` from `file.destination`
 * contained in `cwd`, and records base64 original bytes plus sha256.
 */
export function createInstalledFile(
  file: RegistryComponentFile,
  cwd: string,
): InstalledComponentFile {
  if (typeof cwd !== "string" || cwd.length === 0) {
    fail("Invalid cwd: expected a non-empty string.", { cwd });
  }
  if (
    !isRecord(file as unknown as Record<string, unknown>) ||
    typeof (file as RegistryComponentFile).component !== "string" ||
    typeof (file as RegistryComponentFile).destination !== "string" ||
    typeof (file as RegistryComponentFile).source !== "string"
  ) {
    fail("Invalid registry file: expected component/destination/source strings.", {
      file,
    });
  }
  if (!Buffer.isBuffer((file as RegistryComponentFile).content)) {
    fail("Invalid registry file: \"content\" must be a Buffer.", {
      component: (file as RegistryComponentFile).component,
    });
  }
  const registryVersion = (file as RegistryComponentFile).registryVersion;
  if (typeof registryVersion !== "string" && registryVersion !== null) {
    fail("Invalid registry file: \"registryVersion\" must be a string or null.", {
      component: (file as RegistryComponentFile).component,
    });
  }
  if (
    (file as RegistryComponentFile).component.length === 0 ||
    (file as RegistryComponentFile).source.length === 0
  ) {
    fail("Invalid registry file: component and source must be non-empty.", {
      file,
    });
  }

  const cwdResolved = path.resolve(cwd);
  const destination = (file as RegistryComponentFile).destination;
  rejectNullByte(destination, "destination");
  if (destination.includes("\\")) {
    fail(`Invalid destination "${destination}". Backslashes are not allowed.`, {
      destination,
    });
  }
  const absolute = path.isAbsolute(destination)
    ? path.resolve(destination)
    : path.resolve(cwdResolved, destination);
  const relative = path.relative(cwdResolved, absolute);
  if (
    relative === "" ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    fail(`Invalid destination "${destination}". Path must resolve inside the project.`, {
      destination,
      cwd: cwdResolved,
    });
  }
  const posixPath = relative.split(path.sep).join("/");
  assertValidProjectFilePosix(posixPath, "installed file path", false);

  const content = (file as RegistryComponentFile).content;
  return {
    component: (file as RegistryComponentFile).component,
    path: posixPath,
    source: (file as RegistryComponentFile).source,
    registryVersion: registryVersion as string | null,
    base: (content as Buffer).toString("base64"),
    sha256: createHash("sha256").update(content as Buffer).digest("hex"),
  };
}

/**
 * Resolve `relativePath` against `cwd` and reject anything unsafe.
 *
 * Rejects: empty/non-string, absolute, backslash, null bytes, empty or
 * "." / ".." segments, lexically escaping paths, reserved `.synthex`
 * paths (with `allowState`, only the state JSON and conflict artifacts
 * under `.synthex/conflicts/<uuid>/` are permitted), every symlink
 * segment (including dangling symlinks, via lstat), intermediate
 * non-directories, and existing directories at the final file path.
 *
 * Returns the absolute target path. Missing finals are allowed.
 */
export async function assertSafeComponentPath(
  cwd: string,
  relativePath: string,
  options: AssertSafeComponentPathOptions = {},
): Promise<string> {
  if (typeof cwd !== "string" || cwd.length === 0) {
    fail("Invalid cwd: expected a non-empty string.", { cwd });
  }
  if (typeof relativePath !== "string") {
    fail("Invalid component path: expected a string.", { relativePath });
  }
  const allowState = options.allowState === true;
  const segments = splitPosixSegments(relativePath, "component path");
  if (
    isReservedSynthexPosix(relativePath) ||
    containsReservedSynthexSegment(segments)
  ) {
    if (!allowState || !isAllowedStateMetaPosix(relativePath)) {
      fail(
        `Refusing reserved path "${relativePath}". Paths under ".synthex" are managed internally.`,
        { path: relativePath },
      );
    }
  }

  const cwdResolved = path.resolve(cwd);
  const absolute = path.resolve(cwdResolved, ...segments);
  const trailing = path.relative(cwdResolved, absolute);
  if (trailing === "" || trailing.startsWith("..") || path.isAbsolute(trailing)) {
    fail(`Refusing escaping path "${relativePath}". Path must stay inside the project.`, {
      path: relativePath,
      cwd: cwdResolved,
    });
  }

  for (let index = 0; index < segments.length; index += 1) {
    const prefix = path.join(cwdResolved, ...segments.slice(0, index + 1));
    const isFinal = index === segments.length - 1;
    let stats: Awaited<ReturnType<typeof lstat>> | null = null;
    try {
      stats = await lstat(prefix);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException | null)?.code;
      if (code === "ENOENT") {
        if (isFinal) {
          return absolute;
        }
        return absolute;
      }
      fail(`Cannot inspect "${relativePath}": ${(error as Error)?.message ?? String(error)}.`, {
        path: relativePath,
        prefix,
      });
    }
    if (stats !== null && stats.isSymbolicLink()) {
      fail(`Refusing symlink "${relativePath}". Symlinks are not followed (segment ${index + 1}).`, {
        path: relativePath,
        segment: segments[index],
      });
    }
    if (!isFinal) {
      if (stats !== null && !stats.isDirectory()) {
        fail(
          `Refusing "${relativePath}": "${segments.slice(0, index + 1).join("/")}" exists and is not a directory.`,
          { path: relativePath },
        );
      }
    } else {
      if (stats !== null) {
        if (stats.isDirectory()) {
          fail(`Refusing "${relativePath}": path is a directory, expected a file.`, {
            path: relativePath,
          });
        }
        if (!stats.isFile()) {
          fail(`Refusing "${relativePath}": not a regular file.`, {
            path: relativePath,
          });
        }
      }
    }
  }
  return absolute;
}

function stateAbsPath(cwd: string): Promise<string> {
  return assertSafeComponentPath(cwd, COMPONENT_STATE_REL_POSIX, {
    allowState: true,
  });
}

/**
 * Read and validate the SAME state bytes once, returning both the parsed
 * state and the exact raw bytes. Use `raw` as the `expected` bytes of the
 * `.synthex/components.json` mutation so concurrent updates cannot be
 * silently lost.
 */
export async function readComponentStateSnapshot(
  cwd: string,
): Promise<ComponentStateSnapshot> {
  const absolute = await stateAbsPath(cwd);
  let raw: Buffer;
  try {
    raw = await readFile(absolute);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException | null)?.code;
    if (code === "ENOENT") {
      return { state: null, raw: null };
    }
    fail(
      `Cannot read component state at ".synthex/components.json": ${(error as Error)?.message ?? String(error)}.`,
      { path: COMPONENT_STATE_REL_POSIX, code },
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse((raw as Buffer).toString("utf8"));
  } catch (error) {
    fail(
      `Invalid component state at ".synthex/components.json": file contains malformed JSON (${(error as Error)?.message ?? String(error)}). Delete the file to reset, or restore it from a backup.`,
      { path: COMPONENT_STATE_REL_POSIX },
    );
  }
  try {
    return { state: validateComponentState(parsed), raw: raw as Buffer };
  } catch (error) {
    if (error instanceof CliError) {
      error.message = `${error.message} (in ".synthex/components.json")`;
      throw error;
    }
    fail(`Invalid component state at ".synthex/components.json": ${(error as Error)?.message ?? String(error)}.`, {
      path: COMPONENT_STATE_REL_POSIX,
    });
  }
}

/**
 * Read `.synthex/components.json`, or `null` when absent.
 * Distinguishes missing (ENOENT -> null) from unreadable/malformed (throws).
 * Delegates to `readComponentStateSnapshot` so callers can reuse `raw`.
 */
export async function readComponentState(cwd: string): Promise<ComponentState | null> {
  const snapshot = await readComponentStateSnapshot(cwd);
  return snapshot.state;
}
