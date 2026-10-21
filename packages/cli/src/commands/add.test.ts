import { mkdtemp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi, afterEach } from "vitest";
import { addComponents, isRegistrySpec, isUrlSpec, parseRegistryReference } from "./add";
import { listAvailableComponents } from "./list";

async function createFakeRegistry(): Promise<string> {
  const registryRoot = await mkdtemp(path.join(tmpdir(), "synthex-registry-"));
  const buttonDir = path.join(registryRoot, "button");
  const dialogDir = path.join(registryRoot, "dialog");
  await mkdir(buttonDir, { recursive: true });
  await mkdir(dialogDir, { recursive: true });
  await writeFile(path.join(buttonDir, "button.web.tsx"), "export const Button = 1;\n");
  await writeFile(path.join(buttonDir, "button.shared.ts"), "export const shared = 1;\n");
  await writeFile(path.join(buttonDir, "index.ts"), "export * from './button.web';\n");
  await writeFile(path.join(dialogDir, "dialog.web.tsx"), "export const Dialog = 1;\n");
  return registryRoot;
}

async function createTempCwd(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "synthex-cwd-"));
}

async function setupRegistryWithMetadata(
  components: readonly { name: string; files: Record<string, string>; registryDependencies?: readonly string[] }[],
): Promise<{ registryRoot: string; cwd: string }> {
  const registryRoot = await mkdtemp(path.join(tmpdir(), "synthex-meta-registry-"));
  const cwd = await mkdtemp(path.join(tmpdir(), "synthex-meta-cwd-"));
  for (const entry of components) {
    const dir = path.join(registryRoot, entry.name);
    await mkdir(dir, { recursive: true });
    for (const [rel, content] of Object.entries(entry.files)) {
      const full = path.join(dir, rel);
      await mkdir(path.dirname(full), { recursive: true });
      await writeFile(full, content);
    }
  }
  await writeFile(
    path.join(registryRoot, "registry.json"),
    JSON.stringify({
      components: components.map((entry) => ({
        name: entry.name,
        deps: [],
        registryDependencies: entry.registryDependencies ?? [],
      })),
    }),
  );
  return { registryRoot, cwd };
}

describe("addComponents", () => {
  it("dry-run lists files without writing", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();

    const manifest = await addComponents(["button"], { cwd, registryRoot, dryRun: true });

    expect(manifest.dryRun).toBe(true);
    expect(manifest.components).toEqual(["button"]);
    expect(manifest.destinationRoot).toBe(path.join(path.resolve(cwd), "components", "ui"));
    expect(manifest.files.map((file) => file.relativePath).sort()).toEqual([
      "button.shared.ts",
      "button.web.tsx",
      "index.ts",
    ]);
    expect(manifest.files.every((file) => file.status === "planned")).toBe(true);

    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });

  it("copies the whole component dir into components/ui/<comp>", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();

    const manifest = await addComponents(["button", "dialog"], { cwd, registryRoot });

    expect(manifest.files).toHaveLength(4);
    expect(manifest.files.every((file) => file.status === "written")).toBe(true);

    const buttonContent = await readFile(path.join(cwd, "components", "ui", "button", "button.web.tsx"), "utf8");
    expect(buttonContent).toBe("export const Button = 1;\n");
    const dialogContent = await readFile(path.join(cwd, "components", "ui", "dialog", "dialog.web.tsx"), "utf8");
    expect(dialogContent).toBe("export const Dialog = 1;\n");
  });

  it("skips identical files and refuses changed files without --overwrite", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();

    await addComponents(["button"], { cwd, registryRoot });
    const second = await addComponents(["button"], { cwd, registryRoot });
    expect(second.files.every((file) => file.status === "skipped-existing")).toBe(true);

    await writeFile(path.join(cwd, "components", "ui", "button", "index.ts"), "changed\n");
    await expect(addComponents(["button"], { cwd, registryRoot })).rejects.toThrow(/overwrite/i);

    const manifest = await addComponents(["button"], { cwd, registryRoot, overwrite: true });
    const byRel = new Map(manifest.files.map((f) => [f.relativePath, f.status]));
    expect(byRel.get("index.ts")).toBe("overwritten");
    expect(byRel.get("button.web.tsx")).toBe("skipped-existing");
  });

  it("throws for unknown components", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();

    await expect(addComponents(["missing"], { cwd, registryRoot })).rejects.toThrow(/unknown component/i);
    await expect(addComponents([], { cwd, registryRoot })).rejects.toThrow(/at least one/i);
  });
});

