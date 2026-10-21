import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Command } from "commander";
import { CliError } from "../utils/errors";
import { logger } from "../utils/logger";
import { getDefaultRegistryRoot } from "./list";

export type AddFileStatus = "written" | "overwritten" | "planned" | "skipped-existing";

export interface AddFileEntry {
  readonly component: string;
  /** Path relative to the component source dir (e.g. "button.web.tsx"). */
  readonly relativePath: string;
  readonly source: string;
  readonly destination: string;
  readonly status: AddFileStatus;
}

export interface AddManifest {
  readonly components: readonly string[];
  readonly cwd: string;
  readonly destinationRoot: string;
  readonly dryRun: boolean;
  readonly overwrite: boolean;
  readonly files: readonly AddFileEntry[];
}

export interface AddComponentsOptions {
  readonly cwd?: string;
  readonly overwrite?: boolean;
  readonly dryRun?: boolean;
  readonly registryRoot?: string;
}

interface ResolvedAddOptions {
  cwd: string;
  overwrite: boolean;
  dryRun: boolean;
  registryRoot: string;
}

interface AddCommandCliOptions {
  cwd?: string;
  overwrite?: boolean;
  dryRun?: boolean;
}

export interface RegistryReference {
  readonly registry: string;
  readonly component: string;
}

export function isUrlSpec(spec: string): boolean {
  return spec.startsWith("http://") || spec.startsWith("https://") || spec.startsWith("data:");
}

export function isRegistrySpec(spec: string): boolean {
  return spec.startsWith("@");
}

export function parseRegistryReference(spec: string): RegistryReference {
  if (!spec.startsWith("@")) {
    throw new CliError(`Invalid registry reference "${spec}". Expected "@<registry>/<component>".`);
  }

  const stripped = spec.slice(1);

  if (stripped.length === 0) {
    throw new CliError(`Invalid registry reference "${spec}". Expected "@<registry>/<component>".`);
  }

  const slashIndex = stripped.indexOf("/");

  if (slashIndex === -1) {
    validateComponentName(stripped);
    return { registry: "default", component: stripped };
  }

  const registry = stripped.slice(0, slashIndex);
  const component = stripped.slice(slashIndex + 1);

  if (registry.length === 0 || component.length === 0 || component.includes("/")) {
    throw new CliError(`Invalid registry reference "${spec}". Expected "@<registry>/<component>".`);
  }

  validateComponentName(component);

  return { registry, component };
}

export async function addComponents(
  components: readonly string[],
  options: AddComponentsOptions = {},
): Promise<AddManifest> {
  if (components.length === 0) {
    throw new CliError('Specify at least one component. Run "synthex list" to see available components.');
  }

  const resolved: ResolvedAddOptions = {
    cwd: path.resolve(options.cwd ?? process.cwd()),
    overwrite: options.overwrite ?? false,
    dryRun: options.dryRun ?? false,
    registryRoot: options.registryRoot ?? getDefaultRegistryRoot(),
  };

  const destinationRoot = path.join(resolved.cwd, "components", "ui");
  const files: AddFileEntry[] = [];
  const conflicts: string[] = [];

  for (const spec of components) {
    if (isUrlSpec(spec)) {
      await addRemoteUrl(spec, resolved, destinationRoot, files, conflicts);
      continue;
    }

    if (isRegistrySpec(spec)) {
      const ref = parseRegistryReference(spec);
      await addLocalComponent(ref.component, resolved, destinationRoot, files, conflicts);
      continue;
    }

    await addLocalComponent(spec, resolved, destinationRoot, files, conflicts);
  }

  if (conflicts.length > 0) {
    throw new CliError(
      `Refusing to overwrite ${conflicts.length} existing file(s). Re-run with --overwrite.`,
      1,
      { files: conflicts },
    );
  }

  await maybeLogInstallHint(components, resolved);

  return {
    components: [...components],
    cwd: resolved.cwd,
    destinationRoot,
    dryRun: resolved.dryRun,
    overwrite: resolved.overwrite,
    files,
  };
}

export function registerAddCommand(program: Command): void {
  program
    .command("add")
    .description("Copy components from the local registry, a registry reference (@<registry>/<name>), or a URL into the project.")
    .argument("<component...>", "Component names (e.g. button), @<registry>/<name> refs, or http(s) URLs to JSON manifests")
    .option("--cwd <dir>", "Target project directory")
    .option("--overwrite", "Overwrite existing files", false)
    .option("--dry-run", "List files without writing", false)
    .action(async (componentInput: string[], cliOptions: AddCommandCliOptions) => {
      const manifest = await addComponents(componentInput, {
        cwd: cliOptions.cwd,
        overwrite: cliOptions.overwrite,
        dryRun: cliOptions.dryRun,
      });

      process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);

      if (manifest.dryRun) {
        logger.info(`Dry run: ${manifest.files.length} file(s) would be copied.`);
      } else {
        logger.success(`Added ${manifest.components.join(", ")}.`);
      }
    });
}

