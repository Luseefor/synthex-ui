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

  it("refuses to overwrite without --overwrite and overwrites with it", async () => {
    const registryRoot = await createFakeRegistry();
    const cwd = await createTempCwd();

    await addComponents(["button"], { cwd, registryRoot });
    await expect(addComponents(["button"], { cwd, registryRoot })).rejects.toThrow(/overwrite/i);

    const manifest = await addComponents(["button"], { cwd, registryRoot, overwrite: true });
    expect(manifest.files.every((file) => file.status === "overwritten")).toBe(true);
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
