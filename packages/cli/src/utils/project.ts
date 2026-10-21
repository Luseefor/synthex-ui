import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { CliError } from "./errors";

export type Framework = "vite" | "next" | "expo";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export interface ProjectInfo {
  readonly cwd: string;
  readonly framework: Framework;
  readonly packageManager: PackageManager;
  readonly workspaceRoot: string | null;
  readonly srcDir: "src" | ".";
  readonly appDir: string | null;
}

export interface DetectProjectOptions {
  readonly cwd?: string;
  readonly framework?: Framework;
  readonly packageManager?: PackageManager;
}

const FRAMEWORKS: readonly Framework[] = ["vite", "next", "expo"];
const PACKAGE_MANAGERS: readonly PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

function isFramework(value: unknown): value is Framework {
  return typeof value === "string" && (FRAMEWORKS as readonly string[]).includes(value);
}

function isPackageManager(value: unknown): value is PackageManager {
  return typeof value === "string" && (PACKAGE_MANAGERS as readonly string[]).includes(value);
}

function assertValidFramework(value: unknown): asserts value is Framework | undefined {
  if (value === undefined) {
    return;
  }
  if (!isFramework(value)) {
    throw new CliError(
      `Invalid framework "${String(value)}". Expected one of: ${FRAMEWORKS.join(", ")}.`,
    );
  }
}

function assertValidPackageManager(value: unknown): asserts value is PackageManager | undefined {
  if (value === undefined) {
    return;
  }
  if (!isPackageManager(value)) {
    throw new CliError(
      `Invalid package manager "${String(value)}". Expected one of: ${PACKAGE_MANAGERS.join(", ")}.`,
    );
  }
}

