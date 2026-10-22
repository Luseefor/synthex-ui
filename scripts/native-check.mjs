#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { generateNativeRefFixture } from "./native-ref-fixture.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("Usage: node scripts/native-check.mjs [--keep]\nBuild UI and CLI first. Packs both, installs an isolated Expo fixture, typechecks packaged and copied native sources, and exports iOS + Android. --keep preserves the app for device testing.");
  process.exit(0);
}
if (args.some(arg => arg !== "--keep")) throw new Error("Unknown argument. Use --help.");
const keep = args.includes("--keep");
if (!existsSync(path.join(root, "packages/ui/dist/index.native.js"))) throw new Error("Build synthex-ui before running native:check.");
if (!existsSync(path.join(root, "packages/cli/dist/index.js"))) throw new Error("Build the CLI before running native:check.");

function run(command, parameters, cwd, timeout = 600000) {
  const result = spawnSync(command, parameters, { cwd, encoding: "utf8", timeout,
    env: { ...process.env, CI: "1", EXPO_NO_TELEMETRY: "1" } });
  if (result.status !== 0) throw new Error(command + " " + parameters.join(" ") +
    " failed (exit " + result.status + ").\n" + String(result.error ?? "") +
    "\n" + String(result.stdout ?? "").slice(-6000) + "\n" + String(result.stderr ?? "").slice(-6000));
  return result.stdout;
}
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
const scratch = mkdtempSync(path.join(tmpdir(), "synthex-native-contracts-"));
const app = path.join(scratch, "app");
console.log("Native fixture scratch: " + scratch);
try {
  const actualScratch = realpathSync(scratch), actualRoot = realpathSync(root);
  if (actualScratch === actualRoot || actualScratch.startsWith(actualRoot + path.sep)) {
    throw new Error("Set TMPDIR to a directory outside the checkout for an isolated consumer.");
  }
  const pack = JSON.parse(run("npm", ["pack", "--json", "--pack-destination", scratch], path.join(root, "packages/ui")));
  const tarball = path.join(scratch, pack[0].filename);
  if (!existsSync(tarball)) throw new Error("Missing packed UI tarball.");
  cpSync(path.join(root, "templates/native"), app, { recursive: true,
    filter: source => !["node_modules", ".expo", ".git", "dist", "build", "package-lock.json", "bun.lock", "pnpm-lock.yaml", "yarn.lock"].includes(path.basename(source)) && !source.endsWith(".tsbuildinfo") });
  cpSync(path.join(root, "fixtures/native-contracts/App.tsx"), path.join(app, "App.tsx"));
  cpSync(path.join(root, "fixtures/native-contracts/OwnedOverlays.tsx"), path.join(app, "OwnedOverlays.tsx"));
  for (const fixture of ["RemainingOverlays.tsx", "OwnedRemainingOverlays.tsx"]) {
    cpSync(path.join(root, "fixtures/native-contracts", fixture), path.join(app, fixture));
  }
  // Compile copied implementation files against the consumer's RN version too:
  // declaration-only checks cannot catch removed APIs in implementation bodies.
  const cliPack = JSON.parse(run("npm", ["pack", "--json", "--pack-destination", scratch], path.join(root, "packages/cli")));
  const cliTarball = path.join(scratch, cliPack[0].filename);
  if (!existsSync(cliTarball)) throw new Error("Missing packed CLI tarball.");
  const cliExtract = path.join(scratch, "cli");
  mkdirSync(cliExtract);
  run("tar", ["-xzf", cliTarball, "-C", cliExtract], scratch);
  const cli = path.join(cliExtract, "package/dist/index.js");
  run("node", [cli, "setup", "--cwd", app, "--framework", "expo", "--package-manager", "npm"], app);
  run("node", [cli, "add", "select", "dropdown-menu", "popover", "combobox", "direction", "input-otp", "slider", "resizable", "carousel", "sheet", "drawer", "context-menu", "hover-card", "tooltip", "navigation-menu", "command", "--cwd", app], app);
  const refs = generateNativeRefFixture(root);
  writeFileSync(path.join(app, "native-ref-contracts.ts"), refs.source);
  const manifestPath = path.join(app, "package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.name = "synthex-native-contracts";
  manifest.dependencies["synthex-ui"] = "file:" + tarball;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  run("npm", ["install", "--no-audit", "--no-fund"], app);
  const lock = JSON.parse(readFileSync(path.join(app, "package-lock.json"), "utf8"));
  if (!lock.packages?.["node_modules/synthex-ui"]?.resolved?.startsWith("file:")) throw new Error("Fixture did not resolve the local UI tarball.");
  // Inspect the installed tree as well as the lock: neither workspace links nor registry fallback prove the packed artifact.
  const installedManifest = JSON.parse(readFileSync(path.join(app, "node_modules/synthex-ui/package.json"), "utf8"));
  if (installedManifest.version !== pack[0].version) throw new Error("Installed UI version differs from the tarball.");
  console.log("Packed UI installed: " + installedManifest.version + "; React Native " + JSON.parse(readFileSync(path.join(app, "node_modules/react-native/package.json"), "utf8")).version);
  run("npm", ["run", "typecheck"], app);
  console.log("Native contracts typecheck passed (" + refs.count + " forwarded ref declarations, copied overlays, OTP, Slider, Resizable, Carousel, Sheet, Drawer, remaining overlay and inline Command implementations).");
  for (const platform of ["ios", "android"]) {
    const output = path.join("dist", platform);
    run("node", ["node_modules/expo/bin/cli", "export", "--platform", platform, "--output-dir", output], app);
    const files = walk(path.join(app, output));
    if (!files.some(file => /\.(?:hbc|js)$/.test(file) && file.includes(path.join("_expo", "static", "js", platform)))) {
      throw new Error("Export has no " + platform + " JavaScript/Hermes artifact. Files: " + files.map(file => path.relative(path.join(app, output), file)).slice(0, 20).join(", "));
    }
    console.log("Native contracts Metro export passed: " + platform);
  }
  console.log("PASS: packed native subpaths typecheck and export for iOS + Android. No device or screen-reader validation was performed.");
} finally {
  if (keep) console.log("Preserved for device review: " + app + "\nRun npm start in that directory. Delete " + scratch + " when finished.");
  else rmSync(scratch, { recursive: true, force: true });
}
