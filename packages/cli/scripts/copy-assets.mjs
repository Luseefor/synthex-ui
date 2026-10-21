#!/usr/bin/env node
import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const cliDir = resolve(here, "..");
const workspaceRoot = resolve(cliDir, "../..");

const registrySrc = resolve(workspaceRoot, "registry.json");
const uiSrc = resolve(workspaceRoot, "packages/ui/src");

const templateSources = [
  { label: "starter", dir: "starter", src: resolve(workspaceRoot, "templates/starter") },
  { label: "next", dir: "next", src: resolve(workspaceRoot, "templates/next") },
  { label: "native", dir: "native", src: resolve(workspaceRoot, "templates/native") },
];

const assetsDir = resolve(cliDir, "dist/assets");
const registryDest = resolve(assetsDir, "registry.json");
const uiDest = resolve(assetsDir, "ui");
const uiManifestSrc = resolve(workspaceRoot, "packages/ui/package.json");
const require = createRequire(import.meta.url);

async function writeDiffLicenseNotices() {
  const notices = [];
  for (const [name, filename] of [["diff", "LICENSE"], ["node-diff3", "LICENSE.md"]]) {
    let dir = dirname(require.resolve(name));
    for (;;) {
      const manifest = await readFile(join(dir, "package.json"), "utf8").then(JSON.parse).catch(() => null);
      if (manifest?.name === name) {
        notices.push(`# ${name} ${manifest.version}\n\n${await readFile(join(dir, filename), "utf8")}`);
        break;
      }
      const parent = dirname(dir);
      if (parent === dir) throw new Error(`Cannot locate the ${name} license for the CLI bundle.`);
      dir = parent;
    }
  }
  await writeFile(resolve(cliDir, "dist/THIRD_PARTY_NOTICES.md"), notices.join("\n\n---\n\n"));
}

const EXCLUDED_TEMPLATE_SEGMENTS = new Set([
  "node_modules",
  ".next",
  ".expo",
  ".git",
  ".turbo",
  "dist",
  "build",
  "out",
  "coverage",
]);
const EXCLUDED_TEMPLATE_FILES = new Set(["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"]);
const EXCLUDED_TEMPLATE_SUFFIXES = [".tsbuildinfo"];

export function isExcludedTemplatePath(source, root) {
  const relative = source.startsWith(root) ? source.slice(root.length) : source;
  const segments = relative.split(sep).filter((part) => part.length > 0);
  for (const segment of segments) {
    if (EXCLUDED_TEMPLATE_SEGMENTS.has(segment) || EXCLUDED_TEMPLATE_FILES.has(segment)) {
      return true;
    }
    for (const suffix of EXCLUDED_TEMPLATE_SUFFIXES) {
      if (segment.endsWith(suffix)) {
        return true;
      }
    }
  }
  return false;
}

function isExcludedUiPath(source) {
  const relative = source.startsWith(uiSrc) ? source.slice(uiSrc.length) : source;
  const segments = relative.split(sep).filter((part) => part.length > 0);
  for (const segment of segments) {
    if (segment === "__tests__" || segment === "spec" || segment === "tests" || segment === "__snapshots__") {
      return true;
    }
    if (segment.includes(".test.") || segment.includes(".spec.")) {
      return true;
    }
    if (segment === "axe-matchers.d.ts") {
      return true;
    }
  }
  return false;
}

async function assertSource(path, label) {
  try {
    const stats = await stat(path);
    if (label === "registry" && !stats.isFile()) {
      throw new Error(`Starter source missing: ${path}`);
    }
    if (label !== "registry" && !stats.isDirectory()) {
      throw new Error(`Source missing: ${path}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Source missing") && label !== "registry") {
      throw error;
    }
    throw new Error(`Required source not found for CLI assets (${label}): ${path}`);
  }
}

async function collectRelativeFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of sorted) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRelativeFiles(full, base)));
    } else if (entry.isFile()) {
      files.push(full.slice(base.length + 1).split(sep).join("/"));
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

async function rewriteAssetRegistry() {
  const raw = await readFile(registryDest, "utf8");
  const data = JSON.parse(raw);
  if (!data || typeof data !== "object" || !Array.isArray(data.components)) {
    throw new Error("Asset registry is invalid: expected { components: [...] }.");
  }
  for (const component of data.components) {
    if (!component || typeof component.name !== "string" || component.name.length === 0) {
      throw new Error("Asset registry has a component without a valid name.");
    }
    const componentDir = join(uiDest, component.name);
    const stats = await stat(componentDir).catch(() => null);
    if (!stats || !stats.isDirectory()) {
      throw new Error(`Asset registry component "${component.name}" missing dir: ${componentDir}.`);
    }
    component.dir = `ui/${component.name}`;
    component.files = await collectRelativeFiles(componentDir);
    if (component.files.length === 0) {
      throw new Error(`Asset registry component "${component.name}" has no files.`);
    }
    for (const file of component.files) {
      if (isExcludedUiPath(join(uiSrc, component.name, ...file.split("/")))) {
        throw new Error(`Asset registry component "${component.name}" lists excluded file "${file}".`);
      }
    }
  }
  await writeFile(registryDest, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readUiManifestVersion(manifestPath = uiManifestSrc) {
  let raw;
  try {
    raw = await readFile(manifestPath, "utf8");
  } catch {
    throw new Error(`Required UI manifest not found for CLI assets (ui-manifest): ${manifestPath}`);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`UI manifest is invalid JSON: ${manifestPath}.`);
  }
  const version = data && typeof data === "object" ? data.version : undefined;
  if (typeof version !== "string" || version.length === 0) {
    throw new Error(`UI manifest is missing a version: ${manifestPath}.`);
  }
  return version;
}

export async function pinBundledTemplateUiVersion(templateDest, uiVersion) {
  const packagePath = join(templateDest, "package.json");
  let raw;
  try {
    raw = await readFile(packagePath, "utf8");
  } catch {
    throw new Error(`Bundled template is missing package.json (expected at "${packagePath}").`);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Bundled template package.json is invalid JSON (at "${packagePath}").`);
  }
  const scopes = [data?.dependencies, data?.devDependencies].filter(
    (scope) => scope && typeof scope === "object",
  );
  const hasUiDep = scopes.some((scope) => typeof scope["synthex-ui"] === "string");
  if (!hasUiDep) {
    throw new Error(`Bundled template package.json is missing the synthex-ui dependency (at "${packagePath}").`);
  }
  for (const scope of scopes) {
    if (typeof scope["synthex-ui"] === "string") {
      scope["synthex-ui"] = `^${uiVersion}`;
    }
  }
  await writeFile(packagePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  await assertSource(registrySrc, "registry");
  await assertSource(uiSrc, "ui");
  for (const template of templateSources) {
    await assertSource(template.src, template.label);
  }
  const uiVersion = await readUiManifestVersion();

  await mkdir(assetsDir, { recursive: true });
  await writeDiffLicenseNotices();

  await cp(registrySrc, registryDest, { recursive: false });
  JSON.parse(await readFile(registryDest, "utf8"));

  await cp(uiSrc, uiDest, {
    recursive: true,
    filter: (src) => !isExcludedUiPath(src),
  });

  await rewriteAssetRegistry();

  for (const template of templateSources) {
    const dest = resolve(assetsDir, "templates", template.dir);
    await cp(template.src, dest, {
      recursive: true,
      filter: (src) => !isExcludedTemplatePath(src, template.src),
    });
    await pinBundledTemplateUiVersion(dest, uiVersion);
  }
}

const entry = process.argv[1] ? resolve(process.argv[1]) : "";
if (entry === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