describe("listAvailableComponents", () => {
  it("lists component dirs from the registry", async () => {
    const registryRoot = await createFakeRegistry();
    await expect(listAvailableComponents(registryRoot)).resolves.toEqual(["button", "dialog"]);
  });
});

describe("registry references (@<registry>/<name>)", () => {
  it("parses @<registry>/<component>", () => {
    expect(parseRegistryReference("@synthex/button")).toEqual({ registry: "synthex", component: "button" });
    expect(parseRegistryReference("@local/dialog")).toEqual({ registry: "local", component: "dialog" });
  });

  it("classifies registry vs url specs", () => {
    expect(isRegistrySpec("@synthex/button")).toBe(true);
    expect(isRegistrySpec("button")).toBe(false);
    expect(isUrlSpec("https://example.com/button.json")).toBe(true);
    expect(isUrlSpec("http://example.com/button.json")).toBe(true);
    expect(isUrlSpec("button")).toBe(false);
    expect(isRegistrySpec("https://example.com/button.json")).toBe(false);
  });

  it("resolves @registry/name locally like a plain name", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();

    const manifest = await addComponents(["@synthex/button"], { cwd, registryRoot });

    expect(manifest.components).toEqual(["@synthex/button"]);
    expect(manifest.files.every((file) => file.component === "button")).toBe(true);
    const content = await readFile(path.join(cwd, "components", "ui", "button", "button.web.tsx"), "utf8");
    expect(content).toBe("export const Button = 1;\n");
  });

  it("rejects malformed registry references", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();

    await expect(addComponents(["@"], { cwd, registryRoot })).rejects.toThrow(/registry/i);
    await expect(addComponents(["@synthex/"], { cwd, registryRoot })).rejects.toThrow(/registry/i);
    expect(() => parseRegistryReference("@a/b/c")).toThrow(/registry/i);
  });
});

describe("remote URL specs", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches a JSON manifest from a data: URL and writes files under cwd", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();
    const remote = {
      name: "remote-button",
      files: {
        "remote-button.web.tsx": "export const Remote = 1;\n",
        "index.ts": "export * from './remote-button.web';\n",
      },
    };
    const url = `data:application/json,${encodeURIComponent(JSON.stringify(remote))}`;

    const manifest = await addComponents([url], { cwd, registryRoot });

    expect(manifest.files).toHaveLength(2);
    expect(manifest.files.every((file) => file.component === "remote-button")).toBe(true);
    expect(manifest.files.every((file) => file.status === "written")).toBe(true);

    const written = await readFile(
      path.join(cwd, "components", "ui", "remote-button", "remote-button.web.tsx"),
      "utf8",
    );
    expect(written).toBe("export const Remote = 1;\n");
  });

  it("fetches a JSON manifest from an http(s) URL via mocked fetch", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();
    const url = "https://example.com/registry/http-button.json";
    const payload = {
      name: "http-button",
      files: {
        "http-button.web.tsx": "export const HttpButton = 1;\n",
      },
    };

    const fetchMock = vi.fn(async (_input: string | URL | Request) => {
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const manifest = await addComponents([url], { cwd, registryRoot });

    expect(fetchMock).toHaveBeenCalledWith(url);
    expect(manifest.files).toHaveLength(1);
    expect(manifest.files[0]?.component).toBe("http-button");

    const written = await readFile(
      path.join(cwd, "components", "ui", "http-button", "http-button.web.tsx"),
      "utf8",
    );
    expect(written).toBe("export const HttpButton = 1;\n");
  });
});

