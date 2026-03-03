#!/usr/bin/env bun

import { rmSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const packages = [
  {
    name: "@luseefor/synthex-core",
    dir: path.join(rootDir, "packages/core"),
    requiredFiles: ["dist/index.js", "dist/index.d.ts", "README.md", "LICENSE"],
  },
  {
    name: "synthex-ui",
    dir: path.join(rootDir, "packages/ui"),
    requiredFiles: ["dist/index.web.js", "dist/index.d.ts", "dist/styles.css", "README.md", "LICENSE"],
  },
  {
    name: "@luseefor/synthex-react-web",
    dir: path.join(rootDir, "packages/react-web"),
    requiredFiles: ["dist/index.js", "dist/index.d.ts", "README.md", "LICENSE"],
  },
  {
    name: "@luseefor/synthex-cli",
    dir: path.join(rootDir, "packages/cli"),
    requiredFiles: ["dist/index.js", "dist/index.d.ts"],
  },
];

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed in ${cwd}\n${result.stderr || result.stdout}`);
  }

  return result.stdout.trim();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const pkg of packages) {
  const output = run("npm", ["pack", "--json"], pkg.dir);
  const entries = JSON.parse(output);
  const packEntry = Array.isArray(entries) ? entries[0] : entries;

  assert(packEntry, `${pkg.name}: npm pack produced no metadata`);
  const files = new Set((packEntry.files ?? []).map((file) => file.path));

  for (const requiredFile of pkg.requiredFiles) {
    assert(files.has(requiredFile), `${pkg.name}: missing packed file ${requiredFile}`);
  }

  for (const file of files) {
    assert(!file.includes("/src/"), `${pkg.name}: packed leaked source file ${file}`);
    assert(!file.includes("__tests__"), `${pkg.name}: packed leaked test file ${file}`);
    assert(!file.includes("vitest"), `${pkg.name}: packed leaked vitest file ${file}`);
    assert(!file.includes(".test."), `${pkg.name}: packed leaked test artifact ${file}`);
  }

  const tarballPath = path.join(pkg.dir, packEntry.filename);
  rmSync(tarballPath, { force: true });
  console.log(`npm pack check passed for ${pkg.name}`);
}

console.log("All npm pack smoke checks passed.");
