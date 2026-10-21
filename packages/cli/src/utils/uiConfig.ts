import { lstat, readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { CliError } from "./errors";
import type { Framework, PackageManager } from "./project";

export const UI_CONFIG_FILENAME = "synthex-ui.json";

export interface UiConfig {
  readonly version: 1;
  readonly framework: Framework;
  readonly packageManager: PackageManager;
  readonly componentsDir: string;
  readonly css: string | null;
  readonly provider: string;
}

const FRAMEWORKS: readonly string[] = ["vite", "next", "expo"];
const PACKAGE_MANAGERS: readonly string[] = ["npm", "pnpm", "yarn", "bun"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertSafeRelative(value: unknown, field: string, mustEndWith?: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new CliError(`Invalid synthex-ui.json: "${field}" must be a non-empty relative path.`);
  }
  if (value.includes("\0") || value.includes("\\")) {
    throw new CliError(`Invalid synthex-ui.json: "${field}" must be a posix-style relative path.`);
  }
  if (isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value) || value.startsWith("/")) {
    throw new CliError(`Invalid synthex-ui.json: "${field}" must not be absolute.`);
  }
  const segments = value.split("/");
  for (const segment of segments) {
    if (segment === "" || segment === "." || segment === "..") {
      throw new CliError(`Invalid synthex-ui.json: "${field}" must not contain empty, ".", or ".." segments.`);
    }
  }
  const normalized = segments.join("/");
  if (normalized === "." || normalized === ".." || normalized.startsWith("../")) {
    throw new CliError(`Invalid synthex-ui.json: "${field}" escapes the project directory.`);
  }
  if (mustEndWith !== undefined && !normalized.endsWith(mustEndWith)) {
    throw new CliError(`Invalid synthex-ui.json: "${field}" must end with "${mustEndWith}".`);
  }
  return normalized;
}

function resolveInside(cwdResolved: string, rel: string, field: string): string {
  const abs = resolve(cwdResolved, rel);
  const relBack = relative(cwdResolved, abs);
  if (relBack === "" || relBack.startsWith("..") || isAbsolute(relBack)) {
    throw new CliError(`Invalid synthex-ui.json: "${field}" escapes the project directory.`);
  }
  return abs;
}

async function safeRealpath(target: string): Promise<string> {
  try {
    return await realpath(target);
  } catch {
    return target;
  }
}

async function assertNoEscapingSymlink(
  cwdResolved: string,
  abs: string,
  field: string,
): Promise<void> {
  let current: string | null = abs;
  let probe: string | null = null;
  while (current !== null) {
    try {
      await lstat(current);
      probe = current;
      break;
    } catch {
      if (current === cwdResolved) {
        break;
      }
      const parent = dirname(current);
      if (parent === current) {
        break;
      }
      const relUp = relative(cwdResolved, parent);
      if (relUp.startsWith("..") || isAbsolute(relUp)) {
        break;
      }
      current = parent;
    }
  }
  if (probe === null) {
    return;
  }
  let probeReal: string;
  try {
    probeReal = await realpath(probe);
  } catch {
    throw new CliError(
      `Invalid synthex-ui.json: "${field}" cannot be resolved (broken symlink or unreadable path).`,
    );
  }
  const cwdReal = await safeRealpath(cwdResolved);
  if (probeReal === cwdReal) {
    return;
  }
  const rel = relative(cwdReal, probeReal);
  if (rel === "" || rel.startsWith("..") || isAbsolute(rel)) {
    throw new CliError(
      `Invalid synthex-ui.json: "${field}" resolves through a symlink outside the project.`,
    );
  }
}

export async function assertSafeConfigPath(cwd: string): Promise<string> {
  const cwdResolved = resolve(cwd);
  const configPath = resolve(cwdResolved, UI_CONFIG_FILENAME);
  await assertNoEscapingSymlink(cwdResolved, configPath, UI_CONFIG_FILENAME);
  return configPath;
}

