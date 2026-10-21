#!/usr/bin/env node
import { cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cliDir = resolve(here, "..");
const workspaceRoot = resolve(cliDir, "../..");

const registrySrc = resolve(workspaceRoot, "registry.json");
const uiSrc = resolve(workspaceRoot, "packages/ui/src");
const starterSrc = resolve(workspaceRoot, "templates/starter");

const assetsDir = resolve(cliDir, "dist/assets");
const registryDest = resolve(assetsDir, "registry.json");
const uiDest = resolve(assetsDir, "ui");
const starterDest = resolve(assetsDir, "templates/starter");

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

async function main() {
  await assertSource(registrySrc, "registry");
  await assertSource(uiSrc, "ui");
  await assertSource(starterSrc, "starter");

  await mkdir(assetsDir, { recursive: true });

  await cp(registrySrc, registryDest, { recursive: false });
  JSON.parse(await readFile(registryDest, "utf8"));

  await cp(uiSrc, uiDest, {
    recursive: true,
    filter: (src) => !isExcludedUiPath(src),
  });

  await rewriteAssetRegistry();

  await cp(starterSrc, starterDest, { recursive: true });
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
