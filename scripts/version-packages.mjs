#!/usr/bin/env node
// Version step for the release workflow (changesets/action@v2 version-script).
// Runs `changeset version`, then regenerates registry.json from packages/ui/src
// so the Version Packages PR carries package bumps AND the derived registry
// files together. The private root stays at its own version; the registry
// version follows the root package.json by design (see generate-registry.mjs).
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("bunx", ["changeset", "version"]);
// Version/dependency bumps invalidate the lockfile; refresh it so the
// frozen install on the Version Packages PR/branch does not fail.
run("bun", ["install", "--lockfile-only"]);
run("node", ["./scripts/generate-registry.mjs"]);