export async function assertSafeUiConfigPaths(cwd: string, config: UiConfig): Promise<void> {
  const cwdResolved = resolve(cwd);
  await assertSafeConfigPath(cwdResolved);
  const componentsAbs = resolveInside(cwdResolved, config.componentsDir, "componentsDir");
  const providerAbs = resolveInside(cwdResolved, config.provider, "provider");
  const cssAbs = config.css === null ? null : resolveInside(cwdResolved, config.css, "css");
  if (providerAbs === componentsAbs || cssAbs === componentsAbs || (cssAbs !== null && cssAbs === providerAbs)) {
    throw new CliError("Invalid synthex-ui.json: componentsDir, css, and provider must not overlap.");
  }
  if (isInsideDir(componentsAbs, providerAbs)) {
    throw new CliError('Invalid synthex-ui.json: "provider" must not live inside "componentsDir".');
  }
  if (cssAbs !== null && isInsideDir(componentsAbs, cssAbs)) {
    throw new CliError('Invalid synthex-ui.json: "css" must not live inside "componentsDir".');
  }
  await assertNoEscapingSymlink(cwdResolved, componentsAbs, "componentsDir");
  await assertNoEscapingSymlink(cwdResolved, providerAbs, "provider");
  if (cssAbs !== null) {
    await assertNoEscapingSymlink(cwdResolved, cssAbs, "css");
  }
}

function isInsideDir(dirAbs: string, fileAbs: string): boolean {
  const rel = relative(dirAbs, fileAbs);
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
}

export function validateUiConfig(data: unknown): UiConfig {
  if (!isRecord(data)) {
    throw new CliError("Invalid synthex-ui.json: expected a JSON object.");
  }
  if (data["version"] !== 1) {
    throw new CliError('Invalid synthex-ui.json: "version" must be 1.');
  }
  if (typeof data["framework"] !== "string" || !FRAMEWORKS.includes(data["framework"])) {
    throw new CliError('Invalid synthex-ui.json: "framework" must be one of: vite, next, expo.');
  }
  if (typeof data["packageManager"] !== "string" || !PACKAGE_MANAGERS.includes(data["packageManager"])) {
    throw new CliError('Invalid synthex-ui.json: "packageManager" must be one of: npm, pnpm, yarn, bun.');
  }
  const framework = data["framework"] as Framework;
  const componentsDir = assertSafeRelative(data["componentsDir"], "componentsDir");
  if (componentsDir === ".") {
    throw new CliError('Invalid synthex-ui.json: "componentsDir" must not be the project root.');
  }
  let css: string | null;
  if (data["css"] === null) {
    css = null;
  } else {
    css = assertSafeRelative(data["css"], "css", ".css");
  }
  if (framework === "expo" && css !== null) {
    throw new CliError('Invalid synthex-ui.json: "css" must be null for the expo framework.');
  }
  if (framework !== "expo" && css === null) {
    throw new CliError(`Invalid synthex-ui.json: "css" must be a CSS path for the ${framework} framework.`);
  }
  const provider = assertSafeRelative(data["provider"], "provider", ".tsx");
  return {
    version: 1,
    framework,
    packageManager: data["packageManager"] as PackageManager,
    componentsDir,
    css,
    provider,
  };
}

export async function readUiConfig(cwd: string): Promise<UiConfig | null> {
  const cwdResolved = resolve(cwd);
  const configPath = await assertSafeConfigPath(cwdResolved);
  let raw: string;
  try {
    raw = await readFile(configPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException | null)?.code === "ENOENT") {
      return null;
    }
    throw new CliError(
      `Cannot read synthex-ui.json in "${cwdResolved}": ${(error as Error)?.message ?? String(error)}`,
    );
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new CliError(`Invalid synthex-ui.json in "${cwdResolved}": the file must contain valid JSON.`);
  }
  const config = validateUiConfig(data);
  await assertSafeUiConfigPaths(cwdResolved, config);
  return config;
}
