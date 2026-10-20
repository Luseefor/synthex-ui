import { mkdtemp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createProject } from "./create";

async function createFakeTemplate(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "synthex-template-"));
  await mkdir(path.join(root, "src"), { recursive: true });
  await writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify({ name: "synthex-starter", version: "0.1.0" }, null, 2)}\n`,
    "utf8",
  );
  await writeFile(path.join(root, "src", "main.tsx"), "export const main = 1;\n", "utf8");
  await writeFile(path.join(root, "README.md"), "# starter\n", "utf8");
  return root;
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
});
