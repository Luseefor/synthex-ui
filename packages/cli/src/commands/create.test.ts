import { mkdtemp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createProject } from "./create";
import { getInstallCommand, getRunCommand } from "../utils/project";
import { PACKAGE_MANAGERS } from "../utils/assets";

async function createFakeTemplate(extra: Record<string, string> = {}): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "synthex-template-"));
  await mkdir(path.join(root, "src"), { recursive: true });
  await writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "synthex-starter",
        version: "0.1.0",
        scripts: { dev: "vite", start: "expo start" },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await writeFile(path.join(root, "src", "main.tsx"), "export const main = 1;\n", "utf8");
  await writeFile(path.join(root, "README.md"), "# starter\n", "utf8");
  for (const [rel, content] of Object.entries(extra)) {
    const full = path.join(root, rel);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, content, "utf8");
  }
  return root;
}

async function expectNoDestination(cwd: string, name: string): Promise<void> {
  await expect(stat(path.join(path.resolve(cwd), name))).rejects.toThrow();
}

describe("createProject", () => {
  it("copies the starter template and rewrites package.json name", async () => {
    const templateRoot = await createFakeTemplate();
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    const result = await createProject("my-app", { cwd, templateRoot });

    expect(result.name).toBe("my-app");
    expect(result.destination).toBe(path.join(path.resolve(cwd), "my-app"));
    expect(result.files).toContain("package.json");
    expect(result.files).toContain(path.join("src", "main.tsx"));

    const pkgRaw = await readFile(path.join(result.destination, "package.json"), "utf8");
    expect(JSON.parse(pkgRaw).name).toBe("my-app");

    const main = await readFile(path.join(result.destination, "src", "main.tsx"), "utf8");
    expect(main).toBe("export const main = 1;\n");
  });

  it("refuses to overwrite an existing destination", async () => {
    const templateRoot = await createFakeTemplate();
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    await createProject("my-app", { cwd, templateRoot });
    await expect(createProject("my-app", { cwd, templateRoot })).rejects.toThrow(/already exists/i);
  });

  it("rejects invalid names and missing templates", async () => {
    const templateRoot = await createFakeTemplate();
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    await expect(createProject("../escape", { cwd, templateRoot })).rejects.toThrow(/invalid project name/i);
    await expect(createProject("", { cwd, templateRoot })).rejects.toThrow(/invalid project name/i);
    await expect(
      createProject("fresh", { cwd, templateRoot: path.join(templateRoot, "missing") }),
    ).rejects.toThrow(/starter template/i);

    await expect(stat(path.join(cwd, "fresh"))).rejects.toThrow();
  });

  it("defaults to the vite template for backcompat", async () => {
    const templateRoot = await createFakeTemplate();
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    const result = await createProject("my-app", { cwd, templateRoot });

    expect(result.template).toBe("vite");
    expect(result.dryRun).toBe(false);
    expect(PACKAGE_MANAGERS).toContain(result.packageManager);
    expect(result.commands.install).toContain("install");
  });

  it("records the selected template and package manager override", async () => {
    const templateRoot = await createFakeTemplate();
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    const result = await createProject("native-app", {
      cwd,
      templateRoot,
      template: "expo",
      packageManager: "pnpm",
    });

    expect(result.template).toBe("expo");
    expect(result.packageManager).toBe("pnpm");
    expect(result.commands).toEqual({ install: "pnpm install", dev: "pnpm run start" });

    const pkgRaw = await readFile(path.join(result.destination, "package.json"), "utf8");
    expect(JSON.parse(pkgRaw).name).toBe("native-app");
  });

  it("records the next template selection", async () => {
    const templateRoot = await createFakeTemplate();
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    const result = await createProject("web-app", {
      cwd,
      templateRoot,
      template: "next",
      packageManager: "bun",
    });

    expect(result.template).toBe("next");
    expect(result.packageManager).toBe("bun");
    expect(result.commands).toEqual({ install: "bun install", dev: "bun run dev" });
  });

  it("dry-run plans the same files without writing", async () => {
    const templateRoot = await createFakeTemplate();
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    const planned = await createProject("planned-app", {
      cwd,
      templateRoot,
      template: "expo",
      packageManager: "yarn",
      dryRun: true,
    });

    expect(planned.dryRun).toBe(true);
    expect(planned.template).toBe("expo");
    expect(planned.packageManager).toBe("yarn");
    expect(planned.commands).toEqual({ install: "yarn install", dev: "yarn run start" });
    await expectNoDestination(cwd, "planned-app");

    const built = await createProject("built-app", {
      cwd,
      templateRoot,
      template: "expo",
      packageManager: "yarn",
    });

    expect(planned.files).toEqual(built.files);
    expect(planned.files).toContain("package.json");
  });

  it("rejects unsafe project names without creating the destination", async () => {
    const templateRoot = await createFakeTemplate();
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    for (const name of ["evil;rm -rf", "$(touch pwned)", "has space", "-flag", ".", "..", "a/b", "a\\b"]) {
      await expect(createProject(name, { cwd, templateRoot })).rejects.toThrow(/invalid project name/i);
    }
    await expectNoDestination(cwd, "evil;rm -rf");
  });

  it("rejects unknown templates and package managers before the destination exists", async () => {
    const templateRoot = await createFakeTemplate();
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    await expect(
      createProject("bad-template", { cwd, templateRoot, template: "angular" as never }),
    ).rejects.toThrow(/unknown template/i);
    await expectNoDestination(cwd, "bad-template");

    await expect(
      createProject("bad-pm", { cwd, templateRoot, packageManager: "yarn-classic" as never }),
    ).rejects.toThrow(/unknown package manager/i);
    await expectNoDestination(cwd, "bad-pm");
  });

  it("rejects templates with a missing or invalid package.json without writing", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    const emptyRoot = await mkdtemp(path.join(tmpdir(), "synthex-template-"));
    await writeFile(path.join(emptyRoot, "README.md"), "# empty\n", "utf8");
    await expect(createProject("no-pkg", { cwd, templateRoot: emptyRoot })).rejects.toThrow(
      /missing package\.json/i,
    );
    await expectNoDestination(cwd, "no-pkg");

    const brokenRoot = await createFakeTemplate();
    await writeFile(path.join(brokenRoot, "package.json"), "{ not json", "utf8");
    await expect(createProject("bad-pkg", { cwd, templateRoot: brokenRoot })).rejects.toThrow(
      /invalid json/i,
    );
    await expectNoDestination(cwd, "bad-pkg");

    const dryBroken = await createFakeTemplate();
    await writeFile(path.join(dryBroken, "package.json"), "[1, 2]", "utf8");
    await expect(
      createProject("dry-bad-pkg", { cwd, templateRoot: dryBroken, dryRun: true }),
    ).rejects.toThrow(/package\.json is invalid/i);
    await expectNoDestination(cwd, "dry-bad-pkg");
  });

  it("rejects templates missing the runnable script without writing", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    const devOnly = await createFakeTemplate();
    const devOnlyPkg = JSON.parse(await readFile(path.join(devOnly, "package.json"), "utf8"));
    delete devOnlyPkg.scripts.start;
    await writeFile(path.join(devOnly, "package.json"), `${JSON.stringify(devOnlyPkg, null, 2)}\n`, "utf8");

    await expect(createProject("no-start", { cwd, templateRoot: devOnly, template: "expo" })).rejects.toThrow(
      /missing script "start"/i,
    );
    await expectNoDestination(cwd, "no-start");
  });

  it("prints runnable commands matching each real template's scripts", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));
    const expected: Record<string, string> = { vite: "dev", next: "dev", expo: "start" };

    for (const [template, script] of Object.entries(expected)) {
      const result = await createProject(`real-${template}`, {
        cwd,
        template: template as "vite" | "next" | "expo",
        packageManager: "npm",
      });
      const templatePkg = JSON.parse(
        await readFile(path.join(result.destination, "package.json"), "utf8"),
      );
      expect(typeof templatePkg.scripts?.[script]).toBe("string");
      expect(result.commands.dev).toBe(`npm run ${script}`);
    }

    const nativePkg = JSON.parse(
      await readFile(
        path.join(cwd, "real-expo", "package.json"),
        "utf8",
      ),
    );
    expect(nativePkg.scripts?.dev).toBeUndefined();
    expect(typeof nativePkg.scripts?.start).toBe("string");
  });
});

