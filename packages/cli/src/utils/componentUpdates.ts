import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { planComponents, isUrlSpec, parseRegistryReference } from "../commands/add";
import { CliError } from "./errors";
import { mergeComponentFile, unifiedComponentDiff } from "./componentMerge";
import {
  assertSafeComponentPath,
  createInstalledFile,
  readComponentStateSnapshot,
  serializeComponentState,
} from "./componentState";
import { applyComponentTransaction } from "./componentTransaction";
import { assertCompatibleComponentState, relativeComponentPath } from "./componentInstall";
import type { ComponentMutation, ComponentState } from "./componentTypes";

export interface ComponentChange {
  readonly path: string;
  readonly component: string;
  readonly status: string;
  readonly reason?: string;
  readonly installedVersion: string | null;
  readonly availableVersion: string | null;
  readonly diff: string;
  readonly localDiff: string;
  readonly upstreamDiff: string;
}

export interface ComponentUpdateOptions {
  readonly cwd?: string;
  readonly registryRoot?: string;
  readonly dryRun?: boolean;
  readonly writeConflicts?: boolean;
  /** Project-relative conflicting paths whose current contents the user has resolved. */
  readonly resolved?: readonly string[];
}

export interface ComponentUpdateManifest {
  readonly cwd: string;
  readonly dryRun: boolean;
  readonly files: readonly ComponentChange[];
  readonly conflicts: number;
  readonly backupDir: string | null;
  readonly conflictDir: string | null;
}

interface PreparedFile {
  readonly change: ComponentChange;
  readonly base: Buffer | null;
  readonly local: Buffer | null;
  readonly incoming: Buffer | null;
  readonly result: Buffer | null;
}

const same = (a: Buffer | null, b: Buffer | null): boolean =>
  a === null ? b === null : b !== null && a.equals(b);

