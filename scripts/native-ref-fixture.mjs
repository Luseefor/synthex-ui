import { createRequire } from "node:module";
import * as fs from "node:fs";
import * as path from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");

function walkNativeFiles(srcDir) {
  const out = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(full);
      } else if (entry.isFile() && entry.name.endsWith(".native.tsx")) {
        out.push(full);
      }
    }
  };
  visit(srcDir);
  out.sort();
  return out;
}

function toPosix(p) {
  return p.replace(/\\/g, "/");
}

function resolveRelativeModule(fromFile, spec, srcDir) {
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [`${base}.tsx`, `${base}.ts`, path.join(base, "index.tsx"), path.join(base, "index.ts")];
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile()) {
        return toPosix(path.relative(srcDir, candidate)).replace(/\.(tsx|ts)$/, "");
      }
    } catch {
      // miss
    }
  }
  throw new Error(
    `generateNativeRefFixture: cannot resolve relative import ${JSON.stringify(spec)} from ${toPosix(path.relative(srcDir, fromFile))}`,
  );
}

function collectImports(sourceFile) {
  // local name -> { original, spec }
  const map = new Map();
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text;
      const clause = node.importClause;
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          map.set(element.name.text, {
            original: (element.propertyName ?? element.name).text,
            spec,
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return map;
}

function collectLocalValues(sourceFile) {
  const names = new Set();
  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
      }
    } else if (
      (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) &&
      statement.name !== undefined
    ) {
      names.add(statement.name.text);
    }
  }
  return names;
}

function isExported(node) {
  return (node.modifiers ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

function checkForwardRefCall(initializer, imports, display) {
  const expression = initializer.expression;
  if (ts.isPropertyAccessExpression(expression)) {
    if (expression.name.text !== "forwardRef") return false;
    if (!ts.isIdentifier(expression.expression) || expression.expression.text !== "React") {
      throw new Error(
        `generateNativeRefFixture: ${display} uses unexpected forwardRef object ${JSON.stringify(expression.expression.getText())}`,
      );
    }
    return true;
  }
  if (ts.isIdentifier(expression) && expression.text === "forwardRef") {
    const binding = imports.get("forwardRef");
    if (binding?.spec !== "react") {
      throw new Error(`generateNativeRefFixture: ${display} uses bare forwardRef not imported from "react"`);
    }
    return true;
  }
  return false;
}

function readRefIdentifier(firstArg, display) {
  if (!ts.isTypeReferenceNode(firstArg)) {
    throw new Error(`generateNativeRefFixture: ${display} forwardRef ref type is not ElementRef<...>`);
  }
  const typeName = firstArg.typeName;
  const isElementRef =
    (ts.isIdentifier(typeName) && typeName.text === "ElementRef") ||
    (ts.isQualifiedName(typeName) &&
      ts.isIdentifier(typeName.left) &&
      typeName.left.text === "React" &&
      typeName.right.text === "ElementRef");
  if (!isElementRef) {
    throw new Error(`generateNativeRefFixture: ${display} forwardRef ref type is not ElementRef<...>`);
  }
  if (firstArg.typeArguments === undefined || firstArg.typeArguments.length !== 1) {
    throw new Error(`generateNativeRefFixture: ${display} ElementRef lacks exactly one type argument`);
  }
  const query = firstArg.typeArguments[0];
  if (!ts.isTypeQueryNode(query) || !ts.isIdentifier(query.exprName)) {
    throw new Error(`generateNativeRefFixture: ${display} ElementRef argument is not typeof <identifier>`);
  }
  return query.exprName.text;
}

/**
 * Scan packages/ui/src for exported React.forwardRef components and produce a
 * type-only consumer module asserting each component's ref type equals its
 * expected host ref type. The generated module is compile-only: it imports
 * the packed artifact relatively (./node_modules/synthex-ui/dist/...) and
 * performs no runtime imports. Nothing is written to disk; callers decide
 * where the returned source goes.
 */
export function generateNativeRefFixture(rootDir) {
  const srcDir = path.join(rootDir, "packages/ui/src");
  const files = walkNativeFiles(srcDir);
  const moduleAliases = new Map();
  const checks = [];

  const moduleAliasFor = (distRel) => {
    let alias = moduleAliases.get(distRel);
    if (alias === undefined) {
      alias = `M${moduleAliases.size}`;
      moduleAliases.set(distRel, alias);
    }
    return alias;
  };

  for (const file of files) {
    const srcRel = toPosix(path.relative(srcDir, file));
    const selfDistRel = srcRel.replace(/\.(tsx|ts)$/, "");
    const text = fs.readFileSync(file, "utf8");
    const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const imports = collectImports(sourceFile);
    const locals = collectLocalValues(sourceFile);

    for (const statement of sourceFile.statements) {
      if (!ts.isVariableStatement(statement) || !isExported(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || declaration.initializer === undefined) continue;
        if (!ts.isCallExpression(declaration.initializer)) continue;
        const initializer = declaration.initializer;
        const componentName = declaration.name.text;
        const display = `${srcRel}:${componentName}`;
        if (!checkForwardRefCall(initializer, imports, display)) continue;
        if (initializer.typeArguments === undefined || initializer.typeArguments.length !== 2) {
          throw new Error(`generateNativeRefFixture: ${display} forwardRef lacks two type arguments`);
        }
        const hostLocal = readRefIdentifier(initializer.typeArguments[0], display);

        let hostRef;
        let hostDesc;
        const binding = imports.get(hostLocal);
        if (binding !== undefined) {
          if (binding.spec === "react-native") {
            hostRef = `RN.${binding.original}`;
            hostDesc = `${binding.original} (react-native)`;
          } else if (binding.spec.startsWith(".")) {
            const hostDistRel = resolveRelativeModule(file, binding.spec, srcDir);
            const alias = moduleAliasFor(hostDistRel);
            hostRef = `${alias}.${binding.original}`;
            hostDesc = `${binding.original} (${hostDistRel})`;
          } else {
            throw new Error(
              `generateNativeRefFixture: ${display} ref host ${JSON.stringify(hostLocal)} imports from unresolvable ${JSON.stringify(binding.spec)}`,
            );
          }
        } else if (locals.has(hostLocal)) {
          const alias = moduleAliasFor(selfDistRel);
          hostRef = `${alias}.${hostLocal}`;
          hostDesc = `${hostLocal} (${selfDistRel}, local)`;
        } else {
          throw new Error(
            `generateNativeRefFixture: ${display} ref host ${JSON.stringify(hostLocal)} has no import or local declaration`,
          );
        }

        const componentAlias = moduleAliasFor(selfDistRel);
        checks.push(
          `// ${selfDistRel}: ${componentName} -> ${hostDesc}\n` +
            `type Check${checks.length} = Assert<Equal<React.ElementRef<typeof ${componentAlias}.${componentName}>, React.ElementRef<typeof ${hostRef}>>>;`,
        );
      }
    }
  }

  if (checks.length === 0) {
    throw new Error("generateNativeRefFixture: no exported forwardRef components found");
  }

  const lines = [
    "// Generated by scripts/native-ref-fixture.mjs — compile-only ref-type consumer.",
    "// Imports resolve against the packed artifact inside an installed Expo app.",
    'import type * as React from "react";',
    'import type * as RN from "react-native";',
  ];
  for (const [distRel, alias] of moduleAliases) {
    lines.push(`import type * as ${alias} from "./node_modules/synthex-ui/dist/${distRel}";`);
  }
  lines.push(
    "type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;",
    "type Assert<T extends true> = T;",
    ...checks,
    "",
  );
  return { source: lines.join("\n"), count: checks.length };
}
