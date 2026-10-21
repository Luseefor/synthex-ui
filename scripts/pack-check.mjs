#!/usr/bin/env node

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
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
    requiredFiles: [
      "dist/index.js",
      "dist/index.d.ts",
      "dist/THIRD_PARTY_NOTICES.md",
      "dist/assets/registry.json",
      "dist/assets/ui/_shared/variants.ts",
      "dist/assets/ui/button/button.web.tsx",
      "dist/assets/templates/starter/package.json",
      "dist/assets/templates/next/package.json",
      "dist/assets/templates/native/package.json",
    ],
  },
];

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120000,
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed in ${cwd}\n${result.stderr || result.stdout}`);
  }

  return result.stdout.trim();
}

function runCapture(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 60000,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function collectExportTargets(pkgJson) {
  const out = [];
  function walk(node) {
    if (typeof node === "string") {
      if (node.startsWith("./")) out.push(node.slice(2));
      return;
    }
    if (Array.isArray(node)) {
      for (const v of node) walk(v);
      return;
    }
    if (node !== null && typeof node === "object") {
      for (const v of Object.values(node)) walk(v);
    }
  }
  function normalizeTopField(value) {
    if (typeof value !== "string") return null;
    if (value.startsWith("./")) return value.slice(2);
    if (value.startsWith("/") || value.startsWith(".") || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return null;
    return value;
  }
  function walkTop(node) {
    if (typeof node === "string") {
      const norm = normalizeTopField(node);
      if (norm !== null) out.push(norm);
      return;
    }
    if (Array.isArray(node)) {
      for (const v of node) walkTop(v);
      return;
    }
    if (node !== null && typeof node === "object") {
      for (const v of Object.values(node)) walkTop(v);
    }
  }
  if (pkgJson.exports) walk(pkgJson.exports);
  for (const key of ["main", "module", "types", "typings"]) {
    if (pkgJson[key] !== undefined) walkTop(pkgJson[key]);
  }
  if (pkgJson.bin) walkTop(pkgJson.bin);
  return [...new Set(out)];
}

function leakReason(file, pkgName) {
  const posix = file.split("\\").join("/");
  const segments = posix.split("/");
  const basename = segments[segments.length - 1];
  const isCli = pkgName === "@luseefor/synthex-cli";
  const isStarter = /^dist\/assets\/templates\/(starter|next|native)\//.test(posix);
  const isUiPayload = posix.startsWith("dist/assets/ui/");

  if (segments.includes("__tests__") || segments.includes("__snapshots__")) {
    return `leaked test directory ${file}`;
  }
  if (segments.includes("tests") || segments.includes("test") || segments.includes("spec") || segments.includes("specs")) {
    return `leaked test/spec directory ${file}`;
  }
  if (/\.test\./.test(basename) || /\.spec\./.test(basename)) {
    return `leaked test artifact ${file}`;
  }
  if (posix.includes("vitest")) {
    return `leaked vitest file ${file}`;
  }
  if (!isStarter) {
    const lower = basename.toLowerCase();
    const devPrefixes = [
      "vitest.config.",
      "vitest.setup.",
      "jest.config.",
      "jest.setup.",
      "playwright.config.",
      "cypress.config.",
      "eslint.config.",
      ".eslintrc",
      "babel.config.",
      ".babelrc",
    ];
    if (devPrefixes.some((p) => lower.startsWith(p))) {
      return `leaked dev config ${file}`;
    }
    if (basename === "tsconfig.json" || basename === "tsconfig.build.json") {
      return `leaked tsconfig ${file}`;
    }
  }
  if (isCli) {
    if (posix === "src" || posix.startsWith("src/")) {
      return `leaked source file ${file}`;
    }
    if (!isUiPayload && !isStarter) {
      if (posix.endsWith(".tsx") || posix.endsWith(".jsx")) {
        return `leaked source file ${file}`;
      }
      if (posix.endsWith(".ts") && !posix.endsWith(".d.ts")) {
        return `leaked source file ${file}`;
      }
    }
  } else {
    if (posix === "src" || posix.startsWith("src/") || posix.includes("/src/")) {
      return `leaked source file ${file}`;
    }
  }
  return null;
}

function extractJson(output) {
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");
  assert(start !== -1 && end !== -1 && end > start, `expected JSON object in output: ${output.slice(0, 300)}`);
  try {
    return JSON.parse(output.slice(start, end + 1));
  } catch (error) {
    throw new Error(`invalid JSON in CLI output: ${(error instanceof Error ? error.message : String(error))}`);
  }
}

function listFilesRecursive(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...listFilesRecursive(full));
    } else if (entry.isFile()) {
      found.push(full);
    }
  }
  return found;
}

function assertNoTestFiles(root) {
  if (!existsSync(root)) return;
  for (const full of listFilesRecursive(root)) {
    const rel = path.relative(root, full).split(path.sep).join("/");
    const base = path.basename(full);
    assert(!rel.split("/").includes("__tests__"), `test leak in output: ${rel}`);
    assert(!/\.test\./.test(base), `test leak in output: ${rel}`);
    assert(!/\.spec\./.test(base), `spec leak in output: ${rel}`);
  }
}

function checkPackedList(pkg, files) {
  for (const requiredFile of pkg.requiredFiles) {
    assert(files.has(requiredFile), `${pkg.name}: missing packed file ${requiredFile}`);
  }
  const pkgJson = JSON.parse(readFileSync(path.join(pkg.dir, "package.json"), "utf8"));
  for (const target of collectExportTargets(pkgJson)) {
    assert(files.has(target), `${pkg.name}: missing export target ${target}`);
  }
  for (const file of files) {
    const reason = leakReason(file, pkg.name);
    assert(reason === null, `${pkg.name}: ${reason}`);
  }
  if (pkg.name === "@luseefor/synthex-cli") {
    assert([...files].some((f) => f.startsWith("dist/assets/ui/")), `${pkg.name}: missing dist/assets/ui payload`);
    assert(
      [...files].some((f) => f.startsWith("dist/assets/templates/starter/")),
      `${pkg.name}: missing dist/assets/templates/starter payload`,
    );
  }
}

const packTemps = [];
function trackTemp(dir) {
  packTemps.push(dir);
  return dir;
}

try {
  for (const pkg of packages) {
    const packTmp = trackTemp(mkdtempSync(path.join(os.tmpdir(), "synthex-pack-")));
    try {
      const output = run("npm", ["pack", "--json", "--pack-destination", packTmp], pkg.dir);
      const entries = JSON.parse(output);
      const packEntry = Array.isArray(entries) ? entries[0] : entries;
      assert(packEntry, `${pkg.name}: npm pack produced no metadata`);
      const files = new Set((packEntry.files ?? []).map((file) => file.path));
      checkPackedList(pkg, files);
      console.log(`npm pack check passed for ${pkg.name}`);
    } finally {
      rmSync(packTmp, { recursive: true, force: true });
      packTemps.splice(packTemps.indexOf(packTmp), 1);
    }
  }

  const cliPkg = packages.find((p) => p.name === "@luseefor/synthex-cli");
  const cliPackTmp = trackTemp(mkdtempSync(path.join(os.tmpdir(), "synthex-cli-pack-")));
  const extractTmp = trackTemp(mkdtempSync(path.join(os.tmpdir(), "synthex-cli-extract-")));
  const scratchHelp = trackTemp(mkdtempSync(path.join(os.tmpdir(), "synthex-cli-help-")));
  const scratchAdd = trackTemp(mkdtempSync(path.join(os.tmpdir(), "synthex-cli-add-")));
  const scratchFail = trackTemp(mkdtempSync(path.join(os.tmpdir(), "synthex-cli-fail-")));
  const scratchCreate = trackTemp(mkdtempSync(path.join(os.tmpdir(), "synthex-cli-create-")));
  try {
    const output = run("npm", ["pack", "--json", "--pack-destination", cliPackTmp], cliPkg.dir);
    const entries = JSON.parse(output);
    const packEntry = Array.isArray(entries) ? entries[0] : entries;
    const tarball = path.join(cliPackTmp, packEntry.filename);
    assert(existsSync(tarball), `${cliPkg.name}: missing tarball ${tarball}`);
    run("tar", ["-xzf", tarball, "-C", extractTmp], rootDir);
    const extractedRoot = path.join(extractTmp, "package");
    assert(!extractedRoot.startsWith(rootDir), `${cliPkg.name}: extraction not isolated`);
    const cliEntry = path.join(extractedRoot, "dist/index.js");
    assert(existsSync(cliEntry), `${cliPkg.name}: missing extracted dist/index.js`);
    assert(existsSync(path.join(extractedRoot, "dist/assets/ui")), `${cliPkg.name}: missing bundled dist/assets/ui`);
    assert(existsSync(path.join(extractedRoot, "dist/assets/registry.json")), `${cliPkg.name}: missing bundled registry.json`);
    assert(
      existsSync(path.join(extractedRoot, "dist/assets/templates/starter")),
      `${cliPkg.name}: missing bundled starter template`,
    );

    let r = runCapture("node", [cliEntry, "--help"], scratchHelp);
    assert(r.status === 0, `${cliPkg.name}: --help failed: ${r.stderr || r.stdout}`);
    assert(/synthex|usage|add|list|create/i.test(`${r.stdout}${r.stderr}`), `${cliPkg.name}: --help output unexpected`);

    r = runCapture("node", [cliEntry, "list"], scratchHelp);
    assert(r.status === 0, `${cliPkg.name}: list failed: ${r.stderr || r.stdout}`);
    assert(r.stdout.includes("button"), `${cliPkg.name}: list missing button`);

    r = runCapture("node", [cliEntry, "add", "button", "--dry-run", "--cwd", scratchAdd], scratchAdd);
    assert(r.status === 0, `${cliPkg.name}: add button --dry-run failed: ${r.stderr || r.stdout}`);
    const manifest = extractJson(r.stdout);
    const manifestFiles = manifest.files ?? [];
    assert(Array.isArray(manifestFiles) && manifestFiles.length > 0, `${cliPkg.name}: dry-run manifest empty`);
    const dests = manifestFiles.map((f) => `${f.component ?? ""}/${f.relativePath ?? ""} ${f.destination ?? ""}`);
    assert(
      dests.some((d) => d.replace(/\\/g, "/").includes("_shared/variants.ts")),
      `${cliPkg.name}: dry-run missing _shared/variants.ts`,
    );
    assert(
      !dests.some((d) => /\.test\.|\.spec\.|__tests__/.test(d)),
      `${cliPkg.name}: dry-run leaked tests`,
    );
    assert(!existsSync(path.join(scratchAdd, "components")), `${cliPkg.name}: dry-run wrote files`);

    r = runCapture("node", [cliEntry, "add", "button", "--cwd", scratchAdd], scratchAdd);
    assert(r.status === 0, `${cliPkg.name}: add button failed: ${r.stderr || r.stdout}`);
    assert(
      existsSync(path.join(scratchAdd, "components/ui/_shared/variants.ts")),
      `${cliPkg.name}: add output missing _shared/variants.ts`,
    );
    assert(existsSync(path.join(scratchAdd, "components/ui/button")), `${cliPkg.name}: add output missing button`);
    assertNoTestFiles(path.join(scratchAdd, "components"));

    // Exercise safe updates through the packed CLI, changing only its extracted registry.
    const ownedButton = path.join(scratchAdd, "components/ui/button/button.web.tsx");
    const bundledButton = path.join(extractedRoot, "dist/assets/ui/button/button.web.tsx");
    const stateFile = path.join(scratchAdd, ".synthex/components.json");
    const originalButton = readFileSync(ownedButton, "utf8");
    const customizedButton = "// app customization\n" + originalButton;
    writeFileSync(ownedButton, customizedButton);
    writeFileSync(bundledButton, originalButton + "\n// registry revision\n");
    const bundledRegistryPath = path.join(extractedRoot, "dist/assets/registry.json");
    const bundledRegistry = JSON.parse(readFileSync(bundledRegistryPath, "utf8"));
    bundledRegistry.version = "9.9.9";
    writeFileSync(bundledRegistryPath, JSON.stringify(bundledRegistry));
    const oldState = readFileSync(stateFile);
    for (const args of [["diff", "button", "--json"], ["update", "button", "--dry-run", "--json"]]) {
      r = runCapture("node", [cliEntry, ...args, "--cwd", scratchAdd], scratchAdd);
      assert(r.status === 0, `packed preview failed: ${r.stderr || r.stdout}`);
      const preview = extractJson(r.stdout);
      assert(preview.files.some((f) => f.path.endsWith("button.web.tsx") && f.status === "merged"), "preview did not propose a clean merge");
      assert(readFileSync(ownedButton, "utf8") === customizedButton, "preview changed owned bytes");
      assert(readFileSync(stateFile).equals(oldState), "preview changed the recorded original");
    }
    r = runCapture("node", [cliEntry, "update", "button", "--json", "--cwd", scratchAdd], scratchAdd);
    assert(r.status === 0, `packed update failed: ${r.stderr || r.stdout}`);
    const updated = extractJson(r.stdout);
    const mergedButton = readFileSync(ownedButton, "utf8");
    assert(mergedButton.includes("// app customization") && mergedButton.includes("// registry revision"), "update lost local or incoming edits");
    assert(readFileSync(path.join(updated.backupDir, "files/components/ui/button/button.web.tsx"), "utf8") === customizedButton, "update backup lost original bytes");
    assert(readFileSync(path.join(updated.backupDir, "files/.synthex/components.json")).equals(oldState), "update did not back up prior state");
    const conflictingLocal = mergedButton.replace("// registry revision", "// local same-line edit");
    writeFileSync(ownedButton, conflictingLocal);
    writeFileSync(bundledButton, readFileSync(bundledButton, "utf8").replace("// registry revision", "// incoming same-line edit"));
    const mergedState = readFileSync(stateFile);
    r = runCapture("node", [cliEntry, "update", "button", "--write-conflicts", "--json", "--cwd", scratchAdd], scratchAdd);
    assert(r.status !== 0, "overlapping edits unexpectedly applied");
    const conflict = extractJson(r.stdout);
    assert(conflict.conflicts > 0 && conflict.conflictDir, "conflict files were not reported");
    assert(readFileSync(ownedButton, "utf8") === conflictingLocal && readFileSync(stateFile).equals(mergedState), "conflict changed owned bytes or baseline");
    assert(existsSync(path.join(conflict.conflictDir, "incoming/components/ui/button/button.web.tsx")), "missing incoming conflict version");
    r = runCapture("node", [cliEntry, "update", "button", "--resolved", "components/ui/button/button.web.tsx", "--json", "--cwd", scratchAdd], scratchAdd);
    assert(r.status === 0, `manual resolution failed: ${r.stderr || r.stdout}`);
    assert(readFileSync(ownedButton, "utf8") === conflictingLocal, "accepting a resolution changed its bytes");

    r = runCapture("node", [cliEntry, "add", "button", "__unknown_component_xyz__", "--cwd", scratchFail], scratchFail);
    assert(r.status !== 0, `${cliPkg.name}: late unknown add should fail`);
    assert(/Unknown component/i.test(`${r.stdout}${r.stderr}`), `${cliPkg.name}: unknown error unclear`);
    assert(!existsSync(path.join(scratchFail, "components")), `${cliPkg.name}: failed add wrote files`);

    r = runCapture("node", [cliEntry, "create", "my-starter", "--cwd", scratchCreate], scratchCreate);
    assert(r.status === 0, `${cliPkg.name}: create failed: ${r.stderr || r.stdout}`);
    const destPkgPath = path.join(scratchCreate, "my-starter/package.json");
    assert(existsSync(destPkgPath), `${cliPkg.name}: create missing package.json`);
    const destPkg = JSON.parse(readFileSync(destPkgPath, "utf8"));
    assert(destPkg.name === "my-starter", `${cliPkg.name}: create did not rewrite name`);
    assert(existsSync(path.join(scratchCreate, "my-starter/src/App.tsx")), `${cliPkg.name}: create missing App.tsx`);

    const uiVersion = JSON.parse(readFileSync(path.join(rootDir, "packages/ui/package.json"), "utf8")).version;
    for (const template of ["vite", "next", "expo"]) {
      const appName = `starter-${template}`;
      r = runCapture("node", [cliEntry, "create", appName, "--template", template, "--cwd", scratchCreate], scratchCreate);
      assert(r.status === 0, `${template}: packed create failed: ${r.stderr || r.stdout}`);
      const appDir = path.join(scratchCreate, appName);
      const appPkg = JSON.parse(readFileSync(path.join(appDir, "package.json"), "utf8"));
      assert(appPkg.dependencies["synthex-ui"] === `^${uiVersion}`, `${template}: stale UI version in bundled template`);
      r = runCapture("node", [cliEntry, "setup", "--cwd", appDir, "--dry-run", "--package-manager", "npm"], appDir);
      assert(r.status === 0, `${template}: packed setup failed: ${r.stderr || r.stdout}`);
      const setup = extractJson(r.stdout);
      assert(setup.framework === template, `${template}: setup detected wrong framework`);
      assert(!existsSync(path.join(appDir, "synthex-ui.json")), `${template}: setup dry-run wrote config`);
      r = runCapture("node", [cliEntry, "setup", "--cwd", appDir, "--package-manager", "npm"], appDir);
      assert(r.status === 0, `${template}: setup failed: ${r.stderr || r.stdout}`);
      r = runCapture("node", [cliEntry, "add", "button", "--cwd", appDir], appDir);
      assert(r.status === 0, `${template}: configured add failed: ${r.stderr || r.stdout}`);
      const config = JSON.parse(readFileSync(path.join(appDir, "synthex-ui.json"), "utf8"));
      assert(existsSync(path.join(appDir, config.componentsDir, template === "expo" ? "button/button.native.tsx" : "button/button.web.tsx")), `${template}: add ignored configured componentsDir`);
    }

    console.log(`npm pack check passed for ${cliPkg.name} CLI functional gate`);
  } finally {
    for (const dir of [scratchCreate, scratchFail, scratchAdd, scratchHelp, extractTmp, cliPackTmp]) {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  console.log("All npm pack smoke checks passed.");
} finally {
  for (const dir of [...packTemps]) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {}
  }
}