async function readCurrent(cwd: string, relativePath: string): Promise<Buffer | null> {
  const target = await assertSafeComponentPath(cwd, relativePath);
  try {
    return await readFile(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function componentName(spec: string): string {
  return spec.startsWith("@") ? parseRegistryReference(spec).component : spec;
}

function safeComponentName(spec: string): string | null {
  try {
    return componentName(spec);
  } catch {
    return null;
  }
}

/** Local component names recorded in state; used to recognize retirements. */
function recordedLocalComponentNames(state: ComponentState | null): string[] {
  if (state === null) return [];
  const names: string[] = [];
  for (const request of state.requests) {
    if (isUrlSpec(request)) continue;
    const name = safeComponentName(request);
    if (name !== null) names.push(name);
  }
  return names;
}

function resolveUpdateRequests(requested: readonly string[], state: ComponentState | null, requireTracked: boolean): string[] {
  if (requested.length === 0) {
    if (state === null || state.requests.length === 0) {
      throw new CliError('No recorded components. Specify a component for "synthex diff", or install it with "synthex add" first.');
    }
    return [...state.requests];
  }
  if (state === null) return [...requested];
  return requested.flatMap((spec) => {
    if (isUrlSpec(spec)) {
      if (requireTracked && !state.requests.includes(spec)) throw new CliError("This registry URL is not a recorded installation. Use add before updating it.");
      return [spec];
    }
    const name = componentName(spec);
    const installed = Object.values(state.files).filter((file) => file.component === name);
    if (installed.length === 0) {
      const recorded =
        state.requests.some((request) => !isUrlSpec(request) && safeComponentName(request) === name);
      if (!recorded) {
        if (!requireTracked) return [spec];
        throw new CliError(`Component "${name}" is not recorded. Run "synthex diff ${name}" in an untracked project, or install it with add first.`);
      }
      return [spec];
    }
    const remote = state.requests.filter((request) => isUrlSpec(request) && installed.some((file) => file.source.startsWith(`${request}#`)));
    return remote.length > 0 ? remote : [spec];
  });
}

async function prepareUpdates(requested: readonly string[], options: ComponentUpdateOptions, requireTracked = false) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const snapshot = await readComponentStateSnapshot(cwd);
  const requests = [...new Set(resolveUpdateRequests(requested, snapshot.state, requireTracked))];
  const plan = await planComponents(requests, {
    cwd,
    registryRoot: options.registryRoot,
    allowRemoved: recordedLocalComponentNames(snapshot.state),
  });
  if (snapshot.state !== null) assertCompatibleComponentState(snapshot.state, plan);
  const incoming = new Map(plan.files.map((file) => [relativeComponentPath(cwd, file.destination), file]));
  const selected = new Set(plan.files.map((file) => file.component));
  for (const removed of plan.removedComponents ?? []) selected.add(removed);
  const requestedUrls = new Set(requests.filter((request) => isUrlSpec(request)));
  const paths = new Set(incoming.keys());
  const resolutions = new Set(options.resolved ?? []);
  for (const file of Object.values(snapshot.state?.files ?? {})) {
    if (selected.has(file.component)) {
      paths.add(file.path);
      continue;
    }
    // A remote manifest may rename its component; old tracked paths still
    // belong to the requested URL and must converge instead of orphaning.
    if (requestedUrls.size > 0 && [...requestedUrls].some((url) => file.source.startsWith(`${url}#`))) {
      paths.add(file.path);
    }
  }
  const files: PreparedFile[] = [];
  for (const relativePath of [...paths].sort()) {
    const original = snapshot.state?.files[relativePath];
    const next = incoming.get(relativePath);
    const base = original === undefined ? null : Buffer.from(original.base, "base64");
    const local = await readCurrent(cwd, relativePath);
    const candidate = next?.content ?? null;
    const merge = mergeComponentFile(base, local, candidate);
    const untracked = original === undefined && local !== null && !same(local, candidate);
    let status = snapshot.state === null ? "untracked" : untracked ? "conflict" : merge.status;
    let reason = untracked ? "This existing file has no recorded original; it cannot be merged automatically." : merge.reason;
    const accepted = resolutions.has(relativePath);
    if (accepted) {
      if (status !== "conflict") throw new CliError(`"${relativePath}" is not a conflicting file; omit it from --resolved.`);
      status = "resolved";
      reason = "The user accepted the current file as the manual resolution. Its contents will be preserved.";
      resolutions.delete(relativePath);
    }
    const result = accepted ? local : merge.content;
    const change: ComponentChange = {
      path: relativePath,
      component: next?.component ?? original!.component,
      status,
      ...(reason === undefined ? {} : { reason }),
      installedVersion: original?.registryVersion ?? null,
      availableVersion: next?.registryVersion ?? null,
      diff: unifiedComponentDiff(relativePath, local, status === "conflict" || status === "untracked" ? candidate : result),
      localDiff: original === undefined ? "" : unifiedComponentDiff(relativePath, base, local),
      upstreamDiff: original === undefined ? "" : unifiedComponentDiff(relativePath, base, candidate),
    };
    files.push({ change, base, local, incoming: candidate, result });
  }
  if (resolutions.size > 0) throw new CliError(`Unknown resolved path(s): ${[...resolutions].join(", ")}. Use project-relative paths shown by diff.`);
  return { cwd, snapshot, plan, files, incoming };
}

export async function diffComponents(requested: readonly string[] = [], options: ComponentUpdateOptions = {}): Promise<ComponentUpdateManifest> {
  const preview = await prepareUpdates(requested, options);
  return {
    cwd: preview.cwd,
    dryRun: true,
    files: preview.files.map((file) => file.change),
    conflicts: preview.files.filter((file) => file.change.status === "conflict").length,
    backupDir: null,
    conflictDir: null,
  };
}

async function writeConflictFiles(cwd: string, files: readonly PreparedFile[]): Promise<string> {
  const relativeRoot = `.synthex/conflicts/${randomUUID()}`;
  const root = await assertSafeComponentPath(cwd, `${relativeRoot}/manifest.json`, { allowState: true });
  await mkdir(path.dirname(root), { recursive: true });
  const conflicts = files.filter((file) => file.change.status === "conflict");
  for (const file of conflicts) {
    for (const [side, bytes] of [["base", file.base], ["local", file.local], ["incoming", file.incoming]] as const) {
      if (bytes === null) continue;
      const destination = await assertSafeComponentPath(cwd, `${relativeRoot}/${side}/${file.change.path}`, { allowState: true });
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, bytes, { flag: "wx" });
    }
  }
  await writeFile(root, JSON.stringify({ version: 1, files: conflicts.map((file) => ({ ...file.change, baseExists: file.base !== null, localExists: file.local !== null, incomingExists: file.incoming !== null })) }, null, 2) + "\n", { flag: "wx" });
  return path.dirname(root);
}

export async function updateComponents(requested: readonly string[] = [], options: ComponentUpdateOptions = {}): Promise<ComponentUpdateManifest> {
  const preview = await prepareUpdates(requested, options, true);
  if (preview.snapshot.state === null) {
    throw new CliError('No recorded original exists. Review "synthex diff <component>" first. An identical "synthex add <component>" records a baseline; modified legacy files need manual reconciliation.');
  }
  const manifest: ComponentUpdateManifest = {
    cwd: preview.cwd,
    dryRun: options.dryRun ?? false,
    files: preview.files.map((file) => file.change),
    conflicts: preview.files.filter((file) => file.change.status === "conflict").length,
    backupDir: null,
    conflictDir: null,
  };
  if (manifest.conflicts > 0) {
    const conflictDir = !manifest.dryRun && options.writeConflicts ? await writeConflictFiles(preview.cwd, preview.files) : null;
    return { ...manifest, conflictDir };
  }
  if (manifest.dryRun) return manifest;
  const tracked = { ...preview.snapshot.state.files };
  const mutations: ComponentMutation[] = [];
  for (const file of preview.files) {
    if (!same(file.local, file.result)) mutations.push({ path: file.change.path, content: file.result, expected: file.local });
    const incoming = preview.incoming.get(file.change.path);
    if (incoming === undefined) delete tracked[file.change.path];
    else tracked[file.change.path] = createInstalledFile(incoming, preview.cwd);
  }
  const nextState: ComponentState = { ...preview.snapshot.state, files: tracked };
  mutations.push({ path: ".synthex/components.json", content: serializeComponentState(nextState), expected: preview.snapshot.raw });
  const transaction = await applyComponentTransaction(preview.cwd, mutations);
  return { ...manifest, backupDir: transaction.backupDir };
}
