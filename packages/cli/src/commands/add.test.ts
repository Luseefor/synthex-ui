import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi, afterEach } from "vitest";
import { addComponents, isRegistrySpec, isUrlSpec, parseRegistryReference, planComponents } from "./add";
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

  it("dry-run rejects changed files without overwrite like a real run", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "good\n" }, registryDependencies: [] },
    ]);
    await mkdir(path.join(cwd, "components", "ui", "button"), { recursive: true });
    await writeFile(path.join(cwd, "components", "ui", "button", "index.ts"), "existing\n");

    await expect(addComponents(["button"], { cwd, registryRoot, dryRun: true })).rejects.toThrow(/overwrite/i);
    await expect(readFile(path.join(cwd, "components", "ui", "button", "index.ts"), "utf8")).resolves.toBe(
      "existing\n",
    );
  });

  it("dry-run reports identical files as skipped-existing", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "good\n" }, registryDependencies: [] },
    ]);
    await mkdir(path.join(cwd, "components", "ui", "button"), { recursive: true });
    await writeFile(path.join(cwd, "components", "ui", "button", "index.ts"), "good\n");

    const manifest = await addComponents(["button"], { cwd, registryRoot, dryRun: true });

    expect(manifest.files[0]?.status).toBe("skipped-existing");
  });

  it("dry-run with overwrite plans changed files without writing", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "good\n" }, registryDependencies: [] },
    ]);
    await mkdir(path.join(cwd, "components", "ui", "button"), { recursive: true });
    await writeFile(path.join(cwd, "components", "ui", "button", "index.ts"), "existing\n");

    const manifest = await addComponents(["button"], { cwd, registryRoot, dryRun: true, overwrite: true });

    expect(manifest.files[0]?.status).toBe("planned");
    await expect(readFile(path.join(cwd, "components", "ui", "button", "index.ts"), "utf8")).resolves.toBe(
      "existing\n",
    );
  });

  it("dry-run remote rejects changed files without overwrite", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();
    const remote = { name: "remote-btn", files: { "index.ts": "good\n" } };
    const url = `data:application/json,${encodeURIComponent(JSON.stringify(remote))}`;

    await addComponents([url], { cwd, registryRoot });
    await expect(addComponents([url], { cwd, registryRoot, dryRun: true, overwrite: true })).resolves.toBeDefined();
    await writeFile(path.join(cwd, "components", "ui", "remote-btn", "index.ts"), "edited\n");

    await expect(addComponents([url], { cwd, registryRoot, dryRun: true })).rejects.toThrow(/overwrite/i);
    await expect(readFile(path.join(cwd, "components", "ui", "remote-btn", "index.ts"), "utf8")).resolves.toBe(
      "edited\n",
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

describe("ui config destinationRoot", () => {
  async function writeConfig(cwd: string, config: unknown): Promise<void> {
    await writeFile(path.join(cwd, "synthex-ui.json"), typeof config === "string" ? config : JSON.stringify(config));
  }

  function validConfig(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      version: 1,
      framework: "vite",
      packageManager: "npm",
      componentsDir: "src/components/ui",
      css: "src/synthex.css",
      provider: "src/components/synthex-provider.tsx",
      ...overrides,
    };
  }

  it("copies into configured src/components/ui", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();
    await writeConfig(cwd, validConfig());

    const manifest = await addComponents(["button"], { cwd, registryRoot });

    expect(manifest.destinationRoot).toBe(path.join(path.resolve(cwd), "src", "components", "ui"));
    await expect(
      readFile(path.join(cwd, "src", "components", "ui", "button", "button.web.tsx"), "utf8"),
    ).resolves.toBe("export const Button = 1;\n");
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });

  it("falls back to legacy components/ui without config", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();

    const manifest = await addComponents(["button"], { cwd, registryRoot });

    expect(manifest.destinationRoot).toBe(path.join(path.resolve(cwd), "components", "ui"));
    await expect(
      readFile(path.join(cwd, "components", "ui", "button", "button.web.tsx"), "utf8"),
    ).resolves.toBe("export const Button = 1;\n");
  });

  it("dry-run plans configured dir without writing", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();
    await writeConfig(cwd, validConfig());

    const manifest = await addComponents(["button"], { cwd, registryRoot, dryRun: true });

    expect(manifest.destinationRoot).toBe(path.join(path.resolve(cwd), "src", "components", "ui"));
    expect(manifest.files.every((file) => file.destination.startsWith(manifest.destinationRoot))).toBe(true);
    await expect(stat(path.join(cwd, "src"))).rejects.toThrow();
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });

  it("fails before writes on escaping componentsDir", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();
    await writeConfig(cwd, validConfig({ componentsDir: "../escape" }));

    await expect(addComponents(["button"], { cwd, registryRoot })).rejects.toThrow(/invalid synthex-ui\.json/i);
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
    await expect(stat(path.join(cwd, "src"))).rejects.toThrow();
  });

  it("fails before writes on malformed config", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();
    await writeFile(path.join(cwd, "synthex-ui.json"), "{ not json");

    await expect(addComponents(["button"], { cwd, registryRoot })).rejects.toThrow(/synthex-ui\.json/i);
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });

  it("rejects invalid packageManager without writes", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();

    await expect(
      addComponents(["button"], { cwd, registryRoot, packageManager: "deno" as never }),
    ).rejects.toThrow(/package manager/i);
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });
});