describe("transitive registryDependencies", () => {
  it("copies transitive siblings to preserve relative imports", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "parent", files: { "index.ts": "parent\n" }, registryDependencies: ["child"] },
      { name: "child", files: { "index.ts": "child\n" }, registryDependencies: ["_shared"] },
      { name: "_shared", files: { "index.ts": "shared\n" }, registryDependencies: [] },
    ]);

    const manifest = await addComponents(["parent"], { cwd, registryRoot });

    expect(manifest.files.map((f) => f.component).sort()).toEqual(["_shared", "child", "parent"]);
    await expect(readFile(path.join(cwd, "components", "ui", "parent", "index.ts"), "utf8")).resolves.toBe(
      "parent\n",
    );
    await expect(readFile(path.join(cwd, "components", "ui", "child", "index.ts"), "utf8")).resolves.toBe(
      "child\n",
    );
    await expect(readFile(path.join(cwd, "components", "ui", "_shared", "index.ts"), "utf8")).resolves.toBe(
      "shared\n",
    );
  });

  it("is cycle-safe and dedupes repeated deps", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "a", files: { "index.ts": "a\n" }, registryDependencies: ["b"] },
      { name: "b", files: { "index.ts": "b\n" }, registryDependencies: ["a"] },
    ]);

    const manifest = await addComponents(["a", "b", "a"], { cwd, registryRoot });

    expect(manifest.files.map((f) => `${f.component}/${f.relativePath}`).sort()).toEqual([
      "a/index.ts",
      "b/index.ts",
    ]);
  });

  it("dry-run plans the transitive closure without writing", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "parent", files: { "index.ts": "parent\n" }, registryDependencies: ["child"] },
      { name: "child", files: { "index.ts": "child\n" }, registryDependencies: [] },
    ]);

    const manifest = await addComponents(["parent"], { cwd, registryRoot, dryRun: true });

    expect(manifest.files.map((f) => f.component).sort()).toEqual(["child", "parent"]);
    expect(manifest.files.every((f) => f.status === "planned")).toBe(true);
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });

  it("rejects invalid registryDependency names before writing", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "bad", files: { "index.ts": "bad\n" }, registryDependencies: ["bad/name"] },
    ]);

    await expect(addComponents(["bad"], { cwd, registryRoot })).rejects.toThrow(/invalid component/i);
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });
});

describe("copy filtering and atomic preflight", () => {
  it("skips test/spec files and __tests__ dirs", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      {
        name: "button",
        files: {
          "index.ts": "good\n",
          "button.test.ts": "test\n",
          "button.spec.tsx": "spec\n",
          "__tests__/inner.ts": "inner\n",
        },
        registryDependencies: [],
      },
    ]);

    const manifest = await addComponents(["button"], { cwd, registryRoot });

    expect(manifest.files.map((f) => f.relativePath)).toEqual(["index.ts"]);
    await expect(stat(path.join(cwd, "components", "ui", "button", "button.test.ts"))).rejects.toThrow();
  });

  it("dedupes duplicate requests", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "good\n" }, registryDependencies: [] },
    ]);

    const manifest = await addComponents(["button", "button", "@synthex/button"], { cwd, registryRoot });

    expect(manifest.files).toHaveLength(1);
    expect(manifest.files[0]).toMatchObject({ component: "button", relativePath: "index.ts" });
  });

  it("leaves project untouched when a later component is unknown", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "good\n" }, registryDependencies: [] },
    ]);

    await expect(addComponents(["button", "missing"], { cwd, registryRoot })).rejects.toThrow(
      /unknown component/i,
    );
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });

  it("leaves project untouched on late conflict", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "good\n" }, registryDependencies: [] },
      { name: "dialog", files: { "index.ts": "dialog\n" }, registryDependencies: [] },
    ]);
    await mkdir(path.join(cwd, "components", "ui", "dialog"), { recursive: true });
    await writeFile(path.join(cwd, "components", "ui", "dialog", "index.ts"), "existing\n");

    await expect(addComponents(["button", "dialog"], { cwd, registryRoot })).rejects.toThrow(/overwrite/i);
    await expect(stat(path.join(cwd, "components", "ui", "button"))).rejects.toThrow();
    await expect(readFile(path.join(cwd, "components", "ui", "dialog", "index.ts"), "utf8")).resolves.toBe(
      "existing\n",
    );
  });

  it("dry-run reports conflicts as skipped-existing without writing", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "good\n" }, registryDependencies: [] },
    ]);
    await mkdir(path.join(cwd, "components", "ui", "button"), { recursive: true });
    await writeFile(path.join(cwd, "components", "ui", "button", "index.ts"), "existing\n");

    const manifest = await addComponents(["button"], { cwd, registryRoot, dryRun: true });

    expect(manifest.files[0]?.status).toBe("skipped-existing");
    await expect(readFile(path.join(cwd, "components", "ui", "button", "index.ts"), "utf8")).resolves.toBe(
      "existing\n",
    );
  });
});