describe("create command helpers", () => {
  it("getInstallCommand with no deps yields the bare install command", () => {
    expect(getInstallCommand("npm", [], {})).toBe("npm install");
    expect(getInstallCommand("pnpm", [], {})).toBe("pnpm install");
    expect(getInstallCommand("yarn", [], {})).toBe("yarn install");
    expect(getInstallCommand("bun", [], {})).toBe("bun install");
  });

  it("getRunCommand builds per-manager script commands", () => {
    expect(getRunCommand("npm", "dev")).toBe("npm run dev");
    expect(getRunCommand("pnpm", "dev")).toBe("pnpm run dev");
    expect(getRunCommand("yarn", "dev")).toBe("yarn run dev");
    expect(getRunCommand("bun", "dev")).toBe("bun run dev");
  });

  it("reports commands consistent with the detected package manager", async () => {
    const templateRoot = await createFakeTemplate();
    const cwd = await mkdtemp(path.join(tmpdir(), "synthex-create-"));

    const result = await createProject("cmd-app", {
      cwd,
      templateRoot,
      template: "vite",
      packageManager: "npm",
    });

    expect(result.commands.install).toBe(getInstallCommand("npm", [], {}));
    expect(result.commands.dev).toBe(getRunCommand("npm", "dev"));
  });
});
