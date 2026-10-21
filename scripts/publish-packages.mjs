#!/usr/bin/env node
// Manual fallback publisher. NOT a replacement for the Changesets release
// workflow: it performs no versioning, no git writes, no GitHub API calls.
// It runs the same local artifact gates as release CI, short-circuits on the
// first failure, skips the npm auth probe on --dry-run, then publishes each
// package directory in order.

import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = process.cwd();

export const PACKAGES = [
  { name: "@luseefor/synthex-core", dir: path.join(rootDir, "packages/core") },
  { name: "synthex-ui", dir: path.join(rootDir, "packages/ui") },
  { name: "@luseefor/synthex-react-web", dir: path.join(rootDir, "packages/react-web") },
  { name: "@luseefor/synthex-cli", dir: path.join(rootDir, "packages/cli") },
];

// Registry first: the CLI build bundles the generated registry payload.
export const GATES = [
  { name: "registry:check", command: "npm", args: ["run", "registry:check"] },
  { name: "build", command: "bun", args: ["run", "build"] },
  { name: "release:check", command: "bun", args: ["run", "release:check"] },
  { name: "pack:check", command: "bun", args: ["run", "pack:check"] },
];

export function publishArgs(dryRun) {
  const args = ["publish", "--access", "public"];
  if (dryRun) {
    args.push("--dry-run");
  }
  return args;
}

// Injectable core: run(gate) -> exit code; publish(pkg, args) -> exit code;
// whoami() -> exit code. Returns exit code, never throws on gate failure.
export function planPublish({ dryRun, run, whoami, publish }) {
  for (const gate of GATES) {
    const code = run(gate);
    if (code !== 0) {
      return code;
    }
  }

  if (!dryRun) {
    const authCode = whoami();
    if (authCode !== 0) {
      return authCode;
    }
  }

  for (const pkg of PACKAGES) {
    const code = publish(pkg, publishArgs(dryRun));
    if (code !== 0) {
      return code;
    }
  }

  return 0;
}

function spawnRun(gate) {
  console.log(`gate: ${gate.command} ${gate.args.join(" ")} (${gate.name})`);
  const result = spawnSync(gate.command, gate.args, {
    cwd: rootDir,
    stdio: "inherit",
    encoding: "utf8",
  });
  return result.status ?? 1;
}

const entry = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (entry === fileURLToPath(import.meta.url)) {
  const dryRun = process.argv.includes("--dry-run");

  const code = planPublish({
    dryRun,
    run: spawnRun,
    whoami: () => {
      console.log("auth: npm whoami");
      const result = spawnSync("npm", ["whoami"], {
        cwd: rootDir,
        stdio: "inherit",
        encoding: "utf8",
      });
      return result.status ?? 1;
    },
    publish: (pkg, args) => {
      console.log(`Publishing ${pkg.name} from ${pkg.dir}`);
      const result = spawnSync("npm", args, {
        cwd: pkg.dir,
        stdio: "inherit",
        encoding: "utf8",
      });
      return result.status ?? 1;
    },
  });

  process.exit(code);
}
