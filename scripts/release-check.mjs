#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const publicPackages = [
  {
    name: "@luseefor/synthex-core",
    dir: path.join(rootDir, "packages/core"),
    forbidNative: false,
  },
  {
    name: "synthex-ui",
    dir: path.join(rootDir, "packages/ui"),
    forbidNative: false,
  },
  {
    name: "@luseefor/synthex-react-web",
    dir: path.join(rootDir, "packages/react-web"),
    forbidNative: true,
  },
];

const internalPackages = [
  {
    name: "@luseefor/synthex-cli",
    dir: path.join(rootDir, "packages/cli"),
    forbidNative: false,
  },
];

const failures = [];

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function checkTargetExists(packageName, packageDir, target, label) {
  const resolvedPath = path.join(packageDir, target);
  assert(
    existsSync(resolvedPath),
    `${packageName}: missing ${label} target ${target}`,
  );
}

function walkFiles(dir, files = []) {
  if (!existsSync(dir)) {
    return files;
  }

  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      walkFiles(fullPath, files);
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function checkExportMap(packageName, packageDir, exportsMap) {
  for (const [exportKey, exportValue] of Object.entries(exportsMap ?? {})) {
    if (typeof exportValue === "string") {
      checkTargetExists(packageName, packageDir, exportValue, `export ${exportKey}`);
      continue;
    }

    if (typeof exportValue !== "object" || exportValue === null) {
      failures.push(`${packageName}: unsupported export format for ${exportKey}`);
      continue;
    }

    for (const [condition, target] of Object.entries(exportValue)) {
      if (typeof target !== "string") {
        failures.push(
          `${packageName}: unsupported export target for ${exportKey} (${condition})`,
        );
        continue;
      }

      checkTargetExists(
        packageName,
        packageDir,
        target,
        `export ${exportKey} (${condition})`,
      );
    }
  }
}

function checkPackage(pkg, { publicPackage }) {
  const packageJsonPath = path.join(pkg.dir, "package.json");
  const packageJson = readJson(packageJsonPath);

  if (publicPackage) {
    assert(
      Array.isArray(packageJson.files) && !packageJson.files.includes("src"),
      `${pkg.name}: package files must not publish src`,
    );
  }

  if (typeof packageJson.main === "string") {
    checkTargetExists(pkg.name, pkg.dir, packageJson.main, "main");
  }

  if (typeof packageJson.module === "string") {
    checkTargetExists(pkg.name, pkg.dir, packageJson.module, "module");
  }

  if (typeof packageJson.types === "string") {
    checkTargetExists(pkg.name, pkg.dir, packageJson.types, "types");
  }

  if (typeof packageJson.bin === "string") {
    checkTargetExists(pkg.name, pkg.dir, packageJson.bin, "bin");
  } else if (packageJson.bin && typeof packageJson.bin === "object") {
    for (const [binName, binTarget] of Object.entries(packageJson.bin)) {
      if (typeof binTarget === "string") {
        checkTargetExists(pkg.name, pkg.dir, binTarget, `bin ${binName}`);
      }
    }
  }

  checkExportMap(pkg.name, pkg.dir, packageJson.exports);

  const distDir = path.join(pkg.dir, "dist");
  assert(existsSync(distDir), `${pkg.name}: dist directory is missing`);

  for (const filePath of walkFiles(distDir)) {
    const relativePath = path.relative(pkg.dir, filePath).replaceAll(path.sep, "/");
    const lowerRelativePath = relativePath.toLowerCase();

    assert(!relativePath.includes("/src/"), `${pkg.name}: leaked source artifact ${relativePath}`);
    assert(!lowerRelativePath.includes("vitest"), `${pkg.name}: leaked vitest artifact ${relativePath}`);
    assert(!relativePath.includes("__tests__"), `${pkg.name}: leaked test artifact ${relativePath}`);
    assert(!lowerRelativePath.includes(".test."), `${pkg.name}: leaked test file ${relativePath}`);

    if (pkg.forbidNative) {
      assert(
        !lowerRelativePath.includes("index.native."),
        `${pkg.name}: leaked native artifact ${relativePath}`,
      );
    }
  }
}

for (const pkg of publicPackages) {
  checkPackage(pkg, { publicPackage: true });
}

for (const pkg of internalPackages) {
  checkPackage(pkg, { publicPackage: false });
}

if (failures.length > 0) {
  console.error("Release artifact verification failed:\n");

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log("Release artifact verification passed.");
