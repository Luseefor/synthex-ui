import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Command } from "commander";
import { CliError } from "../utils/errors";
import { logger } from "../utils/logger";
import { getDefaultRegistryRoot } from "./list";
import { getDefaultRegistryJsonPath } from "../utils/assets";
import { readUiConfig } from "../utils/uiConfig";
import type { UiConfig } from "../utils/uiConfig";
import { detectPackageManager, getInstallCommand } from "../utils/project";
import type { PackageManager } from "../utils/project";

export { getDefaultRegistryJsonPath } from "../utils/assets";

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
  readonly packageManager?: PackageManager;
}

interface ResolvedAddOptions {
  cwd: string;
  overwrite: boolean;
  dryRun: boolean;
  registryRoot: string;
  packageManager: PackageManager;
}

interface AddCommandCliOptions {
  cwd?: string;
  overwrite?: boolean;
  dryRun?: boolean;
  packageManager?: string;
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

const SUPPORTED_LOCAL_REGISTRIES: ReadonlySet<string> = new Set(["synthex", "default"]);

function assertSupportedRegistry(ref: RegistryReference, spec: string): void {
  if (!SUPPORTED_LOCAL_REGISTRIES.has(ref.registry)) {
    throw new CliError(
      `Unsupported registry "${ref.registry}" in "${spec}". Only "@synthex/<name>", "@default/<name>" and "@<name>" are supported.`,
    );
  }
}

function resolveLocalComponentName(spec: string): string {
  const ref = parseRegistryReference(spec);
  assertSupportedRegistry(ref, spec);
  return ref.component;
}

function isExcludedTestPath(relativePath: string): boolean {
  const normalized = relativePath.split(path.sep).join("/");
  if (normalized.includes("__tests__")) {
    return true;
  }
  if (/\.test\.[^/]+$/.test(normalized)) {
    return true;
  }
  if (/\.spec\.[^/]+$/.test(normalized)) {
    return true;
  }
  return false;
}

function isNativeFile(relativePath: string): boolean {
  const normalized = relativePath.split(path.sep).join("/");
  const base = normalized.split("/").pop() ?? normalized;
  return /\.native\.[^/.]+$/.test(base);
}

function isWebFile(relativePath: string): boolean {
  const normalized = relativePath.split(path.sep).join("/");
  const base = normalized.split("/").pop() ?? normalized;
  return /\.web\.[^/.]+$/.test(base);
}

type CopyPlatform = "web" | "native";

function getCopyPlatform(uiConfig: UiConfig | null): CopyPlatform | null {
  if (uiConfig === null) {
    return null;
  }
  if (uiConfig.framework === "expo") {
    return "native";
  }
  return "web";
}

function buildNativeKeySet(relativePaths: Iterable<string>): Set<string> {
  const keys = new Set<string>();
  for (const rp of relativePaths) {
    if (!isNativeFile(rp)) {
      continue;
    }
    const posix = rp.split(path.sep).join("/");
    const slash = posix.lastIndexOf("/");
    const dir = slash === -1 ? "" : posix.slice(0, slash);
    const base = slash === -1 ? posix : posix.slice(slash + 1);
    const m = base.match(/^(.*)\.native\.[^/.]+$/);
    if (!m) {
      continue;
    }
    keys.add(dir === "" ? (m[1] as string) : `${dir}/${m[1] as string}`);
  }
  return keys;
}

function remapWebImportsWithSiblings(
  content: string,
  currentRelativePath: string,
  nativeKeys: Set<string>,
): string {
  if (nativeKeys.size === 0) {
    return content;
  }
  const posixCurrent = currentRelativePath.split(path.sep).join("/");
  const slash = posixCurrent.lastIndexOf("/");
  const posixDir = slash === -1 ? "" : posixCurrent.slice(0, slash);
  return content.replace(/(["'])(\.\.?\/[^"']+?)\.web\1/g, (match, quote: string, spec: string) => {
    const resolved = path.posix.normalize(posixDir === "" ? (spec as string) : `${posixDir}/${spec as string}`);
    if (nativeKeys.has(resolved)) {
      return `${quote}${spec}.native${quote}`;
    }
    return match;
  });
}

function isNeutralIndexFile(relativePath: string): boolean {
  return path.basename(relativePath) === "index.ts";
}

function isNativeBarrelFile(relativePath: string): boolean {
  return path.basename(relativePath) === "index.native.ts";
}

function remappedNativeBarrel(relativePath: string): string | null {
  if (path.basename(relativePath) !== "index.native.ts") {
    return null;
  }
  return path.join(path.dirname(relativePath), "index.ts");
}

function getRegistryCandidates(registryRoot: string): string[] {
  const candidates = [
    path.join(registryRoot, "registry.json"),
    getDefaultRegistryJsonPath(),
    path.resolve(registryRoot, "../../../registry.json"),
  ];
  return candidates.filter((candidate, index, all) => all.indexOf(candidate) === index);
}

function registryBelongsToRoot(
  registry: RegistryDepFile | null | undefined,
  candidateDir: string,
  registryRoot: string,
  requested: readonly string[],
): boolean {
  const byName = buildRegistryMap(registry);
  let hasDirInfo = false;
  for (const name of requested) {
    const entry = byName.get(name) as unknown as { dir?: unknown } | undefined;
    const dir = entry?.dir;
    if (typeof dir === "string") {
      hasDirInfo = true;
      const resolvedEntry = path.resolve(candidateDir, dir);
      const relToRoot = path.relative(registryRoot, resolvedEntry);
      if (relToRoot !== "" && (relToRoot.startsWith("..") || path.isAbsolute(relToRoot))) {
        return false;
      }
    }
  }
  return hasDirInfo;
}

async function loadRegistryForCopyScoped(
  registryRoot: string,
  isCustomRoot: boolean,
  requested: readonly string[],
): Promise<RegistryDepFile | null> {
  if (!isCustomRoot) {
    for (const candidate of getRegistryCandidates(registryRoot)) {
      const parsed = await readRegistryFile(candidate);
      if (parsed !== null) {
        return parsed;
      }
    }
    return null;
  }
  const adjacent = path.join(registryRoot, "registry.json");
  const adjacentParsed = await readRegistryFile(adjacent);
  if (adjacentParsed !== null) {
    return adjacentParsed;
  }
  const parentCandidate = path.resolve(registryRoot, "../../../registry.json");
  if (parentCandidate === adjacent) {
    return null;
  }
  const parentParsed = await readRegistryFile(parentCandidate);
  if (parentParsed === null) {
    return null;
  }
  const candidateDir = path.dirname(parentCandidate);
  const rel = path.relative(candidateDir, registryRoot);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }
  if (!registryBelongsToRoot(parentParsed, candidateDir, registryRoot, requested)) {
    return null;
  }
  return parentParsed;
}

function buildRegistryMap(registry: RegistryDepFile | null | undefined): Map<string, RegistryDepEntry> {
  const byName = new Map<string, RegistryDepEntry>();
  const components = registry?.components;
  if (!components) {
    return byName;
  }
  for (const entry of components) {
    if (entry !== null && typeof entry === "object" && typeof entry.name === "string") {
      byName.set(entry.name, entry);
    }
  }
  return byName;
}

function expandLocalComponents(
  requested: readonly string[],
  registry: RegistryDepFile | null | undefined,
): string[] {
  const byName = buildRegistryMap(registry);
  const ordered: string[] = [];
  const visited = new Set<string>();
  const queue: string[] = [...requested];
  while (queue.length > 0) {
    const name = queue.shift();
    if (name === undefined || visited.has(name)) {
      continue;
    }
    visited.add(name);
    ordered.push(name);
    const entry = byName.get(name);
    if (entry === undefined) {
      continue;
    }
    for (const dep of entry.registryDependencies ?? []) {
      if (typeof dep !== "string") {
        throw new CliError(`Invalid registryDependency for "${name}". Expected string.`);
      }
      validateComponentName(dep);
      if (!visited.has(dep)) {
        queue.push(dep);
      }
    }
  }
  return ordered;
}

interface LocalWrite {
  readonly component: string;
  readonly relativePath: string;
  readonly source: string;
  readonly destination: string;
  readonly exists: boolean;
  readonly transformedContent?: string;
}

interface RemoteWrite {
  readonly component: string;
  readonly relativePath: string;
  readonly source: string;
  readonly destination: string;
  readonly content: string;
  readonly exists: boolean;
}

export async function addComponents(
  components: readonly string[],
  options: AddComponentsOptions = {},
): Promise<AddManifest> {
  if (components.length === 0) {
    throw new CliError('Specify at least one component. Run "synthex list" to see available components.');
  }

  const cwd = path.resolve(options.cwd ?? process.cwd());
  const overwrite = options.overwrite ?? false;
  const dryRun = options.dryRun ?? false;
  const registryRoot = options.registryRoot ?? getDefaultRegistryRoot();

  const uiConfig = await readUiConfig(cwd);

  const destinationRoot =
    uiConfig === null ? path.join(cwd, "components", "ui") : path.join(cwd, ...uiConfig.componentsDir.split("/"));

  let packageManager: PackageManager;
  if (options.packageManager !== undefined) {
    packageManager = await detectPackageManager(cwd, options.packageManager);
  } else if (uiConfig !== null) {
    packageManager = uiConfig.packageManager;
  } else {
    packageManager = await detectPackageManager(cwd);
  }

  const resolved: ResolvedAddOptions = {
    cwd,
    overwrite,
    dryRun,
    registryRoot,
    packageManager,
  };

  const platform = getCopyPlatform(uiConfig);

  // Phase 1: parse every spec before touching the filesystem for writes.
  const requestedLocals: string[] = [];
  const remoteUrls: string[] = [];
  for (const spec of components) {
    if (isUrlSpec(spec)) {
      remoteUrls.push(spec);
      continue;
    }
    if (isRegistrySpec(spec)) {
      requestedLocals.push(resolveLocalComponentName(spec));
      continue;
    }
    validateComponentName(spec);
    requestedLocals.push(spec);
  }

  // Phase 2: resolve transitive local closure (cycle-safe, deduped).
  // Custom registryRoot uses only its own metadata; absent metadata means
  // copy requested dirs as-is without borrowing the default registry.
  const isCustomRegistryRoot = options.registryRoot !== undefined;
  let expandedLocals: string[] = [];
  let registry: RegistryDepFile | null = null;
  if (requestedLocals.length > 0) {
    registry = await loadRegistryForCopyScoped(resolved.registryRoot, isCustomRegistryRoot, requestedLocals);
    expandedLocals = expandLocalComponents(requestedLocals, registry);
  }

  // Phase 3: preflight every file (existence + conflicts) before any writes.
  const conflicts: string[] = [];
  const conflictSet = new Set<string>();
  const seenSources = new Map<string, string>();
  type PlanEntry =
    | { readonly kind: "skip"; readonly entry: AddFileEntry }
    | { readonly kind: "local"; readonly write: LocalWrite }
    | { readonly kind: "remote"; readonly write: RemoteWrite };
  const plan: PlanEntry[] = [];
  const dryRunFiles: AddFileEntry[] = [];

  function recordConflict(destination: string): void {
    if (!conflictSet.has(destination)) {
      conflictSet.add(destination);
      conflicts.push(destination);
    }
  }

  function claimDestination(destination: string, source: string): boolean {
    const prev = seenSources.get(destination);
    if (prev === undefined) {
      seenSources.set(destination, source);
      return true;
    }
    if (prev === source) {
      return false;
    }
    throw new CliError(
      `Conflicting sources for "${destination}". Two distinct sources claim the same file; resolve the duplicate request.`,
    );
  }

  for (const name of expandedLocals) {
    const sourceDir = path.join(resolved.registryRoot, name);
    let stats: Awaited<ReturnType<typeof stat>> | null = null;
    try {
      stats = await stat(sourceDir);
    } catch {
      stats = null;
    }
    if (stats === null || !stats.isDirectory()) {
      throw new CliError(`Unknown component "${name}". Run "synthex list" to see available components.`);
    }
  }

  for (const component of expandedLocals) {
    const sourceDir = path.join(resolved.registryRoot, component);
    const collected = await collectRelativeFiles(sourceDir);
    const relativePaths = collected.filter((relativePath) => {
      if (isExcludedTestPath(relativePath)) {
        return false;
      }
      if (platform === "web" && isNativeFile(relativePath)) {
        return false;
      }
      if (platform === "native" && isWebFile(relativePath)) {
        return false;
      }
      return true;
    });
    if (relativePaths.length === 0) {
      throw new CliError(`Component "${component}" has no files to copy.`);
    }
    const pathSet = new Set(relativePaths);
    const nativeKeys = platform === "native" ? buildNativeKeySet(relativePaths) : new Set<string>();

    async function planLocalFile(
      source: string,
      relativePath: string,
      destination: string,
    ): Promise<void> {
      if (!claimDestination(destination, source)) {
        return;
      }
      const exists = await pathExists(destination);
      let transformedContent: string | undefined;
      if (platform === "native") {
        try {
          const raw = await readFile(source, "utf8");
          const transformed = remapWebImportsWithSiblings(raw, relativePath, nativeKeys);
          if (transformed !== raw) {
            transformedContent = transformed;
          }
        } catch {
          transformedContent = undefined;
        }
      }
      if (exists) {
        const identical =
          transformedContent !== undefined
            ? await isRemoteContentIdentical(transformedContent, destination)
            : await isLocalFileIdentical(source, destination);
        if (identical) {
          if (resolved.dryRun) {
            dryRunFiles.push({
              component,
              relativePath,
              source,
              destination,
              status: "skipped-existing",
            });
          } else {
            plan.push({
              kind: "skip",
              entry: { component, relativePath, source, destination, status: "skipped-existing" },
            });
          }
          return;
        }
        if (!resolved.overwrite) {
          recordConflict(destination);
          return;
        }
        if (resolved.dryRun) {
          dryRunFiles.push({
            component,
            relativePath,
            source,
            destination,
            status: "planned",
          });
          return;
        }
      } else if (resolved.dryRun) {
        dryRunFiles.push({
          component,
          relativePath,
          source,
          destination,
          status: "planned",
        });
        return;
      }
      plan.push({
        kind: "local",
        write: { component, relativePath, source, destination, exists, transformedContent },
      });
    }

    for (const relativePath of relativePaths) {
      if (
        platform === "native" &&
        isNeutralIndexFile(relativePath) &&
        pathSet.has(path.join(path.dirname(relativePath), "index.native.ts"))
      ) {
        continue;
      }
      const source = path.join(sourceDir, relativePath);
      const destination = path.join(destinationRoot, component, relativePath);
      await planLocalFile(source, relativePath, destination);
      if (platform === "native" && isNativeBarrelFile(relativePath)) {
        const remapped = remappedNativeBarrel(relativePath);
        if (remapped !== null) {
          const remappedDestination = path.join(destinationRoot, component, remapped);
          await planLocalFile(source, remapped, remappedDestination);
        }
      }
    }
  }

  interface FetchedRemote {
    readonly url: string;
    readonly component: string;
    readonly files: Record<string, string>;
  }

  const fetchedRemotes: FetchedRemote[] = [];
  for (const url of remoteUrls) {
    const manifest = await fetchRemoteManifest(url);
    const component = manifest.name ?? deriveComponentNameFromUrl(url) ?? "remote";
    validateComponentName(component);
    const entries = Object.entries(manifest.files);
    if (entries.length === 0) {
      throw new CliError(`Remote component from "${url}" has no files to copy.`);
    }
    fetchedRemotes.push({ url, component, files: manifest.files });
  }

  for (const remote of fetchedRemotes) {
    const sanitizedEntries: Array<{ relativePath: string; rawContent: string }> = [];
    for (const [rawPath, rawContent] of Object.entries(remote.files)) {
      const relativePath = sanitizeRelativePath(rawPath);
      if (platform === "web" && isNativeFile(relativePath)) {
        continue;
      }
      if (platform === "native" && isWebFile(relativePath)) {
        continue;
      }
      sanitizedEntries.push({ relativePath, rawContent });
    }
    if (sanitizedEntries.length === 0) {
      throw new CliError(`Remote component from "${remote.url}" has no files to copy.`);
    }
    const remoteSet = new Set(sanitizedEntries.map((e) => e.relativePath));
    const remoteNativeKeys =
      platform === "native" ? buildNativeKeySet(sanitizedEntries.map((e) => e.relativePath)) : new Set<string>();

    async function planRemoteFile(relativePath: string, content: string): Promise<void> {
      const source = `${remote.url}#${relativePath}`;
      const destination = path.join(destinationRoot, remote.component, relativePath);
      if (!claimDestination(destination, source)) {
        return;
      }
      const exists = await pathExists(destination);
      if (exists) {
        const identical = await isRemoteContentIdentical(content, destination);
        if (identical) {
          if (resolved.dryRun) {
            dryRunFiles.push({
              component: remote.component,
              relativePath,
              source,
              destination,
              status: "skipped-existing",
            });
          } else {
            plan.push({
              kind: "skip",
              entry: { component: remote.component, relativePath, source, destination, status: "skipped-existing" },
            });
          }
          return;
        }
        if (!resolved.overwrite) {
          recordConflict(destination);
          return;
        }
        if (resolved.dryRun) {
          dryRunFiles.push({
            component: remote.component,
            relativePath,
            source,
            destination,
            status: "planned",
          });
          return;
        }
      } else if (resolved.dryRun) {
        dryRunFiles.push({
          component: remote.component,
          relativePath,
          source,
          destination,
          status: "planned",
        });
        return;
      }
      plan.push({
        kind: "remote",
        write: { component: remote.component, relativePath, source, destination, content, exists },
      });
    }

    let kept = 0;
    for (const { relativePath, rawContent } of sanitizedEntries) {
      if (
        platform === "native" &&
        isNeutralIndexFile(relativePath) &&
        remoteSet.has(path.join(path.dirname(relativePath), "index.native.ts"))
      ) {
        continue;
      }
      const content =
        platform === "native"
          ? remapWebImportsWithSiblings(rawContent, relativePath, remoteNativeKeys)
          : rawContent;
      await planRemoteFile(relativePath, content);
      kept += 1;
      if (platform === "native" && isNativeBarrelFile(relativePath)) {
        const remapped = remappedNativeBarrel(relativePath);
        if (remapped !== null) {
          await planRemoteFile(remapped, content);
          kept += 1;
        }
      }
    }
    if (kept === 0) {
      throw new CliError(`Remote component from "${remote.url}" has no files to copy.`);
    }
  }

  if (conflicts.length > 0) {
    throw new CliError(
      `Refusing to overwrite ${conflicts.length} existing file(s). Re-run with --overwrite.`,
      1,
      { files: conflicts },
    );
  }

  if (resolved.dryRun) {
    return {
      components: [...components],
      cwd: resolved.cwd,
      destinationRoot,
      dryRun: resolved.dryRun,
      overwrite: resolved.overwrite,
      files: dryRunFiles,
    };
  }

  // Phase 4: all preflight passed, now write in plan order.
  const files: AddFileEntry[] = [];
  for (const entry of plan) {
    if (entry.kind === "skip") {
      files.push(entry.entry);
      continue;
    }
    if (entry.kind === "local") {
      const write = entry.write;
      await mkdir(path.dirname(write.destination), { recursive: true });
      if (write.transformedContent !== undefined) {
        await writeFile(write.destination, write.transformedContent, "utf8");
      } else {
        await copyFile(write.source, write.destination);
      }
      files.push({
        component: write.component,
        relativePath: write.relativePath,
        source: write.source,
        destination: write.destination,
        status: write.exists ? "overwritten" : "written",
      });
      continue;
    }
    const write = entry.write;
    await mkdir(path.dirname(write.destination), { recursive: true });
    await writeFile(write.destination, write.content, "utf8");
    files.push({
      component: write.component,
      relativePath: write.relativePath,
      source: write.source,
      destination: write.destination,
      status: write.exists ? "overwritten" : "written",
    });
  }

  await maybeLogInstallHint(components, resolved, registry);

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
    .option("--package-manager <manager>", "Package manager (npm|pnpm|yarn|bun)")
    .action(async (componentInput: string[], cliOptions: AddCommandCliOptions) => {
      const manifest = await addComponents(componentInput, {
        cwd: cliOptions.cwd,
        overwrite: cliOptions.overwrite,
        dryRun: cliOptions.dryRun,
        packageManager: cliOptions.packageManager as PackageManager | undefined,
      });

      process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);

      if (manifest.dryRun) {
        logger.info(`Dry run: ${manifest.files.length} file(s) would be copied.`);
      } else {
        logger.success(`Added ${manifest.components.join(", ")}.`);
      }
    });
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

async function isLocalFileIdentical(source: string, destination: string): Promise<boolean> {
  try {
    const [a, b] = await Promise.all([readFile(source), readFile(destination)]);
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
      return false;
    }
    return (a as Buffer).equals(b as Buffer);
  } catch {
    return false;
  }
}

async function isRemoteContentIdentical(content: string, destination: string): Promise<boolean> {
  try {
    const destBuf = await readFile(destination);
    if (!Buffer.isBuffer(destBuf)) {
      return false;
    }
    return (destBuf as Buffer).equals(Buffer.from(content, "utf8"));
  } catch {
    return false;
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

const PEER_DEPS: ReadonlySet<string> = new Set(["react", "react-dom", "react-native"]);

export interface RegistryDepEntry {
  readonly name: string;
  readonly deps?: readonly string[];
  readonly registryDependencies?: readonly string[];
}

export interface RegistryDepFile {
  readonly components?: readonly RegistryDepEntry[];
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

async function maybeLogInstallHint(
  specs: readonly string[],
  resolved: ResolvedAddOptions,
  registry: RegistryDepFile | null,
): Promise<void> {
  if (resolved.dryRun) {
    return;
  }
  try {
    const names = resolveRequestedComponentNames(specs);
    if (names.length === 0) {
      return;
    }
    if (registry === null) {
      return;
    }
    const deps = collectInstallDeps(names, registry);
    if (deps.length === 0) {
      return;
    }
    logger.info(getInstallCommand(resolved.packageManager, deps));
  } catch {
    return;
  }
}
