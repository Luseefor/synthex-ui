import path from "node:path";
import { describe, expect, it } from "vitest";
import { selectComponentFiles } from "./componentFiles";
import type { RegistryComponentFile } from "./componentTypes";

const ROOT = path.resolve("/tmp/synthex-file-graph");

function makeFile(component: string, relativePath: string, content: string | Buffer): RegistryComponentFile {
  const normalized = relativePath.split("/").join(path.sep);
  return {
    component,
    relativePath,
    source: `registry/${component}/${relativePath}`,
    destination: path.join(ROOT, component, normalized),
    content: typeof content === "string" ? Buffer.from(content, "utf8") : content,
    registryVersion: "1.1.0",
  };
}

function keys(files: readonly RegistryComponentFile[]): string[] {
  return files.map((file) => `${file.component}/${file.relativePath}`);
}

describe("selectComponentFiles", () => {
  it("preserves legacy platform=null unchanged", () => {
    const files = [
      makeFile("button", "index.ts", `export { Button } from "./button.web";\n`),
      makeFile("_shared", "unused.ts", "export const unused = 1;\n"),
    ];
    expect(selectComponentFiles(files, ["button"], null)).toBe(files);
  });

  it("web button keeps only its variants closure without theme/native", () => {
    const files = [
      makeFile("button", "button.shared.ts", `import { defineVariants } from "../_shared/variants";\nexport const v = 1;\n`),
      makeFile("button", "button.web.tsx", `import { cn } from "../_shared/variants";\nimport type { P } from "./button.shared";\nexport const B = 1;\n`),
      makeFile("button", "index.ts", `export { Button } from "./button.web";\nexport { v } from "./button.shared";\n`),
      makeFile("_shared", "variants.ts", "export const cn = 1;\n"),
      makeFile("_shared", "theme/context.tsx", "export const useTheme = 1;\n"),
      makeFile("_shared", "unused.ts", "export const unused = 1;\n"),
    ];
    const selected = selectComponentFiles(files, ["button"], "web");
    expect(keys(selected)).toEqual([
      "button/button.shared.ts",
      "button/button.web.tsx",
      "button/index.ts",
      "_shared/variants.ts",
    ]);
  });

  it("native button retains the transitive theme closure via theme/context.tsx", () => {
    const files = [
      makeFile("button", "button.shared.ts", `import { defineVariants } from "../_shared/variants";\nexport const v = 1;\n`),
      makeFile("button", "button.native.tsx", `import { useTheme } from "../_shared/theme/context";\nimport { v } from "./button.shared";\nexport const B = 1;\n`),
      makeFile("button", "index.ts", `export { Button } from "./button.native";\nexport { v } from "./button.shared";\n`),
      makeFile("_shared", "variants.ts", "export const cn = 1;\n"),
      makeFile("_shared", "theme/context.tsx", `import { defaultTheme } from "./createTheme";\nimport type { T } from "../types";\nexport const useTheme = 1;\n`),
      makeFile("_shared", "theme/createTheme.ts", `import { colors } from "../tokens/colors";\nexport const defaultTheme = 1;\n`),
      makeFile("_shared", "types.ts", "export type T = number;\n"),
      makeFile("_shared", "tokens/colors.ts", "export const colors = 1;\n"),
      makeFile("_shared", "theme/ThemeProvider.native.tsx", "export const P = 1;\n"),
      makeFile("_shared", "unused.ts", "export const unused = 1;\n"),
    ];
    const selected = selectComponentFiles(files, ["button"], "native");
    expect(keys(selected)).toEqual([
      "button/button.shared.ts",
      "button/button.native.tsx",
      "button/index.ts",
      "_shared/variants.ts",
      "_shared/theme/context.tsx",
      "_shared/theme/createTheme.ts",
      "_shared/types.ts",
      "_shared/tokens/colors.ts",
    ]);
  });

  it("follows type-only, re-export, literal dynamic import/require and cycles", () => {
    const files = [
      makeFile(
        "demo",
        "index.ts",
        `import type { T } from "../_shared/types";\nconst lazy = await import("../_shared/lazy");\nconst cjs = require("../_shared/cjs");\nimport "../_shared/side";\nexport const x: T = 1;\n`,
      ),
      makeFile("_shared", "types.ts", "export type T = number;\n"),
      makeFile("_shared", "lazy.ts", `export * from "./cycle-a";\n`),
      makeFile("_shared", "cjs.ts", `export { A } from "./cycle-b";\n`),
      makeFile("_shared", "side.ts", "export const s = 1;\n"),
      makeFile("_shared", "cycle-a.ts", `export { B } from "./cycle-b";\nexport const A = 1;\n`),
      makeFile("_shared", "cycle-b.ts", `export { A } from "./cycle-a";\nexport const B = 1;\n`),
      makeFile("_shared", "unused.ts", "export const unused = 1;\n"),
    ];
    const selected = selectComponentFiles(files, ["demo"], "web");
    expect(keys(selected)).toEqual([
      "demo/index.ts",
      "_shared/types.ts",
      "_shared/lazy.ts",
      "_shared/cjs.ts",
      "_shared/side.ts",
      "_shared/cycle-a.ts",
      "_shared/cycle-b.ts",
    ]);
  });

  it("resolves platform-suffixed stems ./button.web, ./button.shared and ./button.native", () => {
    const files = [
      makeFile(
        "demo",
        "index.ts",
        `export { W } from "./button.web";\nexport { S } from "./button.shared";\nexport { N } from "./button.native";\n`,
      ),
      makeFile("demo", "button.web.tsx", "export const W = 1;\n"),
      makeFile("demo", "button.shared.ts", "export const S = 1;\n"),
      makeFile("demo", "button.native.tsx", "export const N = 1;\n"),
      makeFile("_shared", "variants.ts", "export const v = 1;\n"),
    ];
    // None of the three stems is an exact file; each must probe to its
    // suffixed source instead of throwing a missing-file error.
    // The unreferenced _shared file stays pruned.
    expect(keys(selectComponentFiles(files, ["demo"], "web"))).toEqual([
      "demo/index.ts",
      "demo/button.web.tsx",
      "demo/button.shared.ts",
      "demo/button.native.tsx",
    ]);
  });

  it("resolves sibling dirs, .js specifiers and directory index", () => {
    const files = [
      makeFile("demo", "index.ts", `import { a } from "../_shared/dir1/a";\nimport { v } from "../_shared/variants.js";\nimport { t } from "../_shared/theme";\nexport const x = 1;\n`),
      makeFile("_shared", "dir1/a.ts", `export { b } from "../dir2/b";\nexport const a = 1;\n`),
      makeFile("_shared", "dir2/b.ts", "export const b = 1;\n"),
      makeFile("_shared", "variants.ts", "export const v = 1;\n"),
      makeFile("_shared", "theme/index.ts", "export const t = 1;\n"),
      makeFile("_shared", "unused.ts", "export const unused = 1;\n"),
    ];
    const selected = selectComponentFiles(files, ["demo"], "web");
    expect(keys(selected)).toEqual([
      "demo/index.ts",
      "_shared/dir1/a.ts",
      "_shared/dir2/b.ts",
      "_shared/variants.ts",
      "_shared/theme/index.ts",
    ]);
  });

  it("keeps every non-_shared component without parsing it", () => {
    const files = [
      makeFile("button", "index.ts", `import { x } from "../_shared/variants";\nexport const b = 1;\n`),
      makeFile("card", "card.tsx", "export const card = 1;\n"),
      makeFile("_shared", "variants.ts", "export const x = 1;\n"),
      makeFile("_shared", "unused.ts", "export const unused = 1;\n"),
    ];
    expect(keys(selectComponentFiles(files, ["button"], "web"))).toEqual([
      "button/index.ts",
      "card/card.tsx",
      "_shared/variants.ts",
    ]);
  });

  it("explicitly requested _shared preserves everything", () => {
    const files = [
      makeFile("button", "index.ts", "export const b = 1;\n"),
      makeFile("_shared", "variants.ts", "export const v = 1;\n"),
      makeFile("_shared", "unused.ts", "export const u = 1;\n"),
    ];
    const selected = selectComponentFiles(files, ["button", "_shared"], "web");
    expect(keys(selected)).toEqual(["button/index.ts", "_shared/variants.ts", "_shared/unused.ts"]);
  });

  it("ignores comments and ordinary strings without false retention", () => {
    const files = [
      makeFile(
        "demo",
        "index.ts",
        `// import "../_shared/fake1";\n/* export * from "../_shared/fake2"; */\nconst s = "import '../_shared/fake3'";\nconst t = \`require("../_shared/fake4")\`;\nimport { v } from "../_shared/variants";\nexport const x = v;\n`,
      ),
      makeFile("_shared", "variants.ts", "export const v = 1;\n"),
      makeFile("_shared", "fake1.ts", "export const f = 1;\n"),
      makeFile("_shared", "fake2.ts", "export const f = 1;\n"),
      makeFile("_shared", "fake3.ts", "export const f = 1;\n"),
      makeFile("_shared", "fake4.ts", "export const f = 1;\n"),
    ];
    expect(keys(selectComponentFiles(files, ["demo"], "web"))).toEqual([
      "demo/index.ts",
      "_shared/variants.ts",
    ]);
  });

  it("does not mistake export-body strings for re-exports", () => {
    const files = [
      makeFile(
        "demo",
        "index.ts",
        `import { v } from "../_shared/variants";\nexport const body = { text: "not a from import" };\nconst lazy = require("../_shared/real");\nexport const x = v;\n`,
      ),
      makeFile("_shared", "variants.ts", "export const v = 1;\n"),
      makeFile("_shared", "real.ts", "export const r = 1;\n"),
      makeFile("_shared", "unused.ts", "export const u = 1;\n"),
    ];
    expect(keys(selectComponentFiles(files, ["demo"], "web"))).toEqual([
      "demo/index.ts",
      "_shared/variants.ts",
      "_shared/real.ts",
    ]);
  });

  it("preserves binary assets when referenced and prunes them otherwise", () => {
    const logo = Buffer.from([0x89, 0x50, 0x00, 0x41]);
    const files = [
      makeFile("demo", "index.ts", `import logo from "../_shared/logo.png";\nexport const l = logo;\n`),
      makeFile("_shared", "logo.png", logo),
      makeFile("_shared", "other.png", Buffer.from([0x89, 0x50, 0x00, 0x42])),
    ];
    expect(keys(selectComponentFiles(files, ["demo"], "web"))).toEqual([
      "demo/index.ts",
      "_shared/logo.png",
    ]);
  });

  it("conservatively preserves everything on dynamic variable imports", () => {
    const files = [
      makeFile("demo", "index.ts", `const name = "./x";\nconst mod = await import(name);\nexport const m = mod;\n`),
      makeFile("_shared", "a.ts", "export const a = 1;\n"),
      makeFile("_shared", "unused.ts", "export const u = 1;\n"),
    ];
    expect(keys(selectComponentFiles(files, ["demo"], "web"))).toEqual([
      "demo/index.ts",
      "_shared/a.ts",
      "_shared/unused.ts",
    ]);
  });

  it("throws an actionable error before writes for missing shared files", () => {
    const files = [
      makeFile("button", "button.web.tsx", `import { cn } from "../_shared/missing";\nexport const B = 1;\n`),
      makeFile("_shared", "variants.ts", "export const v = 1;\n"),
    ];
    expect(() => selectComponentFiles(files, ["button"], "web")).toThrow(
      /Cannot resolve relative import "..\/_shared\/missing".*button\/button\.web\.tsx/,
    );
  });

  it("keeps stable original ordering and does not mutate inputs", () => {
    const before = Buffer.from(`import { b } from "../_shared/b";\nexport const a = 1;\n`, "utf8");
    const sharedB = Buffer.from("export const b = 1;\n", "utf8");
    const files = [
      makeFile("demo", "index.ts", before),
      makeFile("_shared", "z.ts", "export const z = 1;\n"),
      makeFile("_shared", "b.ts", sharedB),
      makeFile("_shared", "a.ts", "export const a = 1;\n"),
    ];
    const snapshot = files.map((file) => file.content.toString("utf8"));
    const selected = selectComponentFiles(files, ["demo"], "web");
    expect(keys(selected)).toEqual(["demo/index.ts", "_shared/b.ts"]);
    expect(files.map((file) => file.content.toString("utf8"))).toEqual(snapshot);
    expect(before.toString("utf8")).toContain('../_shared/b');
    expect(sharedB.toString("utf8")).toBe("export const b = 1;\n");
  });
});
