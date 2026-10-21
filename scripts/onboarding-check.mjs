#!/usr/bin/env node

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, "..");
const uiDir = path.join(rootDir, "packages/ui");
const cliDir = path.join(rootDir, "packages/cli");

const TEMPLATES = ["vite", "next", "expo"];
const INSTALL_TIMEOUT_MS = 600000;
const BUILD_TIMEOUT_MS = 600000;

function usage() {
  return "Usage: node scripts/onboarding-check.mjs [--template vite|next|expo|all]";
}

function parseTemplateArg(argv) {
  let value = "all";
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--template" && i + 1 < argv.length) {
      value = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--template=")) {
      value = arg.slice("--template=".length);
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`${usage()}\nUnknown argument: ${arg}`);
    }
  }
  if (!["all", ...TEMPLATES].includes(value)) {
    throw new Error(`${usage()}\nUnknown template "${value}". Expected one of: all, ${TEMPLATES.join(", ")}.`);
  }
  return value === "all" ? [...TEMPLATES] : [value];
}

function tail(text, max = 4000) {
  const s = String(text ?? "");
  return s.length > max ? `... (truncated)\n${s.slice(-max)}` : s;
}

function run(command, args, cwd, timeoutMs = 120000) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: timeoutMs,
  });
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed in ${cwd} (exit ${result.status ?? "signal"}).\n` +
        `--- stdout ---\n${tail(stdout)}\n--- stderr ---\n${tail(stderr)}`,
    );
  }
  return stdout;
}

function assertIsolated(target, root, label) {
  const resolved = path.resolve(target);
  if (resolved === path.resolve(root) || resolved.startsWith(path.resolve(root) + path.sep)) {
    throw new Error(`${label} is not isolated from the repo: ${resolved}`);
  }
}

function assertBuiltAssets() {
  const uiEntry = path.join(uiDir, "dist", "index.web.js");
  const cliEntry = path.join(cliDir, "dist", "index.js");
  if (!existsSync(uiEntry)) {
    throw new Error(`synthex-ui dist missing at ${uiEntry}. Build it first (synthex-ui build).`);
  }
  if (!existsSync(cliEntry)) {
    throw new Error(`CLI dist missing at ${cliEntry}. Build it first (@luseefor/synthex-cli build).`);
  }
}

function packToDir(packageDir, destDir) {
  const output = run("npm", ["pack", "--json", "--pack-destination", destDir], packageDir);
  let entries;
  try {
    entries = JSON.parse(output);
  } catch {
    throw new Error(`npm pack in ${packageDir} returned invalid JSON.\n${tail(output)}`);
  }
  const entry = Array.isArray(entries) ? entries[0] : entries;
  if (!entry?.filename) {
    throw new Error(`npm pack in ${packageDir} produced no tarball metadata.`);
  }
  const tarball = path.join(destDir, entry.filename);
  if (!existsSync(tarball)) {
    throw new Error(`npm pack tarball missing: ${tarball}`);
  }
  return tarball;
}

function rewriteScratchSynthexUi(appPackageJsonPath, uiTarballPath) {
  if (!existsSync(uiTarballPath)) {
    throw new Error(`Version guard: packed UI tarball missing: ${uiTarballPath}`);
  }
  const raw = readFileSync(appPackageJsonPath, "utf8");
  const manifest = JSON.parse(raw);
  const sections = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
  let rewritten = false;
  for (const section of sections) {
    if (manifest[section]?.["synthex-ui"] !== undefined) {
      const before = manifest[section]["synthex-ui"];
      manifest[section]["synthex-ui"] = `file:${uiTarballPath}`;
      console.log(`Rewrote scratch ${section}.synthex-ui: ${before} -> file:${uiTarballPath}`);
      rewritten = true;
    }
  }
  if (!rewritten) {
    throw new Error(`Scratch manifest has no synthex-ui dependency: ${appPackageJsonPath}`);
  }
  writeFileSync(appPackageJsonPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function assertPackedUiResolved(appDir) {
  const lockPath = path.join(appDir, "package-lock.json");
  if (!existsSync(lockPath)) {
    throw new Error(`Version guard: missing package-lock.json in ${appDir}; cannot verify packed UI resolution.`);
  }
  const lock = JSON.parse(readFileSync(lockPath, "utf8"));
  const entry = lock.packages?.["node_modules/synthex-ui"];
  const resolved = String(entry?.resolved ?? "");
  if (!resolved.startsWith("file:")) {
    throw new Error(
      `Version guard: synthex-ui must resolve to the packed local tarball (file:), got "${resolved}". Refusing npm registry version.`,
    );
  }
  console.log(`Version guard passed: synthex-ui resolved=${resolved} version=${entry?.version ?? "?"}`);
}

function wireOwnedButton(template, appDir) {
  const entry = path.join(appDir, template === "next" ? "app/page.tsx" : template === "vite" ? "src/App.tsx" : "App.tsx");
  let source = readFileSync(entry, "utf8");
  if (template === "expo") {
    source = source.replace(/^  Button,\n/m, "");
    source = 'import { Button } from "./components/ui/button";\n' + source;
  } else {
    const ownedImport = template === "next" ? "../components/ui/button" : "./components/ui/button";
    if (!source.includes('from "synthex-ui/button"')) throw new Error(`Missing Button import in ${entry}`);
    source = source.replace('from "synthex-ui/button"', `from "${ownedImport}"`);
  }
  writeFileSync(entry, source);
}

function buildConsumer(template, appDir, phase) {
  const scripts = template === "expo" ? ["typecheck", "export"] : ["build"];
  for (const script of scripts) {
    run("npm", ["run", script], appDir, BUILD_TIMEOUT_MS);
    console.log(`${phase}: npm run ${script} passed for ${template}`);
  }
}

function gateTemplate(template) {
  const appName = `synthex-onboarding-${template}`;
  const scratch = mkdtempSync(path.join(os.tmpdir(), `synthex-onboarding-${template}-`));
  assertIsolated(scratch, rootDir, "scratch dir");
  console.log(`\n=== onboarding gate: ${template} (scratch ${scratch}) ===`);
  try {
    const uiTarball = packToDir(uiDir, scratch);
    console.log(`Packed synthex-ui: ${path.basename(uiTarball)}`);
    const cliTarball = packToDir(cliDir, scratch);
    console.log(`Packed CLI: ${path.basename(cliTarball)}`);

    const extractDir = path.join(scratch, "cli-extract");
    mkdirSync(extractDir, { recursive: true });
    run("tar", ["-xzf", cliTarball, "-C", extractDir], scratch);
    const extractedRoot = path.join(extractDir, "package");
    assertIsolated(extractedRoot, rootDir, "extracted CLI");
    const cliEntry = path.join(extractedRoot, "dist", "index.js");
    if (!existsSync(cliEntry)) {
      throw new Error(`Extracted CLI missing dist/index.js: ${cliEntry}`);
    }

    run("node", [cliEntry, "create", appName, "--template", template, "--cwd", scratch], scratch);
    const appDir = path.join(scratch, appName);
    const appPackageJsonPath = path.join(appDir, "package.json");
    if (!existsSync(appPackageJsonPath)) {
      throw new Error(`Created app missing package.json: ${appPackageJsonPath}`);
    }
    rewriteScratchSynthexUi(appPackageJsonPath, uiTarball);

    run("npm", ["install", "--no-audit", "--no-fund"], appDir, INSTALL_TIMEOUT_MS);
    console.log(`npm install passed for ${template}`);
    assertPackedUiResolved(appDir);

    buildConsumer(template, appDir, "Packaged components");
    run("node", [cliEntry, "setup", "--cwd", appDir, "--package-manager", "npm"], appDir);
    run("node", [cliEntry, "add", "button", "--cwd", appDir], appDir);
    wireOwnedButton(template, appDir);
    buildConsumer(template, appDir, "Owned Button after setup + add");
    console.log(`Onboarding gate passed for ${template}`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

try {
  const selected = parseTemplateArg(process.argv.slice(2));
  assertBuiltAssets();
  for (const template of selected) {
    gateTemplate(template);
  }
  console.log(`\nAll onboarding gates passed (${selected.join(", ")}).`);
} catch (error) {
  console.error(`\nOnboarding gate failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