describe("platform-aware copy with ui config", () => {
  async function setupPlatformRegistry(): Promise<{ registryRoot: string; cwd: string }> {
    return setupRegistryWithMetadata([
      {
        name: "button",
        files: {
          "button.web.tsx":
            'import { Slot } from "@radix-ui/react-slot";\nimport { cn } from "../_shared/variants";\nexport const ButtonWeb = 1;\n',
          "button.native.tsx":
            'import { Pressable } from "react-native";\nimport { useTheme } from "../_shared/theme/context";\nexport const ButtonNative = 1;\n',
          "button.shared.ts": "export const shared = 1;\n",
          "index.ts": 'export { Button, buttonVariants } from "./button.web";\nexport const webOnly = 1;\n',
          "index.native.ts": 'export { Button } from "./button.native";\nexport const nativeOnly = 1;\n',
        },
        registryDependencies: ["_shared"],
      },
      {
        name: "_shared",
        files: {
          "variants.ts": "export const cn = 1;\n",
          "theme/context.tsx": "export const useTheme = 1;\n",
          "theme/index.ts": 'export { ThemeProvider } from "./ThemeProvider.web";\n',
          "theme/ThemeProvider.web.tsx": "export const ProviderWeb = 1;\n",
          "theme/ThemeProvider.native.tsx": "export const ProviderNative = 1;\n",
        },
        registryDependencies: [],
      },
    ]);
  }

  async function writeViteConfig(cwd: string): Promise<void> {
    await writeFile(
      path.join(cwd, "synthex-ui.json"),
      JSON.stringify({
        version: 1,
        framework: "vite",
        packageManager: "npm",
        componentsDir: "src/components/ui",
        css: "src/synthex.css",
        provider: "src/components/synthex-provider.tsx",
      }),
    );
  }

  async function writeExpoConfig(cwd: string): Promise<void> {
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
  }

  it("web config filters .native files so Vite builds without react-native", async () => {
    const { registryRoot, cwd } = await setupPlatformRegistry();
    await writeViteConfig(cwd);

    const manifest = await addComponents(["button"], { cwd, registryRoot });

    const rels = manifest.files.map((f) => f.relativePath);
    expect(rels).not.toContain("button.native.tsx");
    expect(rels).not.toContain("index.native.ts");
    expect(rels).toContain("button.web.tsx");
    expect(rels).toContain("index.ts");

    await expect(stat(path.join(cwd, "src", "components", "ui", "button", "button.native.tsx"))).rejects.toThrow();
    await expect(stat(path.join(cwd, "src", "components", "ui", "button", "index.native.ts"))).rejects.toThrow();

    const indexContent = await readFile(
      path.join(cwd, "src", "components", "ui", "button", "index.ts"),
      "utf8",
    );
    expect(indexContent).toContain("./button.web");

    const webContent = await readFile(
      path.join(cwd, "src", "components", "ui", "button", "button.web.tsx"),
      "utf8",
    );
    expect(webContent).not.toContain("react-native");

    await expect(stat(path.join(cwd, "src/components/ui/_shared/theme/index.ts"))).rejects.toThrow();
  });

  it("expo config drops .web files and prefers native barrel", async () => {
    const { registryRoot, cwd } = await setupPlatformRegistry();
    await writeExpoConfig(cwd);

    const manifest = await addComponents(["button"], { cwd, registryRoot });

    const rels = manifest.files.map((f) => f.relativePath);
    expect(rels).not.toContain("button.web.tsx");
    expect(rels).not.toContain("theme/ThemeProvider.web.tsx");
    expect(rels).toContain("button.native.tsx");
    expect(rels).toContain("index.native.ts");
    expect(rels).toContain("index.ts");

    await expect(stat(path.join(cwd, "components", "ui", "button", "button.web.tsx"))).rejects.toThrow();

    const buttonIndex = await readFile(path.join(cwd, "components", "ui", "button", "index.ts"), "utf8");
    expect(buttonIndex).toContain("nativeOnly");
    expect(buttonIndex).not.toContain("webOnly");
    expect(buttonIndex).not.toContain("./button.web");

    await expect(stat(path.join(cwd, "components/ui/_shared/theme/index.ts"))).rejects.toThrow();

    const nativeContent = await readFile(
      path.join(cwd, "components", "ui", "button", "button.native.tsx"),
      "utf8",
    );
    expect(nativeContent).toContain("react-native");
    expect(nativeContent).not.toContain("@radix-ui");
  });

  it("explicit _shared preserves the platform theme provider and remaps native imports", async () => {
    for (const native of [false, true]) {
      const { registryRoot, cwd } = await setupPlatformRegistry();
      if (native) await writeExpoConfig(cwd); else await writeViteConfig(cwd);
      const result = await addComponents(["_shared"], { cwd, registryRoot });
      const theme = await readFile(path.join(result.destinationRoot, "_shared/theme/index.ts"), "utf8");
      expect(theme).toContain(native ? "./ThemeProvider.native" : "./ThemeProvider.web");
      expect(result.files.some((file) => file.relativePath === `theme/ThemeProvider.${native ? "web" : "native"}.tsx`)).toBe(false);
    }
  });

  it("expo second add is idempotent for native barrels", async () => {
    const { registryRoot, cwd } = await setupPlatformRegistry();
    await writeExpoConfig(cwd);

    await addComponents(["button"], { cwd, registryRoot });
    const second = await addComponents(["button"], { cwd, registryRoot });

    expect(second.files.every((f) => f.status === "skipped-existing")).toBe(true);
    const buttonIndex = await readFile(path.join(cwd, "components", "ui", "button", "index.ts"), "utf8");
    expect(buttonIndex).toContain("nativeOnly");
  });

  it("expo dry-run lists remapped native barrel without writing", async () => {
    const { registryRoot, cwd } = await setupPlatformRegistry();
    await writeExpoConfig(cwd);

    const manifest = await addComponents(["button"], { cwd, registryRoot, dryRun: true });

    const rels = manifest.files.map((f) => f.relativePath);
    expect(rels).toContain("index.ts");
    expect(rels).toContain("index.native.ts");
    expect(rels).not.toContain("button.web.tsx");
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });

  it("expo rejects edited transformed file without overwrite and leaves project intact", async () => {
    const { registryRoot, cwd } = await setupPlatformRegistry();
    await writeExpoConfig(cwd);

    await addComponents(["button"], { cwd, registryRoot });
    await writeFile(path.join(cwd, "components", "ui", "button", "index.ts"), "user-edited\n");

    await expect(addComponents(["button"], { cwd, registryRoot })).rejects.toThrow(/overwrite/i);
    await expect(readFile(path.join(cwd, "components", "ui", "button", "index.ts"), "utf8")).resolves.toBe(
      "user-edited\n",
    );

    const fixed = await addComponents(["button"], { cwd, registryRoot, overwrite: true });
    expect(fixed.files.find((f) => f.relativePath === "index.ts")?.status).toBe("overwritten");
    await expect(readFile(path.join(cwd, "components", "ui", "button", "index.ts"), "utf8")).resolves.toContain(
      "nativeOnly",
    );
  });

  it("expo dry-run rejects edited transformed file without overwrite", async () => {
    const { registryRoot, cwd } = await setupPlatformRegistry();
    await writeExpoConfig(cwd);

    await addComponents(["button"], { cwd, registryRoot });
    await writeFile(path.join(cwd, "components", "ui", "button", "index.ts"), "user-edited\n");

    await expect(addComponents(["button"], { cwd, registryRoot, dryRun: true })).rejects.toThrow(/overwrite/i);
    await expect(
      addComponents(["button"], { cwd, registryRoot, dryRun: true, overwrite: true }),
    ).resolves.toBeDefined();
  });

  it("legacy no-config preserves both platforms", async () => {
    const { registryRoot, cwd } = await setupPlatformRegistry();

    const manifest = await addComponents(["button"], { cwd, registryRoot });

    const rels = manifest.files.map((f) => f.relativePath);
    expect(rels).toContain("button.web.tsx");
    expect(rels).toContain("button.native.tsx");
    expect(rels).toContain("index.ts");
    expect(rels).toContain("index.native.ts");

    const indexContent = await readFile(path.join(cwd, "components", "ui", "button", "index.ts"), "utf8");
    expect(indexContent).toContain("./button.web");
  });

  it("web dry-run plans only web files", async () => {
    const { registryRoot, cwd } = await setupPlatformRegistry();
    await writeViteConfig(cwd);

    const manifest = await addComponents(["button"], { cwd, registryRoot, dryRun: true });

    const rels = manifest.files.map((f) => f.relativePath);
    expect(rels).not.toContain("button.native.tsx");
    expect(rels).toContain("button.web.tsx");
    await expect(stat(path.join(cwd, "src"))).rejects.toThrow();
  });

  it("throws when platform filtering empties a component", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      {
        name: "native-only",
        files: { "only.native.tsx": "export const x = 1;\n" },
        registryDependencies: [],
      },
    ]);
    await writeViteConfig(cwd);

    await expect(addComponents(["native-only"], { cwd, registryRoot })).rejects.toThrow(/no files to copy/i);
    await expect(stat(path.join(cwd, "src"))).rejects.toThrow();
  });

  it("expo remote manifest drops .web and prefers native barrel", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();
    await writeExpoConfig(cwd);
    const remote = {
      name: "remote-btn",
      files: {
        "button.web.tsx": 'import { Slot } from "@radix-ui/react-slot";\nexport const W = 1;\n',
        "button.native.tsx": 'import { Pressable } from "react-native";\nexport const N = 1;\n',
        "index.ts": 'export { Button, buttonVariants } from "./button.web";\nexport const webOnly = 1;\n',
        "index.native.ts": 'export { Button } from "./button.native";\nexport const nativeOnly = 1;\n',
      },
    };
    const url = `data:application/json,${encodeURIComponent(JSON.stringify(remote))}`;

    const manifest = await addComponents([url], { cwd, registryRoot });

    const rels = manifest.files.map((f) => f.relativePath);
    expect(rels).not.toContain("button.web.tsx");
    expect(rels).toContain("button.native.tsx");
    expect(rels).toContain("index.ts");

    const indexContent = await readFile(path.join(cwd, "components", "ui", "remote-btn", "index.ts"), "utf8");
    expect(indexContent).toContain("nativeOnly");
    expect(indexContent).not.toContain("webOnly");

    const second = await addComponents([url], { cwd, registryRoot });
    expect(second.files.every((f) => f.status === "skipped-existing")).toBe(true);
  });

  it("expo remote rejects edited transformed file without overwrite", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();
    await writeExpoConfig(cwd);
    const remote = {
      name: "remote-btn",
      files: {
        "index.ts": 'export { Button } from "./button.web";\n',
        "index.native.ts": 'export { Button } from "./button.native";\n',
        "button.native.tsx": 'import { Pressable } from "react-native";\nexport const N = 1;\n',
      },
    };
    const url = `data:application/json,${encodeURIComponent(JSON.stringify(remote))}`;

    await addComponents([url], { cwd, registryRoot });
    await writeFile(path.join(cwd, "components", "ui", "remote-btn", "index.ts"), "edited\n");

    await expect(addComponents([url], { cwd, registryRoot })).rejects.toThrow(/overwrite/i);
  });

  it("expo remaps real _shared/theme barrel to ThemeProvider.native", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      {
        name: "_shared",
        files: {
          "theme/index.ts":
            'export { ThemeProvider } from "./ThemeProvider.web";\nexport { useTheme } from "./context";\n',
          "theme/context.tsx": "export const useTheme = 1;\n",
          "theme/ThemeProvider.web.tsx": "export const ProviderWeb = 1;\n",
          "theme/ThemeProvider.native.tsx": "export const ProviderNative = 1;\n",
        },
        registryDependencies: [],
      },
    ]);
    await writeExpoConfig(cwd);

    const manifest = await addComponents(["_shared"], { cwd, registryRoot });

    expect(manifest.files.map((f) => f.relativePath)).not.toContain("theme/ThemeProvider.web.tsx");
    const indexContent = await readFile(
      path.join(cwd, "components", "ui", "_shared", "theme", "index.ts"),
      "utf8",
    );
    expect(indexContent).toContain('"./ThemeProvider.native"');
    expect(indexContent).not.toContain('"./ThemeProvider.web"');

    const second = await addComponents(["_shared"], { cwd, registryRoot });
    expect(second.files.every((f) => f.status === "skipped-existing")).toBe(true);
  });

  it("expo preserves .web import when no native sibling exists", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      {
        name: "custom",
        files: {
          "index.ts": 'export { A } from "./with-native.web";\nexport { B } from "./without-native.web";\n',
          "with-native.web.tsx": "export const A = 1;\n",
          "with-native.native.tsx": "export const A = 1;\n",
          "without-native.web.tsx": "export const B = 1;\n",
        },
        registryDependencies: [],
      },
    ]);
    await writeExpoConfig(cwd);

    const manifest = await addComponents(["custom"], { cwd, registryRoot });

    expect(manifest.files.map((f) => f.relativePath)).not.toContain("with-native.web.tsx");
    expect(manifest.files.map((f) => f.relativePath)).not.toContain("without-native.web.tsx");
    const indexContent = await readFile(path.join(cwd, "components", "ui", "custom", "index.ts"), "utf8");
    expect(indexContent).toContain('"./with-native.native"');
    expect(indexContent).toContain('"./without-native.web"');
    expect(indexContent).not.toContain('"./with-native.web"');
  });
});

