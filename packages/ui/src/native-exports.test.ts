import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";

import { fileURLToPath } from "node:url";

const UI_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_ROOT = path.resolve(UI_ROOT, "src");

function readText(p: string): string {
  return fs.readFileSync(p, "utf8");
}

interface NativeSpecifier {
  readonly spec: string;
  readonly typeOnly: boolean;
}

// AST-based module reference extraction: static imports (incl. side-effect
// `import "x"`), `export ... from "x"`, dynamic `import("x")`, `require("x")`
// and `import x = require("x")` — all with literal specifiers only.
// Type-only is syntactic only (verbatimModuleSyntax): `import type`,
// `export type`, or every named specifier marked `type`. A value import
// referenced solely from type positions is still runtime and stays flagged.
function extractModuleSpecifiers(fileName: string, text: string): NativeSpecifier[] {
  const kind = fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, kind);
  const out: NativeSpecifier[] = [];
  const push = (spec: string | undefined, typeOnly: boolean): void => {
    if (typeof spec === "string" && spec.length > 0) out.push({ spec, typeOnly });
  };
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      if (node.moduleSpecifier !== undefined && ts.isStringLiteralLike(node.moduleSpecifier)) {
        const clause = node.importClause;
        let typeOnly = clause?.isTypeOnly ?? false;
        if (!typeOnly && clause !== undefined) {
          const bindings = clause.namedBindings;
          const allNamedType =
            bindings !== undefined &&
            ts.isNamedImports(bindings) &&
            bindings.elements.length > 0 &&
            bindings.elements.every((el) => el.isTypeOnly);
          if (clause.name === undefined && allNamedType) {
            typeOnly = true;
          }
        }
        push(node.moduleSpecifier.text, typeOnly);
      }
    } else if (ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier !== undefined && ts.isStringLiteralLike(node.moduleSpecifier)) {
        let typeOnly = node.isTypeOnly;
        if (
          !typeOnly &&
          node.exportClause !== undefined &&
          ts.isNamedExports(node.exportClause) &&
          node.exportClause.elements.length > 0
        ) {
          typeOnly = node.exportClause.elements.every((el) => el.isTypeOnly);
        }
        push(node.moduleSpecifier.text, typeOnly);
      }
    } else if (ts.isImportEqualsDeclaration(node)) {
      const ref = node.moduleReference;
      if (ts.isExternalModuleReference(ref) && ref.expression !== undefined && ts.isStringLiteralLike(ref.expression)) {
        push(ref.expression.text, false);
      }
    } else if (ts.isCallExpression(node) && node.arguments.length === 1) {
      const arg = node.arguments[0];
      if (arg !== undefined && ts.isStringLiteralLike(arg)) {
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          push(arg.text, false);
        } else if (ts.isIdentifier(node.expression) && node.expression.text === "require") {
          push(arg.text, false);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

// DOM-only packages that must never be imported at runtime from the native
// graph. Listed explicitly by package name from the current UI runtime deps —
// no brand-prefix grouping, so platform-agnostic packages stay allowed.
// Headless/type-only-safe externals (react, react-native, react-native-svg,
// lucide-react-native, react-hook-form, @tanstack/react-table, clsx,
// tailwind-merge, class-variance-authority) are intentionally absent.
const DOM_ONLY_EXACT = new Set([
  "@radix-ui/react-accordion",
  "@radix-ui/react-alert-dialog",
  "@radix-ui/react-aspect-ratio",
  "@radix-ui/react-avatar",
  "@radix-ui/react-checkbox",
  "@radix-ui/react-collapsible",
  "@radix-ui/react-context-menu",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-hover-card",
  "@radix-ui/react-label",
  "@radix-ui/react-menubar",
  "@radix-ui/react-navigation-menu",
  "@radix-ui/react-popover",
  "@radix-ui/react-progress",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-select",
  "@radix-ui/react-separator",
  "@radix-ui/react-slider",
  "@radix-ui/react-slot",
  "@radix-ui/react-switch",
  "@radix-ui/react-tabs",
  "@radix-ui/react-toast",
  "@radix-ui/react-toggle",
  "@radix-ui/react-toggle-group",
  "@radix-ui/react-tooltip",
  "cmdk",
  "embla-carousel-react",
  "input-otp",
  "react-day-picker",
  "react-dom",
  "react-native-web",
  "react-resizable-panels",
  "recharts",
  "sonner",
  "vaul",
]);

function isDomOnlyExternal(spec: string): boolean {
  const parts = spec.split("/");
  const name = spec.startsWith("@") ? parts.slice(0, 2).join("/") : (parts[0] ?? spec);
  return DOM_ONLY_EXACT.has(name);
}

function resolveLocal(fromFile: string, spec: string): string | null {
  const base = path.normalize(path.join(path.dirname(fromFile), spec));
  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
    path.join(base, "index.native.ts"),
    base,
  ];
  for (const c of candidates) {
    try {
      if (fs.statSync(c).isFile()) return c;
    } catch {
      // miss
    }
  }
  return null;
}

// Aggregate and per-component exports revisit the same shared source files.
// Cache only AST extraction; every graph still checks every edge independently.
const parsedModules = new Map<string, { text: string; references: NativeSpecifier[] }>();

function collectNativeGraph(entry: string): { visited: string[]; leaks: string[] } {
  const visited = new Set<string>();
  const leaks: string[] = [];
  const stack = [entry];
  while (stack.length > 0) {
    const file = stack.pop() as string;
    if (visited.has(file)) continue;
    visited.add(file);
    let text: string;
    try {
      text = readText(file);
    } catch {
      leaks.push(`unreadable:${file}`);
      continue;
    }
    // Filename itself must never be a web implementation in a native graph.
    if (path.basename(file).includes(".web.")) {
      leaks.push(`web-file-in-native-graph:${file}`);
    }
    let parsed = parsedModules.get(file);
    if (parsed?.text !== text) {
      parsed = { text, references: extractModuleSpecifiers(file, text) };
      parsedModules.set(file, parsed);
    }
    for (const { spec, typeOnly } of parsed.references) {
      if (spec.includes(".web")) {
        leaks.push(`${file} -> ${spec}`);
      }
      if (!spec.startsWith(".")) {
        // External package: only runtime imports can leak DOM-only code.
        if (!typeOnly && isDomOnlyExternal(spec)) {
          leaks.push(`${file} -> dom-only:${spec}`);
        }
        continue;
      }
      const resolved = resolveLocal(file, spec);
      if (resolved === null) {
        // Only flag unresolved local imports inside src (external packages excluded above).
        leaks.push(`${file} -> unresolved:${spec}`);
      } else {
        if (resolved.includes(".web.")) {
          leaks.push(`${file} -> ${spec} => ${resolved}`);
        }
        if (!visited.has(resolved)) stack.push(resolved);
      }
    }
  }
  return { visited: [...visited], leaks };
}

describe("native subpath exports", () => {
  it("maps per-component react-native conditions to built index.native.js", () => {
    const pkg = JSON.parse(readText(path.join(UI_ROOT, "package.json")));
    const skip = new Set([
      ".",
      "./components",
      "./primitives",
      "./layout",
      "./hooks",
      "./icons",
      "./theme",
      "./blocks",
      "./styles.css",
      "./tailwind.css",
      "./web",
      "./native",
      "./dashboard",
    ]);
    const perComponent = Object.keys(pkg.exports).filter(
      (k: string) => /^\.\/[^/]+$/.test(k) && !skip.has(k),
    );
    expect(perComponent.length).toBeGreaterThan(0);
    for (const key of perComponent) {
      const exp = pkg.exports[key];
      // react-native must be first with nested native types/default.
      expect(Object.keys(exp)[0]).toBe("react-native");
      expect(exp["react-native"]).toEqual({
        types: `./dist/${key.slice(2)}/index.native.d.ts`,
        default: `./dist/${key.slice(2)}/index.native.js`,
      });
      expect(exp["import"]).toBe(`./dist/${key.slice(2)}/index.js`);
      expect(exp["default"]).toBe(`./dist/${key.slice(2)}/index.js`);
      expect(exp["types"]).toBe(`./dist/${key.slice(2)}/index.d.ts`);
      expect(fs.existsSync(path.join(SRC_ROOT, key.slice(2), "index.native.ts"))).toBe(true);
    }
  });

  it("all react-native exports nest native types first", () => {
    const pkg = JSON.parse(readText(path.join(UI_ROOT, "package.json")));
    const withRn = Object.entries(pkg.exports).filter(
      ([, exp]: [string, unknown]) =>
        typeof exp === "object" && exp !== null && "react-native" in (exp as Record<string, unknown>),
    );
    expect(withRn.length).toBeGreaterThan(0);
    for (const [key, expRaw] of withRn) {
      const exp = expRaw as Record<string, unknown>;
      expect(Object.keys(exp)[0], key).toBe("react-native");
      const rn = exp["react-native"] as { types: string; default: string };
      expect(typeof rn).toBe("object");
      expect(rn.types.endsWith("/index.native.d.ts"), key).toBe(true);
      expect(rn.default.endsWith("/index.native.js"), key).toBe(true);
      // Native d.ts target must correspond to a src index.native.ts source.
      let srcEntry: string;
      if (key === ".") {
        srcEntry = path.join(SRC_ROOT, "index.native.ts");
      } else {
        const distDir = (rn.default as string).replace("./dist/", "").replace("/index.native.js", "");
        const tsEntry = path.join(SRC_ROOT, distDir, "index.native.ts");
        const tsxEntry = path.join(SRC_ROOT, distDir, "index.native.tsx");
        srcEntry = fs.existsSync(tsEntry) ? tsEntry : tsxEntry;
      }
      const exists = fs.existsSync(srcEntry);
      expect(exists, `${key} -> ${srcEntry}`).toBe(true);
    }
  });

  it("native graphs are transitively web-free and DOM-free", () => {
    // Entries derive from package.json exports but resolve to src only, so
    // this runs clean before dist exists.
    const pkg = JSON.parse(readText(path.join(UI_ROOT, "package.json")));
    const entries: string[] = [];
    for (const key of Object.keys(pkg.exports)) {
      const rn = pkg.exports[key]?.["react-native"] as string | { default: string } | undefined;
      const rnDefault = typeof rn === "string" ? rn : rn?.default;
      if (typeof rnDefault !== "string" || !rnDefault.endsWith("/index.native.js")) continue;
      const entry =
        key === "."
          ? path.join(SRC_ROOT, "index.native.ts")
          : path.join(SRC_ROOT, rnDefault.replace("./dist/", "").replace("/index.native.js", ""), "index.native.ts");
      if (fs.existsSync(entry)) entries.push(entry);
    }
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      const { leaks } = collectNativeGraph(entry);
      expect(leaks, entry).toEqual([]);
    }
  });
});

