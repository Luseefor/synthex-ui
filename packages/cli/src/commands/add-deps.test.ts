import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { addComponents } from "./add";
import { logger } from "../utils/logger";

interface FakeEntry {
  readonly name: string;
  readonly deps: readonly string[];
  readonly registryDependencies: readonly string[];
}

async function setupFakeRegistry(entries: readonly FakeEntry[]): Promise<{
  registryRoot: string;
  cwd: string;
}> {
  const registryRoot = await mkdtemp(path.join(tmpdir(), "synthex-deps-registry-"));
  const cwd = await mkdtemp(path.join(tmpdir(), "synthex-deps-cwd-"));
  for (const entry of entries) {
    const dir = path.join(registryRoot, entry.name);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.ts"), `export const ${entry.name.replace(/-/g, "_")} = 1;\n`);
  }
  await writeFile(
    path.join(registryRoot, "registry.json"),
    JSON.stringify({ components: entries }),
  );
  return { registryRoot, cwd };
}

function installHintCalls(infoSpy: ReturnType<typeof vi.spyOn>): string[] {
  return infoSpy.mock.calls
    .map((args: unknown[]) => String(args[0] ?? ""))
    .filter(
      (message: string) =>
        message.startsWith("npm install") ||
        message.startsWith("pnpm add") ||
        message.startsWith("yarn add") ||
        message.startsWith("bun add"),
    );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("add install hint", () => {
  it("unions deps across two components with default npm", async () => {
    const { registryRoot, cwd } = await setupFakeRegistry([
      {
        name: "button",
        deps: ["@radix-ui/react-slot", "class-variance-authority", "react"],
        registryDependencies: ["_shared"],
      },
      {
        name: "dialog",
        deps: ["@radix-ui/react-dialog", "react"],
        registryDependencies: ["_shared"],
      },
      { name: "_shared", deps: ["clsx", "tailwind-merge", "react"], registryDependencies: [] },
    ]);
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await addComponents(["button", "dialog"], { cwd, registryRoot });

    const calls = installHintCalls(infoSpy);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBe(
      "npm install @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority clsx tailwind-merge",
    );
  });

  it("includes transitive registryDependencies deps with default npm", async () => {
    const { registryRoot, cwd } = await setupFakeRegistry([
      { name: "parent", deps: ["parent-dep"], registryDependencies: ["child"] },
      { name: "child", deps: ["child-dep", "react"], registryDependencies: [] },
    ]);
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await addComponents(["parent"], { cwd, registryRoot });

    const calls = installHintCalls(infoSpy);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBe("npm install child-dep parent-dep");
  });

  it("prints nothing when only peer deps remain", async () => {
    const { registryRoot, cwd } = await setupFakeRegistry([
      { name: "peer-only", deps: ["react", "react-native"], registryDependencies: [] },
    ]);
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await addComponents(["peer-only"], { cwd, registryRoot });

    expect(installHintCalls(infoSpy)).toEqual([]);
  });

  it("prints nothing on dry-run", async () => {
    const { registryRoot, cwd } = await setupFakeRegistry([
      {
        name: "button",
        deps: ["@radix-ui/react-slot", "react"],
        registryDependencies: [],
      },
    ]);
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await addComponents(["button"], { cwd, registryRoot, dryRun: true });

    expect(installHintCalls(infoSpy)).toEqual([]);
  });
});

describe("add install hint package manager resolution", () => {
  async function writeUiConfig(cwd: string, packageManager: string): Promise<void> {
    await writeFile(
      path.join(cwd, "synthex-ui.json"),
      JSON.stringify({
        version: 1,
        framework: "vite",
        packageManager,
        componentsDir: "components/ui",
        css: "synthex.css",
        provider: "components/synthex-provider.tsx",
      }),
    );
  }

  it("uses config packageManager when no explicit override", async () => {
    const { registryRoot, cwd } = await setupFakeRegistry([
      { name: "button", deps: ["left-dep"], registryDependencies: [] },
    ]);
    await writeUiConfig(cwd, "pnpm");
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await addComponents(["button"], { cwd, registryRoot });

    expect(installHintCalls(infoSpy)).toEqual(["pnpm add left-dep"]);
  });

  it("explicit override wins over config packageManager", async () => {
    const { registryRoot, cwd } = await setupFakeRegistry([
      { name: "button", deps: ["left-dep"], registryDependencies: [] },
    ]);
    await writeUiConfig(cwd, "pnpm");
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await addComponents(["button"], { cwd, registryRoot, packageManager: "yarn" });

    expect(installHintCalls(infoSpy)).toEqual(["yarn add left-dep"]);
  });

  it("detects nearest lockfile when no config is present", async () => {
    const { registryRoot, cwd } = await setupFakeRegistry([
      { name: "button", deps: ["left-dep"], registryDependencies: [] },
    ]);
    await writeFile(path.join(cwd, "yarn.lock"), "");
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await addComponents(["button"], { cwd, registryRoot });

    expect(installHintCalls(infoSpy)).toEqual(["yarn add left-dep"]);
  });

  it("explicit bun override prints bun hint without config", async () => {
    const { registryRoot, cwd } = await setupFakeRegistry([
      { name: "button", deps: ["left-dep"], registryDependencies: [] },
    ]);
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await addComponents(["button"], { cwd, registryRoot, packageManager: "bun" });

    expect(installHintCalls(infoSpy)).toEqual(["bun add left-dep"]);
  });
});