describe("planComponents (read-only)", () => {
  it("returns upstream bytes and registry version when destination is locally edited", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "good\n" }, registryDependencies: [] },
    ]);
    await writeFile(
      path.join(registryRoot, "registry.json"),
      JSON.stringify({
        version: "9.9.9",
        components: [{ name: "button", deps: [], registryDependencies: [] }],
      }),
    );
    await mkdir(path.join(cwd, "components", "ui", "button"), { recursive: true });
    await writeFile(path.join(cwd, "components", "ui", "button", "index.ts"), "user-edited\n");

    const plan = await planComponents(["button"], { cwd, registryRoot });

    expect(plan.cwd).toBe(path.resolve(cwd));
    expect(plan.destinationRoot).toBe(path.join(path.resolve(cwd), "components", "ui"));
    expect(plan.platform).toBe(null);
    expect(plan.files).toHaveLength(1);
    const file = plan.files[0];
    expect(file?.component).toBe("button");
    expect(file?.relativePath).toBe("index.ts");
    expect(Buffer.isBuffer(file?.content)).toBe(true);
    expect(file?.content.toString("utf8")).toBe("good\n");
    expect(file?.registryVersion).toBe("9.9.9");
    await expect(readFile(path.join(cwd, "components", "ui", "button", "index.ts"), "utf8")).resolves.toBe(
      "user-edited\n",
    );
  });

  it("returns null registryVersion when registry.json has no version", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "index.ts": "good\n" }, registryDependencies: [] },
    ]);

    const plan = await planComponents(["button"], { cwd, registryRoot });

    expect(plan.files[0]?.registryVersion).toBe(null);
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });

  it("returns transformed native index bytes without writing", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      {
        name: "button",
        files: {
          "index.ts": 'export { Button } from "./button.web";\nexport const webOnly = 1;\n',
          "index.native.ts": 'export { Button } from "./button.native";\nexport const nativeOnly = 1;\n',
          "button.native.tsx": "export const N = 1;\n",
        },
        registryDependencies: [],
      },
    ]);
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

    const plan = await planComponents(["button"], { cwd, registryRoot });

    expect(plan.platform).toBe("native");
    const byRel = new Map(plan.files.map((f) => [f.relativePath, f.content.toString("utf8")]));
    expect(byRel.get("index.ts")).toContain("nativeOnly");
    expect(byRel.get("index.ts")).not.toContain("webOnly");
    expect(byRel.get("index.native.ts")).toContain("nativeOnly");
    expect(plan.files.every((f) => Buffer.isBuffer(f.content))).toBe(true);
    expect(plan.files.every((f) => f.registryVersion === null)).toBe(true);
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });

  it("returns remote bytes with null version and writes nothing", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();
    const remote = { name: "remote-btn", files: { "index.ts": "remote-good\n" } };
    const url = `data:application/json,${encodeURIComponent(JSON.stringify(remote))}`;

    const plan = await planComponents([url], { cwd, registryRoot });

    expect(plan.files).toHaveLength(1);
    expect(plan.files[0]?.component).toBe("remote-btn");
    expect(plan.files[0]?.content.toString("utf8")).toBe("remote-good\n");
    expect(plan.files[0]?.registryVersion).toBe(null);
    expect(plan.files[0]?.source).toBe(`${url}#index.ts`);
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });

  it("performs no filesystem writes for a dry plan", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();

    const plan = await planComponents(["button"], { cwd, registryRoot });

    expect(plan.files.length).toBeGreaterThan(0);
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });

  it("resolves default registry metadata without registryRoot", async () => {
    const cwd = await createTempCwd();

    const plan = await planComponents(["button"], { cwd });

    const keys = new Set(plan.files.map((f) => `${f.component}/${f.relativePath}`));
    expect([...keys].some((k) => k.startsWith("button/"))).toBe(true);
    expect(keys.has("_shared/variants.ts")).toBe(true);
    const localFiles = plan.files.filter((f) => f.component === "button" || f.component === "_shared");
    expect(localFiles.length).toBeGreaterThan(0);
    for (const f of localFiles) {
      expect(typeof f.registryVersion).toBe("string");
      expect((f.registryVersion as string).length).toBeGreaterThan(0);
    }
    await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
  });
});