describe("native import scanner", () => {
  it("captures static, side-effect, and re-export specifiers", () => {
    const specs = extractModuleSpecifiers(
      "sample.ts",
      `import "side-effect-x";
import a from "default-x";
import { b } from "./local";
export * from "star-x";
export { c } from "./other";`,
    );
    expect(specs.map((s) => s.spec)).toEqual([
      "side-effect-x",
      "default-x",
      "./local",
      "star-x",
      "./other",
    ]);
  });

  it("captures dynamic import() and require() with literal specifiers", () => {
    const specs = extractModuleSpecifiers(
      "sample.ts",
      `const a = await import("dynamic-x");
const b = require("cjs-x");
const c = require(variable);
const d = import(variable);`,
    );
    expect(specs.map((s) => s.spec).sort()).toEqual(["cjs-x", "dynamic-x"]);
  });

  it("marks type-only specifiers so type imports can be ignored", () => {
    const specs = extractModuleSpecifiers(
      "sample.ts",
      `import type { T } from "type-x";
import { type A, value } from "mixed-x";
import type * as NS from "ns-x";
import { type B } from "all-type-x";`,
    );
    expect(specs.find((s) => s.spec === "type-x")?.typeOnly).toBe(true);
    expect(specs.find((s) => s.spec === "ns-x")?.typeOnly).toBe(true);
    expect(specs.find((s) => s.spec === "mixed-x")?.typeOnly).toBe(false);
    expect(specs.find((s) => s.spec === "all-type-x")?.typeOnly).toBe(true);
  });

  it("keeps value imports used in typeof positions runtime (verbatimModuleSyntax)", () => {
    const specs = extractModuleSpecifiers(
      "sample.ts",
      `import useHook from "hook-x";
export type T = ReturnType<typeof useHook>;`,
    );
    expect(specs[0]?.typeOnly).toBe(false);
    const typeImport = extractModuleSpecifiers(
      "sample.ts",
      `import type useHook from "hook-x";
export type T = ReturnType<typeof useHook>;`,
    );
    expect(typeImport[0]?.typeOnly).toBe(true);
  });

  it("flags DOM-only externals while allowing native-safe ones", () => {
    expect(isDomOnlyExternal("react-dom")).toBe(true);
    expect(isDomOnlyExternal("react-dom/server")).toBe(true);
    expect(isDomOnlyExternal("@radix-ui/react-slot")).toBe(true);
    expect(isDomOnlyExternal("cmdk")).toBe(true);
    expect(isDomOnlyExternal("recharts")).toBe(true);
    expect(isDomOnlyExternal("react")).toBe(false);
    expect(isDomOnlyExternal("react-native")).toBe(false);
    expect(isDomOnlyExternal("react-hook-form")).toBe(false);
    expect(isDomOnlyExternal("@tanstack/react-table")).toBe(false);
    expect(isDomOnlyExternal("@radix-ui/colors")).toBe(false);
  });
});
