import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, stat, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { describe, expect, it, vi, afterEach } from "vitest";
import { addComponents } from "../commands/add";
import { diffComponents, updateComponents } from "./componentUpdates";

const roots: string[] = [];

async function trackTmp(prefix: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), prefix));
  roots.push(dir);
  return dir;
}

afterEach(async () => {
  vi.unstubAllGlobals();
  const pending = roots.splice(0);
  await Promise.all(pending.map((r) => rm(r, { recursive: true, force: true })));
});

interface FixtureSpec {
  version?: string | null;
  components: Record<string, Record<string, string>>;
  deps?: Record<string, string[]>;
  registryDeps?: Record<string, string[]>;
}

async function setupFixture(spec: FixtureSpec): Promise<{ registryRoot: string; cwd: string }> {
  const registryRoot = await trackTmp("synthex-reg-");
  const cwd = await trackTmp("synthex-cwd-");
  for (const [comp, files] of Object.entries(spec.components)) {
    for (const [rel, content] of Object.entries(files)) {
      const full = path.join(registryRoot, comp, rel);
      await mkdir(path.dirname(full), { recursive: true });
      await writeFile(full, content);
    }
  }
  const components = Object.keys(spec.components).map((name) => ({
    name,
    deps: spec.deps?.[name] ?? [],
    registryDependencies: spec.registryDeps?.[name] ?? [],
  }));
  const meta: Record<string, unknown> = { components };
  if (spec.version !== null && spec.version !== undefined) meta["version"] = spec.version;
  await writeFile(path.join(registryRoot, "registry.json"), JSON.stringify(meta, null, 2));
  return { registryRoot, cwd };
}

function stdComponents(version = "1.0.0"): FixtureSpec {
  return {
    version,
    components: {
      button: {
        "index.ts": "export * from './button';\n",
        "button.tsx": "export const Button = 'v1';\n",
        "utils.ts": "export const fmt = (s: string) => s;\n",
      },
      card: {
        "index.ts": "export * from './card';\n",
        "card.tsx": "export const Card = 'v1';\n",
      },
    },
    deps: { button: ["clsx"], card: [] },
  };
}

async function writeRegistryFile(registryRoot: string, comp: string, rel: string, content: string): Promise<void> {
  const full = path.join(registryRoot, comp, rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content);
}

async function removeRegistryFile(registryRoot: string, comp: string, rel: string): Promise<void> {
  await unlink(path.join(registryRoot, comp, rel));
}

async function setRegistryVersion(registryRoot: string, version: string): Promise<void> {
  const raw = await readFile(path.join(registryRoot, "registry.json"), "utf8");
  const meta = JSON.parse(raw) as { version?: unknown; components?: unknown };
  meta.version = version;
  await writeFile(path.join(registryRoot, "registry.json"), JSON.stringify(meta, null, 2));
}

async function readState(cwd: string): Promise<any | null> {
  try {
    return JSON.parse(await readFile(path.join(cwd, ".synthex", "components.json"), "utf8"));
  } catch (e: any) {
    if (e?.code === "ENOENT") return null;
    throw e;
  }
}

async function readStateRaw(cwd: string): Promise<Buffer | null> {
  try {
    return await readFile(path.join(cwd, ".synthex", "components.json"));
  } catch (e: any) {
    if (e?.code === "ENOENT") return null;
    throw e;
  }
}

function proj(cwd: string, relPosix: string): string {
  return path.join(cwd, ...relPosix.split("/"));
}

async function listBackups(cwd: string): Promise<string[]> {
  try {
    return await readdir(path.join(cwd, ".synthex", "backups"));
  } catch {
    return [];
  }
}

