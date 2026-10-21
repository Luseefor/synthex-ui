#!/usr/bin/env node
// Validates registry.json against packages/ui/src and the root package.json.
// - version matches root package.json
// - every component dir on disk is listed (and vice versa)
// - every listed file exists on disk
// - every component has a web implementation (*.web.*)
// - reports components without shared logic (*.shared.* or shared.ts) as
//   warnings — simple components (e.g. label, table) legitimately have none
// - every registryDependency points at a known component
// - `internal` flag matches the rule in scripts/generate-registry.mjs
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, "..");
const registryPath = path.join(rootDir, "registry.json");
const srcDir = path.join(rootDir, "packages/ui/src");

const INTERNAL_COMPONENTS = new Set(["components", "dashboard"]);

function isInternalComponent(name) {
  return name.startsWith("_") || INTERNAL_COMPONENTS.has(name);
}

function isSharedFile(rel) {
  const base = rel.split("/").pop() ?? rel;
  return base === "shared.ts" || rel.includes(".shared.");
}

function isWebFile(rel) {
  return rel.includes(".web.");
}

const errors = [];
const warnings = [];

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

if (!existsSync(registryPath)) {
  console.error(`registry.json not found at ${registryPath}. Run: node scripts/generate-registry.mjs`);
  process.exit(1);
}

const registry = readJson(registryPath);
const uiPkg = readJson(path.join(rootDir, "packages/ui/package.json"));

if (registry.version !== uiPkg.version) {
  errors.push(`version mismatch: registry.json is ${JSON.stringify(registry.version)} but packages/ui/package.json is ${JSON.stringify(uiPkg.version)}`);
}

if (!Array.isArray(registry.components) || registry.components.length === 0) {
  errors.push("registry has no components");
}

const dirNames = new Set(
  readdirSync(srcDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name),
);

const seen = new Set();
const registryNames = new Set();

for (const component of registry.components ?? []) {
  if (!component || typeof component.name !== "string") {
    errors.push("component entry without a name");
    continue;
  }
  registryNames.add(component.name);

  if (seen.has(component.name)) {
    errors.push(`${component.name}: duplicate entry`);
  }
  seen.add(component.name);

  if (typeof component.dir !== "string" || !Array.isArray(component.files)) {
    errors.push(`${component.name}: missing dir/files`);
    continue;
  }

  const absDir = path.join(rootDir, ...component.dir.split("/"));
  if (!existsSync(absDir)) {
    errors.push(`${component.name}: dir ${component.dir} does not exist`);
    continue;
  }

  for (const rel of component.files) {
    if (!existsSync(path.join(absDir, ...rel.split("/")))) {
      errors.push(`${component.name}: listed file ${rel} does not exist`);
    }
  }

  if (!component.files.some(isWebFile)) {
    errors.push(`${component.name}: has no *.web.* implementation`);
  }

  if (!component.files.some(isSharedFile)) {
    warnings.push(`${component.name}: has no *.shared.* or shared.ts file`);
  }

  const expectedInternal = isInternalComponent(component.name);
  if (component.internal !== expectedInternal) {
    errors.push(
      `${component.name}: internal flag is ${JSON.stringify(component.internal)}, expected ${expectedInternal}`,
    );
  }

  for (const dep of component.registryDependencies ?? []) {
    if (typeof dep !== "string" || dep.length === 0) {
      errors.push(`${component.name}: invalid registryDependency ${JSON.stringify(dep)}`);
    }
  }
}

for (const name of dirNames) {
  if (!registryNames.has(name)) {
    errors.push(`${name}: directory exists in packages/ui/src but is missing from registry.json (re-run generate-registry.mjs)`);
  }
}

for (const name of registryNames) {
  if (!dirNames.has(name)) {
    errors.push(`${name}: listed in registry.json but directory does not exist`);
  }
}

const known = new Set(registryNames);
for (const component of registry.components ?? []) {
  for (const dep of component?.registryDependencies ?? []) {
    if (!known.has(dep)) {
      errors.push(`${component.name}: unknown registryDependency "${dep}"`);
    }
  }
}

for (const warning of warnings) {
  console.warn(`warning: ${warning}`);
}

if (errors.length > 0) {
  console.error("Registry validation failed:\n");
  for (const failure of errors) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Registry OK: ${registryNames.size} components, version ${registry.version}.` +
    (warnings.length > 0 ? ` (${warnings.length} shared-file warning(s))` : ""),
);