function ancestorsFrom(start: string): string[] {
  const out: string[] = [];
  let current = resolve(start);
  for (;;) {
    out.push(current);
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return out;
}

function boundedAncestors(start: string): string[] {
  const chain = ancestorsFrom(start);
  const gitIndex = chain.findIndex((dir) => existsSync(join(dir, ".git")));
  if (gitIndex === -1) {
    return chain;
  }
  return chain.slice(0, gitIndex + 1);
}

async function isDirectory(dir: string): Promise<boolean> {
  try {
    return (await stat(dir)).isDirectory();
  } catch {
    return false;
  }
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(target: string): Promise<unknown> {
  const raw = await readFile(target, "utf8");
  return JSON.parse(raw);
}

function parsePackageManagerField(value: unknown): PackageManager | null {
  if (typeof value !== "string") {
    return null;
  }
  const name = value.split("@")[0]?.trim() ?? "";
  return isPackageManager(name) ? name : null;
}

const LOCKFILE_MANAGERS: Readonly<Record<string, PackageManager>> = {
  "package-lock.json": "npm",
  "pnpm-lock.yaml": "pnpm",
  "yarn.lock": "yarn",
  "bun.lockb": "bun",
  "bun.lock": "bun",
};

async function findNearestPackageManagerField(dirs: string[]): Promise<PackageManager | null> {
  for (const dir of dirs) {
    let parsed: unknown;
    try {
      parsed = await readJsonFile(join(dir, "package.json"));
    } catch {
      continue;
    }
    if (typeof parsed !== "object" || parsed === null) {
      continue;
    }
    const manager = parsePackageManagerField(
      (parsed as Record<string, unknown>)["packageManager"],
    );
    if (manager !== null) {
      return manager;
    }
  }
  return null;
}

async function findNearestLockfile(dirs: string[]): Promise<PackageManager | null> {
  const lockfiles = Object.keys(LOCKFILE_MANAGERS);
  for (const dir of dirs) {
    const found = new Set<PackageManager>();
    for (const lockfile of lockfiles) {
      if (await pathExists(join(dir, lockfile))) {
        found.add(LOCKFILE_MANAGERS[lockfile] as PackageManager);
      }
    }
    if (found.size > 1) {
      const sorted = [...found].sort();
      throw new CliError(
        `Ambiguous package manager in "${dir}": conflicting lockfiles for ${sorted.join(" and ")}. ` +
          `Remove the extra lockfile or pass an explicit package manager.`,
        1,
        { dir, managers: sorted },
      );
    }
    if (found.size === 1) {
      return [...found][0] as PackageManager;
    }
  }
  return null;
}

async function hasWorkspacesMarker(dir: string): Promise<boolean> {
  if (await pathExists(join(dir, "pnpm-workspace.yaml"))) {
    return true;
  }
  let parsed: unknown;
  try {
    parsed = await readJsonFile(join(dir, "package.json"));
  } catch {
    return false;
  }
  if (typeof parsed !== "object" || parsed === null) {
    return false;
  }
  const workspaces = (parsed as Record<string, unknown>)["workspaces"];
  return Array.isArray(workspaces) || (typeof workspaces === "object" && workspaces !== null);
}

async function findWorkspaceRoot(start: string): Promise<string | null> {
  for (const dir of boundedAncestors(start)) {
    if (await hasWorkspacesMarker(dir)) {
      return dir;
    }
  }
  return null;
}

function detectFrameworksFromDeps(manifest: Record<string, unknown>): Framework[] {
  const deps = {
    ...((manifest["dependencies"] as Record<string, unknown> | undefined) ?? {}),
    ...((manifest["devDependencies"] as Record<string, unknown> | undefined) ?? {}),
  };
  const found: Framework[] = [];
  if (typeof deps === "object" && deps !== null) {
    if (Object.prototype.hasOwnProperty.call(deps, "expo")) {
      found.push("expo");
    }
    if (Object.prototype.hasOwnProperty.call(deps, "next")) {
      found.push("next");
    }
    if (Object.prototype.hasOwnProperty.call(deps, "vite")) {
      found.push("vite");
    }
  }
  return found;
}

async function findConfigHints(cwd: string): Promise<string[]> {
  const candidates = [
    "vite.config.ts",
    "vite.config.js",
    "vite.config.mjs",
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "app.json",
    "app.config.js",
    "app.config.ts",
    "expo.json",
  ];
  const found: string[] = [];
  for (const candidate of candidates) {
    if (await pathExists(join(cwd, candidate))) {
      found.push(candidate);
    }
  }
  return found;
}

export async function detectPackageManager(
  cwd: string,
  override?: PackageManager,
): Promise<PackageManager> {
  assertValidPackageManager(override);
  if (override !== undefined) {
    return override;
  }
  const resolved = isAbsolute(cwd) ? cwd : resolve(process.cwd(), cwd);
  const dirs = boundedAncestors(resolved);
  const fromField = await findNearestPackageManagerField(dirs);
  if (fromField !== null) {
    return fromField;
  }
  const fromLock = await findNearestLockfile(dirs);
  return fromLock ?? "npm";
}

export function getInstallCommand(
  manager: PackageManager,
  packages: readonly string[],
  options?: { readonly dev?: boolean },
): string {
  assertValidPackageManager(manager);
  const list = packages.join(" ");
  const dev = options?.dev === true;
  switch (manager) {
    case "npm":
      return list === "" ? "npm install" : dev ? `npm install -D ${list}` : `npm install ${list}`;
    case "yarn":
      return list === "" ? "yarn install" : dev ? `yarn add -D ${list}` : `yarn add ${list}`;
    case "pnpm":
      return list === "" ? "pnpm install" : dev ? `pnpm add -D ${list}` : `pnpm add ${list}`;
    case "bun":
      return list === "" ? "bun install" : dev ? `bun add -d ${list}` : `bun add ${list}`;
  }
}

export function getRunCommand(manager: PackageManager, script: string): string {
  assertValidPackageManager(manager);
  if (typeof script !== "string" || script.trim() === "") {
    throw new CliError("A script name is required to build a run command.");
  }
  const name = script.trim();
  switch (manager) {
    case "npm":
      return `npm run ${name}`;
    case "yarn":
      return `yarn run ${name}`;
    case "pnpm":
      return `pnpm run ${name}`;
    case "bun":
      return `bun run ${name}`;
  }
}

export async function detectProject(
  options: DetectProjectOptions = {},
): Promise<ProjectInfo> {
  assertValidFramework(options.framework);
  assertValidPackageManager(options.packageManager);
  const cwd = resolve(options.cwd ?? process.cwd());
  const manifestPath = join(cwd, "package.json");

  if (!(await pathExists(manifestPath))) {
    throw new CliError(
      `No package.json found in "${cwd}". Run this command inside a project directory with a valid package.json.`,
      1,
      { cwd },
    );
  }

  let manifest: unknown;
  try {
    manifest = await readJsonFile(manifestPath);
  } catch {
    throw new CliError(
      `Invalid package.json in "${cwd}". The file must contain valid JSON.`,
      1,
      { path: manifestPath },
    );
  }
  if (typeof manifest !== "object" || manifest === null || Array.isArray(manifest)) {
    throw new CliError(`Invalid package.json in "${cwd}". Expected a JSON object.`, 1, {
      path: manifestPath,
    });
  }
  const record = manifest as Record<string, unknown>;

  let framework: Framework;
  if (options.framework !== undefined) {
    framework = options.framework;
  } else {
    const detected = detectFrameworksFromDeps(record);
    if (detected.length === 1) {
      framework = detected[0] as Framework;
    } else if (detected.length > 1) {
      throw new CliError(
        `Ambiguous project framework in "${cwd}": found ${detected.sort().join(" and ")} dependencies. ` +
          `Pass an explicit framework (one of: ${FRAMEWORKS.join(", ")}).`,
        1,
        { cwd, detected: detected.sort() },
      );
    } else {
      const hints = await findConfigHints(cwd);
      const hintText =
        hints.length > 0
          ? ` Found config files (${hints.join(", ")}) but config files alone are not enough.`
          : "";
      throw new CliError(
        `Could not detect a supported framework in "${cwd}". ` +
          `Add one of "vite", "next", or "expo" to dependencies or devDependencies.` +
          hintText,
        1,
        { cwd, hints },
      );
    }
  }

  let appDir: string | null = null;
  if (framework === "next") {
    if (await isDirectory(join(cwd, "app"))) {
      appDir = "app";
    } else if (await isDirectory(join(cwd, "src", "app"))) {
      appDir = join("src", "app");
    } else {
      const hasPages = await isDirectory(join(cwd, "pages"));
      const pagesNote = hasPages
        ? ` Found a "pages/" directory (Pages Router), which is not supported.`
        : "";
      throw new CliError(
        `Next.js project in "${cwd}" does not use the App Router.${pagesNote} ` +
          `Create an "app/" or "src/app/" directory with App Router routes.`,
        1,
        { cwd },
      );
    }
  }

  const srcDir: "src" | "." = (await isDirectory(join(cwd, "src"))) ? "src" : ".";
  const workspaceRoot = await findWorkspaceRoot(cwd);
  const packageManager = await detectPackageManager(cwd, options.packageManager);

  return { cwd, framework, packageManager, workspaceRoot, srcDir, appDir };
}
