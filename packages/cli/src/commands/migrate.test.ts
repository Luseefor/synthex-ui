import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { migrateShadcn, needsMigrate, transformMigrateSource } from "./migrate";

async function createFixture(): Promise<string> {
  const cwd = await mkdtemp(path.join(tmpdir(), "synthex-migrate-"));
  await mkdir(path.join(cwd, "src"), { recursive: true });
  await mkdir(path.join(cwd, "node_modules", "dep"), { recursive: true });
  await writeFile(
    path.join(cwd, "src", "aliased.tsx"),
    'import { Button } from "@/components/ui/button";\n',
    "utf8",
  );
  await writeFile(
    path.join(cwd, "src", "relative.ts"),
    'import { Dialog } from "../ui/dialog";\n',
    "utf8",
  );
  await writeFile(path.join(cwd, "src", "clean.ts"), "export const clean = 1;\n", "utf8");
  await writeFile(path.join(cwd, "src", "notes.txt"), 'from "@/components/ui/button"\n', "utf8");
  await writeFile(
    path.join(cwd, "node_modules", "dep", "index.ts"),
    'import { Button } from "@/components/ui/button";\n',
    "utf8",
  );
  return cwd;
}

describe("migrate transform", () => {
  it("rewrites shadcn ui imports to synthex-ui/components", () => {
    expect(transformMigrateSource('import { Button } from "@/components/ui/button";')).toBe(
      'import { Button } from "synthex-ui/components";',
    );
    expect(needsMigrate("export const clean = 1;\n")).toBe(false);
    expect(needsMigrate('import { Dialog } from "../ui/dialog";')).toBe(true);
  });
});

describe("migrateShadcn", () => {
  it("dry-run reports files without writing", async () => {
    const cwd = await createFixture();

    const result = await migrateShadcn({ cwd, dryRun: true });

    expect(result.dryRun).toBe(true);
    expect(result.changed).toBe(2);
    expect(result.files).toHaveLength(2);

    const aliased = await readFile(path.join(cwd, "src", "aliased.tsx"), "utf8");
    expect(aliased).toContain("@/components/ui/button");
  });

  it("rewrites matching ts/tsx/js/jsx files and skips node_modules", async () => {
    const cwd = await createFixture();

    const result = await migrateShadcn({ cwd });

    expect(result.changed).toBe(2);
    expect(await readFile(path.join(cwd, "src", "aliased.tsx"), "utf8")).toBe(
      'import { Button } from "synthex-ui/components";\n',
    );
    expect(await readFile(path.join(cwd, "src", "relative.ts"), "utf8")).toBe(
      'import { Dialog } from "synthex-ui/components";\n',
    );
    expect(await readFile(path.join(cwd, "src", "clean.ts"), "utf8")).toBe("export const clean = 1;\n");
    expect(await readFile(path.join(cwd, "node_modules", "dep", "index.ts"), "utf8")).toContain(
      "@/components/ui/button",
    );
  });
});