async function addLocalComponent(
  component: string,
  resolved: ResolvedAddOptions,
  destinationRoot: string,
  files: AddFileEntry[],
  conflicts: string[],
): Promise<void> {
  validateComponentName(component);
  const sourceDir = path.join(resolved.registryRoot, component);
  await assertComponentDir(sourceDir, component);

  const relativePaths = await collectRelativeFiles(sourceDir);

  if (relativePaths.length === 0) {
    throw new CliError(`Component "${component}" has no files to copy.`);
  }

  for (const relativePath of relativePaths) {
    const source = path.join(sourceDir, relativePath);
    const destination = path.join(destinationRoot, component, relativePath);
    const exists = await pathExists(destination);

    if (resolved.dryRun) {
      files.push({
        component,
        relativePath,
        source,
        destination,
        status: exists && !resolved.overwrite ? "skipped-existing" : "planned",
      });
      continue;
    }

    if (exists && !resolved.overwrite) {
      conflicts.push(destination);
      continue;
    }

    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
    files.push({
      component,
      relativePath,
      source,
      destination,
      status: exists ? "overwritten" : "written",
    });
  }
}

async function addRemoteUrl(
  url: string,
  resolved: ResolvedAddOptions,
  destinationRoot: string,
  files: AddFileEntry[],
  conflicts: string[],
): Promise<void> {
  const manifest = await fetchRemoteManifest(url);
  const component = manifest.name ?? deriveComponentNameFromUrl(url) ?? "remote";
  validateComponentName(component);

  const entries = Object.entries(manifest.files);

  if (entries.length === 0) {
    throw new CliError(`Remote component from "${url}" has no files to copy.`);
  }

  for (const [rawPath, content] of entries) {
    const relativePath = sanitizeRelativePath(rawPath);
    const source = `${url}#${relativePath}`;
    const destination = path.join(destinationRoot, component, relativePath);
    const exists = await pathExists(destination);

    if (resolved.dryRun) {
      files.push({
        component,
        relativePath,
        source,
        destination,
        status: exists && !resolved.overwrite ? "skipped-existing" : "planned",
      });
      continue;
    }

    if (exists && !resolved.overwrite) {
      conflicts.push(destination);
      continue;
    }

    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, content, "utf8");
    files.push({
      component,
      relativePath,
      source,
      destination,
      status: exists ? "overwritten" : "written",
    });
  }
}

async function fetchRemoteManifest(url: string): Promise<{ name: string | null; files: Record<string, string> }> {
  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new CliError(`Failed to fetch component from "${url}": ${(error as Error).message}`);
  }

  if (!response.ok) {
    throw new CliError(`Failed to fetch component from "${url}" (HTTP ${response.status}).`);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new CliError(`Invalid JSON manifest from "${url}".`);
  }

  if (typeof data !== "object" || data === null) {
    throw new CliError(`Invalid component manifest from "${url}". Expected { files: { path: content } }.`);
  }

  const record = data as { files?: unknown; name?: unknown };
  const rawFiles = record.files;

  if (typeof rawFiles !== "object" || rawFiles === null || Array.isArray(rawFiles)) {
    throw new CliError(`Invalid component manifest from "${url}". Expected { files: { path: content } }.`);
  }

  const files: Record<string, string> = {};

  for (const [filePath, content] of Object.entries(rawFiles as Record<string, unknown>)) {
    if (typeof content !== "string") {
      throw new CliError(`Invalid file content for "${filePath}" from "${url}". Expected string.`);
    }
    sanitizeRelativePath(filePath);
    files[filePath] = content;
  }

  let name: string | null = null;

  if (typeof record.name === "string" && record.name.length > 0) {
    validateComponentName(record.name);
    name = record.name;
  }

  return { name, files };
}

function deriveComponentNameFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.protocol === "data:") {
      return null;
    }

    const segments = parsed.pathname.split("/").filter((segment) => segment.length > 0);
    const last = segments[segments.length - 1];

    if (last === undefined || last.length === 0) {
      return null;
    }

    const withoutExt = last.replace(/\.[^.]+$/, "");

    if (withoutExt.length === 0 || withoutExt === "." || withoutExt === "..") {
      return null;
    }

    if (!/^[A-Za-z0-9._-]+$/.test(withoutExt)) {
      return null;
    }

    return withoutExt;
  } catch {
    return null;
  }
}

