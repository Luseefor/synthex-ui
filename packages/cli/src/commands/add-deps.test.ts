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

function bunAddCalls(infoSpy: ReturnType<typeof vi.spyOn>): string[] {
  return infoSpy.mock.calls
    .map((args: unknown[]) => String(args[0] ?? ""))
    .filter((message: string) => message.startsWith("bun add"));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("add install hint", () => {
  it("unions deps across two components", async () => {
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

    const calls = bunAddCalls(infoSpy);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBe(
      "bun add @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority clsx tailwind-merge",
    );
  });

  it("includes transitive registryDependencies deps", async () => {
    const { registryRoot, cwd } = await setupFakeRegistry([
      { name: "parent", deps: ["parent-dep"], registryDependencies: ["child"] },
      { name: "child", deps: ["child-dep", "react"], registryDependencies: [] },
    ]);
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await addComponents(["parent"], { cwd, registryRoot });

    const calls = bunAddCalls(infoSpy);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBe("bun add child-dep parent-dep");
  });

  it("prints nothing when only peer deps remain", async () => {
    const { registryRoot, cwd } = await setupFakeRegistry([
      { name: "peer-only", deps: ["react", "react-native"], registryDependencies: [] },
    ]);
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await addComponents(["peer-only"], { cwd, registryRoot });

    expect(bunAddCalls(infoSpy)).toEqual([]);
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

    expect(bunAddCalls(infoSpy)).toEqual([]);
  });
});