describe("retired upstream components (allowRemoved)", () => {
  async function retireLocal(registryRoot: string, comp: string): Promise<void> {
    await rm(path.join(registryRoot, comp), { recursive: true, force: true });
    const raw = await readFile(path.join(registryRoot, "registry.json"), "utf8");
    const meta = JSON.parse(raw) as { components?: { name?: unknown }[] };
    meta.components = (meta.components ?? []).filter((entry) => entry?.name !== comp);
    await writeFile(path.join(registryRoot, "registry.json"), JSON.stringify(meta));
  }

  it("retires a tracked name explicitly dropped from valid metadata", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "button.tsx": "v1\n" } },
      { name: "card", files: { "card.tsx": "v1\n" } },
    ]);
    await retireLocal(registryRoot, "button");
    const plan = await planComponents(["button", "card"], {
      cwd,
      registryRoot,
      allowRemoved: ["button"],
    });
    expect(plan.removedComponents).toEqual(["button"]);
    expect(plan.files.map((f) => f.component).sort()).toEqual(["card"]);
  });

  it("plans normally with empty removedComponents when nothing is retired", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "button.tsx": "v1\n" } },
    ]);
    const plan = await planComponents(["button"], { cwd, registryRoot, allowRemoved: ["button"] });
    expect(plan.removedComponents).toEqual([]);
    expect(plan.files).toHaveLength(1);
  });

  it("still throws for missing names without allowRemoved", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "card", files: { "card.tsx": "v1\n" } },
    ]);
    await retireLocal(registryRoot, "card");
    await expect(planComponents(["card"], { cwd, registryRoot })).rejects.toThrow(/unknown component/i);
    await expect(
      planComponents(["card"], { cwd, registryRoot, allowRemoved: ["button"] }),
    ).rejects.toThrow(/unknown component/i);
    await expect(addComponents(["card"], { cwd, registryRoot })).rejects.toThrow(/unknown component/i);
  });

  it("fails closed when metadata still advertises the missing name", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "button.tsx": "v1\n" } },
    ]);
    await rm(path.join(registryRoot, "button"), { recursive: true, force: true });
    await expect(
      planComponents(["button"], { cwd, registryRoot, allowRemoved: ["button"] }),
    ).rejects.toThrow(/unknown component/i);
  });

  it("fails closed when another entry still depends on the missing name", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "button.tsx": "v1\n" } },
      { name: "card", files: { "card.tsx": "v1\n" }, registryDependencies: ["button"] },
    ]);
    await retireLocal(registryRoot, "button");
    await expect(
      planComponents(["card"], { cwd, registryRoot, allowRemoved: ["card", "button"] }),
    ).rejects.toThrow(/unknown component/i);
  });

  it("fails closed when metadata is missing or malformed", async () => {
    const { registryRoot, cwd } = await setupRegistryWithMetadata([
      { name: "button", files: { "button.tsx": "v1\n" } },
    ]);
    await rm(path.join(registryRoot, "button"), { recursive: true, force: true });
    await rm(path.join(registryRoot, "registry.json"), { force: true });
    await expect(
      planComponents(["button"], { cwd, registryRoot, allowRemoved: ["button"] }),
    ).rejects.toThrow(/unknown component/i);

    const broken = await setupRegistryWithMetadata([
      { name: "button", files: { "button.tsx": "v1\n" } },
    ]);
    await rm(path.join(broken.registryRoot, "button"), { recursive: true, force: true });
    await writeFile(path.join(broken.registryRoot, "registry.json"), "{nope");
    await expect(
      planComponents(["button"], { cwd: broken.cwd, registryRoot: broken.registryRoot, allowRemoved: ["button"] }),
    ).rejects.toThrow(/unknown component/i);
  });
});


