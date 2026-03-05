#!/usr/bin/env node

import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const packages = [
  { name: "@luseefor/synthex-core", dir: path.join(rootDir, "packages/core") },
  { name: "synthex-ui", dir: path.join(rootDir, "packages/ui") },
  { name: "@luseefor/synthex-react-web", dir: path.join(rootDir, "packages/react-web") },
  { name: "@luseefor/synthex-cli", dir: path.join(rootDir, "packages/cli") },
];

const dryRun = process.argv.includes("--dry-run");

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    encoding: "utf8",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npm", ["whoami"], rootDir);

for (const pkg of packages) {
  const args = ["publish", "--access", "public"];

  if (dryRun) {
    args.push("--dry-run");
  }

  console.log(`Publishing ${pkg.name} from ${pkg.dir}`);
  run("npm", args, pkg.dir);
}