describe("supported registries", () => {
  it("allows @synthex, @default and bare @name but rejects unknown namespaces", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "good\n" }, registryDependencies: [] },
    ]);

    for (const spec of ["@synthex/button", "@default/button", "@button"]) {
      const runCwd = await createTempCwd();
      const manifest = await addComponents([spec], { cwd: runCwd, registryRoot });
      expect(manifest.files[0]?.component).toBe("button");
    }

    await expect(addComponents(["@other/button"], { cwd, registryRoot })).rejects.toThrow(/unsupported registry/i);
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });
});

describe("incremental adds with shared deps", () => {
  it("skips identical shared files on second add", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "button\n" }, registryDependencies: ["_shared"] },
      { name: "card", files: { "index.ts": "card\n" }, registryDependencies: ["_shared"] },
      { name: "_shared", files: { "index.ts": "shared\n" }, registryDependencies: [] },
    ]);

    const first = await addComponents(["button"], { cwd, registryRoot });
    expect(first.files.map((f) => f.component).sort()).toEqual(["_shared", "button"]);

    const second = await addComponents(["card"], { cwd, registryRoot });
    const byKey = new Map(second.files.map((f) => [`${f.component}/${f.relativePath}`, f.status]));
    expect(byKey.get("card/index.ts")).toBe("written");
    expect(byKey.get("_shared/index.ts")).toBe("skipped-existing");
  });

  it("fails without writes when a shared file was changed", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "button\n" }, registryDependencies: ["_shared"] },
      { name: "card", files: { "index.ts": "card\n" }, registryDependencies: ["_shared"] },
      { name: "_shared", files: { "index.ts": "shared\n" }, registryDependencies: [] },
    ]);

    await addComponents(["button"], { cwd, registryRoot });
    await writeFile(path.join(cwd, "components", "ui", "_shared", "index.ts"), "user-edited\n");

    await expect(addComponents(["card"], { cwd, registryRoot })).rejects.toThrow(/overwrite/i);
    await expect(stat(path.join(cwd, "components", "ui", "card"))).rejects.toThrow();
    await expect(readFile(path.join(cwd, "components", "ui", "_shared", "index.ts"), "utf8")).resolves.toBe(
      "user-edited\n",
    );
  });

  it("does not borrow default metadata for custom roots", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();

    const manifest = await addComponents(["button"], { cwd, registryRoot });

    expect(manifest.files.every((f) => f.component === "button")).toBe(true);
    await expect(stat(path.join(cwd, "components", "ui", "_shared"))).rejects.toThrow();
  });

  it("rejects distinct sources claiming the same destination but dedupes exact duplicates", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();
    const urlA = `data:application/json,${encodeURIComponent(
      JSON.stringify({ name: "dup", files: { "index.ts": "a\n" } }),
    )}`;
    const urlB = `data:application/json,${encodeURIComponent(
      JSON.stringify({ name: "dup", files: { "index.ts": "b\n" } }),
    )}`;

    await expect(addComponents([urlA, urlB], { cwd, registryRoot })).rejects.toThrow(/conflicting sources/i);
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();

    const dupCwd = await createTempCwd();
    const dup = await addComponents([urlA, urlA], { cwd: dupCwd, registryRoot });
    expect(dup.files).toHaveLength(1);
    await expect(readFile(path.join(dupCwd, "components", "ui", "dup", "index.ts"), "utf8")).resolves.toBe("a\n");
  });
});