async function listConflicts(cwd: string): Promise<string[]> {
  try {
    return await readdir(path.join(cwd, ".synthex", "conflicts"));
  } catch {
    return [];
  }
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

describe("component update workflows", () => {
  it("add records original bytes as base64 plus sha256 and registry version", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents("1.0.0"));
    const manifest = await addComponents(["button"], { cwd, registryRoot });
    expect(manifest.backupDir).toBeNull;
    expect(manifest.dryRun).toBe(false);
    const state = await readState(cwd);
    expect(state).not.toBeNull();
    expect(state.version).toBe(1);
    expect(state.requests).toContain("button");
    expect(state.destinationRoot).toBe("components/ui");
    const key = "components/ui/button/button.tsx";
    const entry = state.files[key];
    expect(entry).toBeDefined();
    expect(entry.component).toBe("button");
    expect(entry.registryVersion).toBe("1.0.0");
    const original = Buffer.from("export const Button = 'v1';\n", "utf8");
    expect(entry.base).toBe(original.toString("base64"));
    expect(entry.sha256).toBe(createHash("sha256").update(original).digest("hex"));
    const onDisk = await readFile(proj(cwd, key), "utf8");
    expect(onDisk).toBe("export const Button = 'v1';\n");
  });

  it("add dry-run writes nothing including no state file", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    const manifest = await addComponents(["button"], { cwd, registryRoot, dryRun: true });
    expect(manifest.dryRun).toBe(true);
    expect(manifest.backupDir).toBeNull();
    expect(await pathExists(proj(cwd, "components/ui/button/button.tsx"))).toBe(false);
    expect(await readState(cwd)).toBeNull();
    expect(await pathExists(path.join(cwd, ".synthex"))).toBe(false);
  });

  it("clean upstream update backs up old bytes and state, advances baseline and version", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents("1.0.0"));
    await addComponents(["button"], { cwd, registryRoot });
    expect(await listBackups(cwd)).toHaveLength(1);
    const beforeRaw = await readStateRaw(cwd);
    await writeRegistryFile(registryRoot, "button", "button.tsx", "export const Button = 'v2';\n");
    await setRegistryVersion(registryRoot, "1.1.0");
    const preview = await diffComponents(["button"], { cwd, registryRoot });
    expect(preview.dryRun).toBe(true);
    expect(preview.backupDir).toBeNull();
    expect(preview.conflictDir).toBeNull();
    const change = preview.files.find((f) => f.path === "components/ui/button/button.tsx");
    expect(change).toBeDefined();
    expect(change!.status).toBe("updated");
    expect(change!.installedVersion).toBe("1.0.0");
    expect(change!.availableVersion).toBe("1.1.0");
    expect(change!.upstreamDiff).toContain("v2");
    expect(await listBackups(cwd)).toHaveLength(1);
    const result = await updateComponents(["button"], { cwd, registryRoot });
    expect(result.conflicts).toBe(0);
    expect(result.backupDir).not.toBeNull();
    expect(await readFile(proj(cwd, "components/ui/button/button.tsx"), "utf8")).toBe(
      "export const Button = 'v2';\n",
    );
    const backupFiles = path.join(result.backupDir!, "files", "components", "ui", "button", "button.tsx");
    expect(await readFile(backupFiles, "utf8")).toBe("export const Button = 'v1';\n");
    const state = await readState(cwd);
    expect(state.files["components/ui/button/button.tsx"].registryVersion).toBe("1.1.0");
    expect(
      Buffer.from(state.files["components/ui/button/button.tsx"].base, "base64").toString("utf8"),
    ).toBe("export const Button = 'v2';\n");
    expect((await readStateRaw(cwd))?.equals(beforeRaw!)).toBe(false);
  });

  it("independent local and upstream edits merge, baseline advances only to upstream bytes", async () => {
    const { registryRoot, cwd } = await setupFixture({
      version: "1.0.0",
      components: { button: { "notes.ts": "one\ntwo\nthree\nfour\n" } },
    });
    await addComponents(["button"], { cwd, registryRoot });
    await writeFile(proj(cwd, "components/ui/button/notes.ts"), "ONE\ntwo\nthree\nfour\n");
    await writeRegistryFile(registryRoot, "button", "notes.ts", "one\ntwo\nthree\nFOUR\n");
    await setRegistryVersion(registryRoot, "1.1.0");
    const result = await updateComponents(["button"], { cwd, registryRoot });
    const change = result.files.find((f) => f.path === "components/ui/button/notes.ts");
    expect(change!.status).toBe("merged");
    expect(await readFile(proj(cwd, "components/ui/button/notes.ts"), "utf8")).toBe("ONE\ntwo\nthree\nFOUR\n");
    const state = await readState(cwd);
    expect(Buffer.from(state.files["components/ui/button/notes.ts"].base, "base64").toString("utf8")).toBe(
      "one\ntwo\nthree\nFOUR\n",
    );
    const follow = await updateComponents(["button"], { cwd, registryRoot });
    const f2 = follow.files.find((f) => f.path === "components/ui/button/notes.ts");
    expect(f2!.status).toBe("local-only");
    expect(await readFile(proj(cwd, "components/ui/button/notes.ts"), "utf8")).toBe("ONE\ntwo\nthree\nFOUR\n");
  });

  it("overlapping conflict aborts all components, state and files; dry-run writes nothing", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents("1.0.0"));
    await addComponents(["button", "card"], { cwd, registryRoot });
    expect(await listBackups(cwd)).toHaveLength(1);
    const stateBefore = await readStateRaw(cwd);
    await writeFile(proj(cwd, "components/ui/button/button.tsx"), "export const Button = 'local';\n");
    await writeRegistryFile(registryRoot, "button", "button.tsx", "export const Button = 'remote';\n");
    await writeRegistryFile(registryRoot, "card", "card.tsx", "export const Card = 'v2';\n");
    const dry = await updateComponents(["button", "card"], { cwd, registryRoot, dryRun: true });
    expect(dry.conflicts).toBe(1);
    expect(dry.dryRun).toBe(true);
    expect(dry.backupDir).toBeNull();
    expect(dry.conflictDir).toBeNull();
    expect(await listBackups(cwd)).toHaveLength(1);
    expect(await listConflicts(cwd)).toHaveLength(0);
    expect(await readFile(proj(cwd, "components/ui/card/card.tsx"), "utf8")).toBe("export const Card = 'v1';\n");
    const blocked = await updateComponents(["button", "card"], { cwd, registryRoot });
    expect(blocked.conflicts).toBe(1);
    expect(blocked.backupDir).toBeNull();
    expect(blocked.conflictDir).toBeNull();
    expect(await readFile(proj(cwd, "components/ui/button/button.tsx"), "utf8")).toBe(
      "export const Button = 'local';\n",
    );
    expect(await readFile(proj(cwd, "components/ui/card/card.tsx"), "utf8")).toBe("export const Card = 'v1';\n");
    expect((await readStateRaw(cwd))?.equals(stateBefore!)).toBe(true);
    expect(await listBackups(cwd)).toHaveLength(1);
    expect(await listConflicts(cwd)).toHaveLength(0);
  });

  it("--writeConflicts writes base/local/incoming plus manifest without touching components or state", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    await addComponents(["button"], { cwd, registryRoot });
    expect(await listBackups(cwd)).toHaveLength(1);
    const stateBefore = await readStateRaw(cwd);
    await writeFile(proj(cwd, "components/ui/button/button.tsx"), "export const Button = 'local';\n");
    await writeRegistryFile(registryRoot, "button", "button.tsx", "export const Button = 'remote';\n");
    const result = await updateComponents(["button"], { cwd, registryRoot, writeConflicts: true });
    expect(result.conflicts).toBe(1);
    expect(result.backupDir).toBeNull();
    expect(result.conflictDir).not.toBeNull();
    const dir = result.conflictDir!;
    const rel = "components/ui/button/button.tsx";
    expect(await readFile(path.join(dir, "base", ...rel.split("/")), "utf8")).toBe(
      "export const Button = 'v1';\n",
    );
    expect(await readFile(path.join(dir, "local", ...rel.split("/")), "utf8")).toBe(
      "export const Button = 'local';\n",
    );
    expect(await readFile(path.join(dir, "incoming", ...rel.split("/")), "utf8")).toBe(
      "export const Button = 'remote';\n",
    );
    const manifest = JSON.parse(await readFile(path.join(dir, "manifest.json"), "utf8"));
    expect(manifest.files[0].path).toBe(rel);
    expect(await readFile(proj(cwd, rel), "utf8")).toBe("export const Button = 'local';\n");
    expect((await readStateRaw(cwd))?.equals(stateBefore!)).toBe(true);
    expect(await listBackups(cwd)).toHaveLength(1);
  });

  it("removed upstream file deletes when unmodified (with backup) but conflicts when locally modified", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    await addComponents(["button"], { cwd, registryRoot });
    await removeRegistryFile(registryRoot, "button", "utils.ts");
    const result = await updateComponents(["button"], { cwd, registryRoot });
    const deleted = result.files.find((f) => f.path === "components/ui/button/utils.ts");
    expect(deleted!.status).toBe("deleted");
    expect(await pathExists(proj(cwd, "components/ui/button/utils.ts"))).toBe(false);
    expect(result.backupDir).not.toBeNull();
    expect(
      await readFile(path.join(result.backupDir!, "files", "components", "ui", "button", "utils.ts"), "utf8"),
    ).toBe("export const fmt = (s: string) => s;\n");
    expect((await readState(cwd)).files["components/ui/button/utils.ts"]).toBeUndefined();

    const second = await setupFixture(stdComponents());
    await addComponents(["button"], { cwd: second.cwd, registryRoot: second.registryRoot });
    await writeFile(proj(second.cwd, "components/ui/button/utils.ts"), "export const fmt = () => 1;\n");
    await removeRegistryFile(second.registryRoot, "button", "utils.ts");
    const conflict = await updateComponents(["button"], { cwd: second.cwd, registryRoot: second.registryRoot });
    expect(conflict.conflicts).toBe(1);
    expect(conflict.backupDir).toBeNull();
    expect(await readFile(proj(second.cwd, "components/ui/button/utils.ts"), "utf8")).toBe(
      "export const fmt = () => 1;\n",
    );
  });

  it("locally deleted file with unchanged upstream stays deleted", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    await addComponents(["button"], { cwd, registryRoot });
    await unlink(proj(cwd, "components/ui/button/utils.ts"));
    const result = await updateComponents(["button"], { cwd, registryRoot });
    const entry = result.files.find((f) => f.path === "components/ui/button/utils.ts");
    expect(entry!.status).toBe("local-only");
    expect(await pathExists(proj(cwd, "components/ui/button/utils.ts"))).toBe(false);
  });

  it("missing baseline: update refuses while diff reports untracked", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    await mkdir(proj(cwd, "components/ui/button"), { recursive: true });
    await writeFile(proj(cwd, "components/ui/button/button.tsx"), "legacy\n");
    const preview = await diffComponents(["button"], { cwd, registryRoot });
    expect(preview.files.length).toBeGreaterThan(0);
    expect(preview.files.every((f) => f.status === "untracked" || f.installedVersion === null)).toBe(true);
    expect(preview.files.some((f) => f.diff.length > 0)).toBe(true);
    await expect(updateComponents(["button"], { cwd, registryRoot })).rejects.toThrow(/recorded original/i);
    expect(await readFile(proj(cwd, "components/ui/button/button.tsx"), "utf8")).toBe("legacy\n");
    expect(await listBackups(cwd)).toHaveLength(0);
  });

  it("new upstream file colliding with edited untracked local file conflicts", async () => {
    const { registryRoot, cwd } = await setupFixture({
      version: "1.0.0",
      components: { button: { "index.ts": "base\n" } },
    });
    await addComponents(["button"], { cwd, registryRoot });
    await writeFile(proj(cwd, "components/ui/button/extra.ts"), "mine\n");
    await writeRegistryFile(registryRoot, "button", "extra.ts", "theirs\n");
    const preview = await diffComponents(["button"], { cwd, registryRoot });
    const extra = preview.files.find((f) => f.path === "components/ui/button/extra.ts");
    expect(extra!.status).toBe("conflict");
    expect(extra!.installedVersion).toBeNull();
    const blocked = await updateComponents(["button"], { cwd, registryRoot });
    expect(blocked.conflicts).toBe(1);
    expect(blocked.backupDir).toBeNull();
    expect(await readFile(proj(cwd, "components/ui/button/extra.ts"), "utf8")).toBe("mine\n");
  });

  it("stale platform or destinationRoot fails before any write", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    await addComponents(["button"], { cwd, registryRoot });
    const stateBefore = await readStateRaw(cwd);
    await writeFile(
      path.join(cwd, "synthex-ui.json"),
      JSON.stringify({
        version: 1,
        framework: "expo",
        packageManager: "npm",
        componentsDir: "components/ui",
        css: null,
        provider: "components/synthex-provider.tsx",
      }),
    );
    await expect(diffComponents(["button"], { cwd, registryRoot })).rejects.toThrow(/directory or platform/i);
    await expect(updateComponents(["button"], { cwd, registryRoot })).rejects.toThrow(/directory or platform/i);
    expect((await readStateRaw(cwd))?.equals(stateBefore!)).toBe(true);

    const plain = await setupFixture(stdComponents());
    await addComponents(["button"], { cwd: plain.cwd, registryRoot: plain.registryRoot });
    const before2 = await readStateRaw(plain.cwd);
    await writeFile(
      path.join(plain.cwd, "synthex-ui.json"),
      JSON.stringify({
        version: 1,
        framework: "vite",
        packageManager: "npm",
        componentsDir: "src/components/ui",
        css: "src/synthex.css",
        provider: "src/components/synthex-provider.tsx",
      }),
    );
    await expect(diffComponents(["button"], { cwd: plain.cwd, registryRoot: plain.registryRoot })).rejects.toThrow(
      /directory or platform/i,
    );
    expect((await readStateRaw(plain.cwd))?.equals(before2!)).toBe(true);
  });

  it("remote data manifest round-trips; http upstream change updates if fetch allows", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    const remote = { name: "remote-btn", files: { "index.ts": "remote v1\n", "extra.ts": "extra v1\n" } };
    const url = `data:application/json,${encodeURIComponent(JSON.stringify(remote))}`;
    await addComponents([url], { cwd, registryRoot });
    const preview = await diffComponents([url], { cwd, registryRoot });
    expect(preview.files).toHaveLength(2);
    expect(preview.files.every((f) => f.status === "unchanged")).toBe(true);

    const httpUrl = "https://example.com/remote-btn.json";
    const v1 = { name: "http-btn", files: { "index.ts": "http v1\n" } };
    const v2 = { name: "http-btn", files: { "index.ts": "http v2\n" } };
    let current = v1;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(current), { status: 200 })),
    );
    const httpCwd = await trackTmp("synthex-http-");
    roots.push(httpCwd);
    await addComponents([httpUrl], { cwd: httpCwd, registryRoot });
    current = v2;
    const updated = await updateComponents([httpUrl], { cwd: httpCwd, registryRoot });
    expect(updated.conflicts).toBe(0);
    expect(await readFile(proj(httpCwd, "components/ui/http-btn/index.ts"), "utf8")).toBe("http v2\n");
  });

  it("idempotent second update creates no new backup", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    await addComponents(["button"], { cwd, registryRoot });
    expect(await listBackups(cwd)).toHaveLength(1);
    await writeRegistryFile(registryRoot, "button", "button.tsx", "export const Button = 'v2';\n");
    const first = await updateComponents(["button"], { cwd, registryRoot });
    expect(first.backupDir).not.toBeNull();
    expect(await listBackups(cwd)).toHaveLength(2);
    const second = await updateComponents(["button"], { cwd, registryRoot });
    expect(second.conflicts).toBe(0);
    expect(second.backupDir).toBeNull();
    expect(await listBackups(cwd)).toHaveLength(2);
  });

  it("add --overwrite backs up prior bytes and refreshes baseline", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    const first = await addComponents(["button"], { cwd, registryRoot });
    expect(first.backupDir).not.toBeNull();
    expect(await listBackups(cwd)).toHaveLength(1);
    await writeFile(proj(cwd, "components/ui/button/button.tsx"), "user edit\n");
    await expect(addComponents(["button"], { cwd, registryRoot })).rejects.toThrow(/overwrite/i);
    const over = await addComponents(["button"], { cwd, registryRoot, overwrite: true });
    expect(over.backupDir).not.toBeNull();
    expect(await readFile(proj(cwd, "components/ui/button/button.tsx"), "utf8")).toBe(
      "export const Button = 'v1';\n",
    );
    expect(
      await readFile(path.join(over.backupDir!, "files", "components", "ui", "button", "button.tsx"), "utf8"),
    ).toBe("user edit\n");
    const state = await readState(cwd);
    expect(Buffer.from(state.files["components/ui/button/button.tsx"].base, "base64").toString("utf8")).toBe(
      "export const Button = 'v1';\n",
    );
  });

  it("update manifest exposes cwd, dryRun, file diffs, conflicts and null dirs on preview", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    await addComponents(["button"], { cwd, registryRoot });
    await writeFile(proj(cwd, "components/ui/button/button.tsx"), "ONE\ntwo\n");
    await writeRegistryFile(registryRoot, "button", "button.tsx", "one\nTWO\n");
    const preview = await diffComponents([], { cwd, registryRoot });
    expect(preview.cwd).toBe(path.resolve(cwd));
    expect(preview.dryRun).toBe(true);
    expect(preview.backupDir).toBeNull();
    expect(preview.conflictDir).toBeNull();
    expect(typeof preview.conflicts).toBe("number");
    for (const f of preview.files) {
      expect(typeof f.path).toBe("string");
      expect(typeof f.component).toBe("string");
      expect(typeof f.status).toBe("string");
      expect(typeof f.diff).toBe("string");
      expect(typeof f.localDiff).toBe("string");
      expect(typeof f.upstreamDiff).toBe("string");
    }
  });

  it("manual resolution via resolved preserves current bytes and advances baseline", async () => {
    const { registryRoot, cwd } = await setupFixture({
      version: "1.0.0",
      components: { button: { "note.ts": "a\nb\nc\nd\n" } },
    });
    await addComponents(["button"], { cwd, registryRoot });
    await writeFile(proj(cwd, "components/ui/button/note.ts"), "a\nLOCAL\nc\nd\n");
    await writeRegistryFile(registryRoot, "button", "note.ts", "a\nREMOTE\nc\nd\n");
    const blocked = await updateComponents(["button"], { cwd, registryRoot });
    expect(blocked.conflicts).toBe(1);
    expect(blocked.backupDir).toBeNull();
    await writeFile(proj(cwd, "components/ui/button/note.ts"), "a\nLOCAL kept\nc\nd\n");
    const resolved = await updateComponents(["button"], {
      cwd,
      registryRoot,
      resolved: ["components/ui/button/note.ts"],
    });
    expect(resolved.conflicts).toBe(0);
    expect(resolved.backupDir).not.toBeNull();
    expect(resolved.files.find((f) => f.path === "components/ui/button/note.ts")!.status).toBe("resolved");
    expect(await readFile(proj(cwd, "components/ui/button/note.ts"), "utf8")).toBe("a\nLOCAL kept\nc\nd\n");
    const state = await readState(cwd);
    expect(Buffer.from(state.files["components/ui/button/note.ts"].base, "base64").toString("utf8")).toBe(
      "a\nREMOTE\nc\nd\n",
    );
    await writeRegistryFile(registryRoot, "button", "note.ts", "a\nREMOTE\nc\nD\n");
    const next = await updateComponents(["button"], { cwd, registryRoot });
    expect(next.conflicts).toBe(0);
    expect(await readFile(proj(cwd, "components/ui/button/note.ts"), "utf8")).toContain("LOCAL kept");
    expect(await readFile(proj(cwd, "components/ui/button/note.ts"), "utf8")).toContain("D");
  });

  it("resolved dry-run never writes; unknown or non-conflict resolved paths refuse everything", async () => {
    const { registryRoot, cwd } = await setupFixture({
      version: "1.0.0",
      components: { button: { "note.ts": "a\nb\nc\nd\n", "other.ts": "x\n" } },
    });
    await addComponents(["button"], { cwd, registryRoot });
    await writeFile(proj(cwd, "components/ui/button/note.ts"), "a\nLOCAL\nc\nd\n");
    await writeRegistryFile(registryRoot, "button", "note.ts", "a\nREMOTE\nc\nd\n");
    const stateBefore = await readStateRaw(cwd);
    const dry = await updateComponents(["button"], {
      cwd,
      registryRoot,
      dryRun: true,
      resolved: ["components/ui/button/note.ts"],
    });
    expect(dry.dryRun).toBe(true);
    expect(dry.backupDir).toBeNull();
    expect(dry.conflictDir).toBeNull();
    expect(dry.files.find((f) => f.path === "components/ui/button/note.ts")!.status).toBe("resolved");
    expect(await readFile(proj(cwd, "components/ui/button/note.ts"), "utf8")).toBe("a\nLOCAL\nc\nd\n");
    expect((await readStateRaw(cwd))?.equals(stateBefore!)).toBe(true);
    expect(await listBackups(cwd)).toHaveLength(1);
    await expect(
      updateComponents(["button"], { cwd, registryRoot, resolved: ["components/ui/button/missing.ts"] }),
    ).rejects.toThrow(/unknown resolved/i);
    await expect(
      updateComponents(["button"], { cwd, registryRoot, resolved: ["components/ui/button/other.ts"] }),
    ).rejects.toThrow(/not a conflicting/i);
    expect(await readFile(proj(cwd, "components/ui/button/note.ts"), "utf8")).toBe("a\nLOCAL\nc\nd\n");
    expect((await readStateRaw(cwd))?.equals(stateBefore!)).toBe(true);
    expect(await listBackups(cwd)).toHaveLength(1);
  });
});