describe("configured lean installs", () => {
  async function configured(framework: "vite" | "expo") {
    const cwd = await createTempCwd();
    await writeFile(path.join(cwd, "synthex-ui.json"), JSON.stringify({
      version: 1, framework, packageManager: "npm", componentsDir: "components/ui",
      css: framework === "expo" ? null : "synthex.css", provider: "components/synthex-provider.tsx",
    }));
    return cwd;
  }

  it("web Button plans just its public files and shared variants with exact deps", async () => {
    const cwd = await configured("vite");
    try {
      const plan = await planComponents(["button"], { cwd });
      expect(plan.files.map((file) => `${file.component}/${file.relativePath}`)).toEqual([
        "button/button.shared.ts", "button/button.web.tsx", "button/index.ts", "_shared/variants.ts",
      ]);
      expect(plan.dependencies).toEqual([
        "@radix-ui/react-slot", "class-variance-authority", "clsx", "tailwind-merge",
      ]);
      const manifest = await addComponents(["button"], { cwd, dryRun: true });
      expect(manifest.dependencies).toEqual(plan.dependencies);
      expect(manifest.installCommand).toBe("npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge");
      await expect(stat(path.join(cwd, "components"))).rejects.toThrow();
      await expect(stat(path.join(cwd, ".synthex"))).rejects.toThrow();
    } finally { await rm(cwd, { recursive: true, force: true }); }
  });

  it("native Button retains its theme closure without web Radix or lucide", async () => {
    const cwd = await configured("expo");
    try {
      const plan = await planComponents(["button"], { cwd });
      expect(plan.files.some((file) => file.relativePath.includes(".web."))).toBe(false);
      expect(plan.files.some((file) => file.component === "_shared" && file.relativePath === "theme/context.tsx")).toBe(true);
      expect(plan.files.some((file) => file.relativePath === "theme/ThemeProvider.web.tsx")).toBe(false);
      expect(plan.dependencies.some((dep) => dep.startsWith("@radix-ui/") || dep === "lucide-react")).toBe(false);
      expect(plan.files.some((file) => file.component === "_shared" && file.relativePath.includes("ThemeProvider"))).toBe(false);
    } finally { await rm(cwd, { recursive: true, force: true }); }
  });
});
