import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { planComponents } from "../commands/add";
import { getDefaultRegistryJsonPath } from "./assets";

// An independent compiler parser checks every real component's dependency
// report, rather than testing the lightweight scanner against itself.
describe("real registry platform plans", () => {
  for (const framework of ["vite", "expo"] as const) {
    it(`${framework} dependency reports match TypeScript's parser`, async () => {
      const cwd = await mkdtemp(path.join(os.tmpdir(), "synthex-plans-"));
      try {
        await writeFile(path.join(cwd, "synthex-ui.json"), JSON.stringify({
          version: 1, framework, packageManager: "npm", componentsDir: "components/ui",
          css: framework === "expo" ? null : "synthex.css", provider: "components/synthex-provider.tsx",
        }));
        const registry = JSON.parse(await readFile(getDefaultRegistryJsonPath(), "utf8"));
        for (const entry of registry.components.filter((component: { internal: boolean }) => !component.internal)) {
          const plan = await planComponents([entry.name], { cwd });
          const expected = new Set<string>();
          for (const file of plan.files) {
            if (!/\.[cm]?[jt]sx?$/.test(file.relativePath)) continue;
            const source = ts.createSourceFile(file.relativePath, file.content.toString("utf8"), ts.ScriptTarget.Latest, true);
            function add(spec: string) {
              if (spec.startsWith(".") || spec.startsWith("/") || spec.startsWith("node:")) return;
              const root = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]!;
              if (!["react", "react-dom", "react-native"].includes(root)) expected.add(root);
            }
            function visit(node: ts.Node) {
              if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) add(node.moduleSpecifier.text);
              if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require")) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) add(node.arguments[0].text);
              ts.forEachChild(node, visit);
            }
            visit(source);
          }
          expect(plan.dependencies, `${framework}/${entry.name}`).toEqual([...expected].sort((a, b) => a.localeCompare(b)));
        }
      } finally { await rm(cwd, { recursive: true, force: true }); }
    }, 30000);
  }
});