async function removeRegistryComponent(registryRoot: string, comp: string): Promise<void> {
  await rm(path.join(registryRoot, comp), { recursive: true, force: true });
  const raw = await readFile(path.join(registryRoot, "registry.json"), "utf8");
  const meta = JSON.parse(raw) as { components?: { name?: unknown }[] };
  meta.components = (meta.components ?? []).filter((entry) => entry?.name !== comp);
  await writeFile(path.join(registryRoot, "registry.json"), JSON.stringify(meta, null, 2));
}

describe("retired upstream components", () => {
  it("retires one component with backup while another still updates, then stays a no-op", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents("1.0.0"));
    await addComponents(["button", "card"], { cwd, registryRoot });
    await removeRegistryComponent(registryRoot, "button");
    await writeRegistryFile(registryRoot, "card", "card.tsx", "export const Card = 'v2';\n");
    await setRegistryVersion(registryRoot, "1.1.0");
    const result = await updateComponents([], { cwd, registryRoot });
    expect(result.conflicts).toBe(0);
    const retired = result.files.find((f) => f.path === "components/ui/button/button.tsx");
    expect(retired!.status).toBe("deleted");
    const advanced = result.files.find((f) => f.path === "components/ui/card/card.tsx");
    expect(advanced!.status).toBe("updated");
    expect(await pathExists(proj(cwd, "components/ui/button/button.tsx"))).toBe(false);
    expect(await readFile(proj(cwd, "components/ui/card/card.tsx"), "utf8")).toBe(
      "export const Card = 'v2';\n",
    );
    expect(result.backupDir).not.toBeNull();
    expect(
      await readFile(path.join(result.backupDir!, "files", "components", "ui", "button", "button.tsx"), "utf8"),
    ).toBe("export const Button = 'v1';\n");
    const state = await readState(cwd);
    expect(state.files["components/ui/button/button.tsx"]).toBeUndefined();
    expect(state.files["components/ui/card/card.tsx"]).toBeDefined();
    expect(state.requests).toContain("button");
    expect(state.requests).toContain("card");
    const second = await updateComponents([], { cwd, registryRoot });
    expect(second.conflicts).toBe(0);
    expect(second.backupDir).toBeNull();
    expect(await pathExists(proj(cwd, "components/ui/button/button.tsx"))).toBe(false);
    expect(state.requests).toContain("button");
  });

  it("edited retirement conflicts and aborts the batch without writes", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents("1.0.0"));
    await addComponents(["button", "card"], { cwd, registryRoot });
    const stateBefore = await readStateRaw(cwd);
    await writeFile(proj(cwd, "components/ui/button/button.tsx"), "export const Button = 'local';\n");
    await writeRegistryFile(registryRoot, "card", "card.tsx", "export const Card = 'v2';\n");
    await removeRegistryComponent(registryRoot, "button");
    const blocked = await updateComponents([], { cwd, registryRoot });
    expect(blocked.conflicts).toBe(1);
    expect(blocked.backupDir).toBeNull();
    expect(blocked.files.find((f) => f.path === "components/ui/button/button.tsx")!.status).toBe("conflict");
    expect(await readFile(proj(cwd, "components/ui/button/button.tsx"), "utf8")).toBe(
      "export const Button = 'local';\n",
    );
    expect(await readFile(proj(cwd, "components/ui/card/card.tsx"), "utf8")).toBe("export const Card = 'v1';\n");
    expect((await readStateRaw(cwd))?.equals(stateBefore!)).toBe(true);
  });

  it("retired names stay recognized after their files are gone; unknown names still error", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents("1.0.0"));
    await addComponents(["button"], { cwd, registryRoot });
    await removeRegistryComponent(registryRoot, "button");
    const first = await updateComponents([], { cwd, registryRoot });
    expect(first.conflicts).toBe(0);
    const named = await updateComponents(["button"], { cwd, registryRoot });
    expect(named.conflicts).toBe(0);
    expect(named.backupDir).toBeNull();
    expect(named.files).toHaveLength(0);
    await expect(updateComponents(["nope"], { cwd, registryRoot })).rejects.toThrow(/not recorded/i);
    await expect(diffComponents(["nope"], { cwd, registryRoot })).rejects.toThrow(/unknown component/i);
  });

  it("missing metadata, advertised names and live dependents never retire tracked files", async () => {
    const missing = await setupFixture(stdComponents("1.0.0"));
    await addComponents(["button"], { cwd: missing.cwd, registryRoot: missing.registryRoot });
    await rm(path.join(missing.registryRoot, "button"), { recursive: true, force: true });
    await rm(path.join(missing.registryRoot, "registry.json"), { force: true });
    await expect(updateComponents(["button"], { cwd: missing.cwd, registryRoot: missing.registryRoot })).rejects.toThrow(
      /unknown component/i,
    );
    expect(await pathExists(proj(missing.cwd, "components/ui/button/button.tsx"))).toBe(true);

    const malformed = await setupFixture(stdComponents("1.0.0"));
    await addComponents(["button"], { cwd: malformed.cwd, registryRoot: malformed.registryRoot });
    await rm(path.join(malformed.registryRoot, "button"), { recursive: true, force: true });
    await writeFile(path.join(malformed.registryRoot, "registry.json"), "{nope");
    await expect(
      updateComponents(["button"], { cwd: malformed.cwd, registryRoot: malformed.registryRoot }),
    ).rejects.toThrow(/unknown component/i);
    expect(await pathExists(proj(malformed.cwd, "components/ui/button/button.tsx"))).toBe(true);

    const advertised = await setupFixture(stdComponents("1.0.0"));
    await addComponents(["button"], { cwd: advertised.cwd, registryRoot: advertised.registryRoot });
    await rm(path.join(advertised.registryRoot, "button"), { recursive: true, force: true });
    await expect(
      updateComponents(["button"], { cwd: advertised.cwd, registryRoot: advertised.registryRoot }),
    ).rejects.toThrow(/unknown component/i);
    expect(await pathExists(proj(advertised.cwd, "components/ui/button/button.tsx"))).toBe(true);

    const dependent = await setupFixture({
      version: "1.0.0",
      components: {
        button: { "button.tsx": "export const Button = 'v1';\n" },
        card: { "card.tsx": "export const Card = 'v1';\n" },
      },
      registryDeps: { card: ["button"] },
    });
    await addComponents(["button", "card"], { cwd: dependent.cwd, registryRoot: dependent.registryRoot });
    await removeRegistryComponent(dependent.registryRoot, "button");
    await expect(
      updateComponents(["card"], { cwd: dependent.cwd, registryRoot: dependent.registryRoot }),
    ).rejects.toThrow(/unknown component/i);
    expect(await pathExists(proj(dependent.cwd, "components/ui/card/card.tsx"))).toBe(true);
  });

  it("rejects a non-directory payload rather than treating it as retirement", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    await addComponents(["button"], { cwd, registryRoot });
    const originalState = await readStateRaw(cwd);
    await removeRegistryComponent(registryRoot, "button");
    await writeFile(path.join(registryRoot, "button"), "broken payload");
    await expect(updateComponents(["button"], { cwd, registryRoot })).rejects.toThrow(/unknown component/i);
    expect(await readStateRaw(cwd)).toEqual(originalState);
    expect(await readFile(proj(cwd, "components/ui/button/button.tsx"), "utf8")).toContain("'v1'");
  });

  it("remote rename deletes unmodified old paths with backup and converges", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    const url = "https://example.com/w.json";
    const v1 = { name: "wid1", files: { "a.ts": "aaa\n" } };
    const v2 = { name: "wid2", files: { "b.ts": "bbb\n" } };
    let current: unknown = v1;
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(current), { status: 200 })));
    await addComponents([url], { cwd, registryRoot });
    current = v2;
    const result = await updateComponents([url], { cwd, registryRoot });
    expect(result.conflicts).toBe(0);
    expect(result.files.find((f) => f.path === "components/ui/wid1/a.ts")!.status).toBe("deleted");
    expect(result.files.find((f) => f.path === "components/ui/wid2/b.ts")!.status).toBe("created");
    expect(await pathExists(proj(cwd, "components/ui/wid1/a.ts"))).toBe(false);
    expect(await readFile(proj(cwd, "components/ui/wid2/b.ts"), "utf8")).toBe("bbb\n");
    expect(result.backupDir).not.toBeNull();
    expect(await readFile(path.join(result.backupDir!, "files", "components", "ui", "wid1", "a.ts"), "utf8")).toBe(
      "aaa\n",
    );
    const state = await readState(cwd);
    expect(Object.keys(state.files)).toEqual(["components/ui/wid2/b.ts"]);
    expect(state.requests).toContain(url);
    const second = await updateComponents([url], { cwd, registryRoot });
    expect(second.conflicts).toBe(0);
    expect(second.backupDir).toBeNull();
  });

  it("remote rename with local edits conflicts and installs nothing", async () => {
    const { registryRoot, cwd } = await setupFixture(stdComponents());
    const url = "https://example.com/w.json";
    const v1 = { name: "wid1", files: { "a.ts": "aaa\n" } };
    const v2 = { name: "wid2", files: { "b.ts": "bbb\n" } };
    let current: unknown = v1;
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(current), { status: 200 })));
    await addComponents([url], { cwd, registryRoot });
    const stateBefore = await readStateRaw(cwd);
    await writeFile(proj(cwd, "components/ui/wid1/a.ts"), "local edit\n");
    current = v2;
    const blocked = await updateComponents([url], { cwd, registryRoot });
    expect(blocked.conflicts).toBe(1);
    expect(blocked.backupDir).toBeNull();
    expect(blocked.files.find((f) => f.path === "components/ui/wid1/a.ts")!.status).toBe("conflict");
    expect(await readFile(proj(cwd, "components/ui/wid1/a.ts"), "utf8")).toBe("local edit\n");
    expect(await pathExists(proj(cwd, "components/ui/wid2/b.ts"))).toBe(false);
    expect((await readStateRaw(cwd))?.equals(stateBefore!)).toBe(true);
  });
});