function sanitizeRelativePath(rawPath: string): string {
  if (rawPath.length === 0) {
    throw new CliError(`Invalid file path "${rawPath}" in remote manifest.`);
  }

  if (path.isAbsolute(rawPath) || rawPath.includes("\0")) {
    throw new CliError(`Invalid file path "${rawPath}" in remote manifest.`);
  }

  const normalized = path.normalize(rawPath);

  if (normalized === "." || normalized.startsWith("..") || path.isAbsolute(normalized)) {
    throw new CliError(`Invalid file path "${rawPath}" in remote manifest.`);
  }

  const parts = normalized.split(path.sep);

  if (parts.includes("..")) {
    throw new CliError(`Invalid file path "${rawPath}" in remote manifest.`);
  }

  return normalized;
}

function validateComponentName(component: string): void {
  if (component.length === 0 || component === "." || component === ".." || component.includes("/") || component.includes("\\")) {
    throw new CliError(`Invalid component name "${component}".`);
  }
}

async function assertComponentDir(sourceDir: string, component: string): Promise<void> {
  let stats: Awaited<ReturnType<typeof stat>> | null = null;

  try {
    stats = await stat(sourceDir);
  } catch {
    stats = null;
  }

  if (stats === null || !stats.isDirectory()) {
    throw new CliError(`Unknown component "${component}". Run "synthex list" to see available components.`);
  }
}

async function collectRelativeFiles(dir: string, base: string = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of sorted) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRelativeFiles(fullPath, base)));
    } else if (entry.isFile()) {
      files.push(path.relative(base, fullPath));
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

const PEER_DEPS: ReadonlySet<string> = new Set(["react", "react-dom", "react-native"]);

export interface RegistryDepEntry {
  readonly name: string;
  readonly deps?: readonly string[];
  readonly registryDependencies?: readonly string[];
}

export interface RegistryDepFile {
  readonly components?: readonly RegistryDepEntry[];
}

export function getDefaultRegistryJsonPath(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../registry.json");
}

export function collectInstallDeps(
  requested: readonly string[],
  registry: RegistryDepFile | null | undefined,
): string[] {
  const components = registry?.components;
  if (!components) {
    return [];
  }
  const byName = new Map<string, RegistryDepEntry>();
  for (const entry of components) {
    if (entry !== null && typeof entry === "object" && typeof entry.name === "string") {
      byName.set(entry.name, entry);
    }
  }
  const collected = new Set<string>();
  const visited = new Set<string>();
  const queue: string[] = [...requested];
  while (queue.length > 0) {
    const name = queue.shift();
    if (name === undefined || visited.has(name)) {
      continue;
    }
    visited.add(name);
    const entry = byName.get(name);
    if (entry === undefined) {
      continue;
    }
    for (const dep of entry.deps ?? []) {
      if (!PEER_DEPS.has(dep)) {
        collected.add(dep);
      }
    }
    for (const registryDep of entry.registryDependencies ?? []) {
      if (!visited.has(registryDep)) {
        queue.push(registryDep);
      }
    }
  }
  return [...collected].sort((a, b) => a.localeCompare(b));
}

export function resolveRequestedComponentNames(specs: readonly string[]): string[] {
  const names: string[] = [];
  for (const spec of specs) {
    if (isUrlSpec(spec)) {
      continue;
    }
    if (isRegistrySpec(spec)) {
      try {
        names.push(parseRegistryReference(spec).component);
      } catch {
        continue;
      }
      continue;
    }
    names.push(spec);
  }
  return names;
}

async function readRegistryFile(filePath: string): Promise<RegistryDepFile | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null || !Array.isArray((data as { components?: unknown }).components)) {
      return null;
    }
    return data as RegistryDepFile;
  } catch {
    return null;
  }
}

async function maybeLogInstallHint(specs: readonly string[], resolved: ResolvedAddOptions): Promise<void> {
  if (resolved.dryRun) {
    return;
  }
  try {
    const names = resolveRequestedComponentNames(specs);
    if (names.length === 0) {
      return;
    }
    const candidates = [
      path.join(resolved.registryRoot, "registry.json"),
      path.resolve(resolved.registryRoot, "../../../registry.json"),
      getDefaultRegistryJsonPath(),
    ].filter((candidate, index, all) => all.indexOf(candidate) === index);
    let registry: RegistryDepFile | null = null;
    for (const candidate of candidates) {
      const parsed = await readRegistryFile(candidate);
      if (parsed !== null) {
        registry = parsed;
        break;
      }
    }
    if (registry === null) {
      return;
    }
    const deps = collectInstallDeps(names, registry);
    if (deps.length === 0) {
      return;
    }
    logger.info(`bun add ${deps.join(" ")}`);
  } catch {
    return;
  }
}
