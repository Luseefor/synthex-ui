#!/usr/bin/env node
// Checks the shadcn CLI interop surface without touching package.json scripts.
// Run directly: node scripts/shadcn-compat.mjs
// - components.json carries the shadcn schema keys ($schema, style,
//   tailwind css, aliases for components/utils) and resolves into this repo.
// - tailwind css target must exist; tailwind config is optional (CSS-first
//   tokens, so a missing config is a warning, not an error).
// - aliases.components / aliases.utils must point under packages/ui/src and
//   resolve to something on disk (dir, or file with implied extension).
// - every registry.json component must declare a non-empty files[] array and
//   a deps[] array (empty deps is allowed: e.g. theme, components), and every
//   listed file must exist on disk.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, "..");
const componentsPath = path.join(rootDir, "components.json");
const registryPath = path.join(rootDir, "registry.json");
const UI_SRC_PREFIX = "packages/ui/src";

const errors = [];
const warnings = [];

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`cannot read ${path.relative(rootDir, filePath)}: ${error.message}`);
    return null;
  }
}

function resolveTarget(target) {
  const abs = path.join(rootDir, ...target.split("/"));
  if (existsSync(abs)) return abs;
  for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
    if (existsSync(abs + ext)) return abs + ext;
  }
  return null;
}

if (!existsSync(componentsPath)) {
  errors.push("components.json not found at repo root");
}

if (!existsSync(registryPath)) {
  errors.push("registry.json not found at repo root");
}

const componentsJson = existsSync(componentsPath) ? readJson(componentsPath) : null;
const registry = existsSync(registryPath) ? readJson(registryPath) : null;

if (componentsJson) {
  if (typeof componentsJson.$schema !== "string" || !componentsJson.$schema.includes("shadcn")) {
    errors.push('components.json: missing or invalid "$schema" (expected shadcn schema URL)');
  }

  if (typeof componentsJson.style !== "string" || componentsJson.style.length === 0) {
    errors.push('components.json: missing "style"');
  }

  const tailwind = componentsJson.tailwind;
  if (!tailwind || typeof tailwind !== "object") {
    errors.push('components.json: missing "tailwind" section');
  } else {
    if (typeof tailwind.css !== "string" || tailwind.css.length === 0) {
      errors.push('components.json: missing "tailwind.css"');
    } else if (!resolveTarget(tailwind.css)) {
      errors.push(`components.json: tailwind css target does not exist: ${tailwind.css}`);
    }

    if (typeof tailwind.config === "string" && tailwind.config.length > 0 && !resolveTarget(tailwind.config)) {
      warnings.push(
        `components.json: tailwind config ${tailwind.config} not found; repo is CSS-first (see packages/ui/src/styles.css)`,
      );
    }
  }

  const aliases = componentsJson.aliases;
  if (!aliases || typeof aliases !== "object") {
    errors.push('components.json: missing "aliases" section');
  } else {
    for (const key of ["components", "utils"]) {
      const target = aliases[key];
      if (typeof target !== "string" || target.length === 0) {
        errors.push(`components.json: missing aliases["${key}"]`);
        continue;
      }
      if (target !== UI_SRC_PREFIX && !target.startsWith(`${UI_SRC_PREFIX}/`)) {
        errors.push(
          `components.json: aliases["${key}"] mismatch: ${JSON.stringify(target)} does not point at ${UI_SRC_PREFIX}`,
        );
        continue;
      }
      if (!resolveTarget(target)) {
        errors.push(`components.json: aliases["${key}"] target does not exist: ${target}`);
      }
    }
  }
}

if (registry) {
  if (!Array.isArray(registry.components) || registry.components.length === 0) {
    errors.push("registry.json: no components");
  } else {
    for (const component of registry.components) {
      const name = component?.name ?? "<unnamed>";
      if (typeof component?.dir !== "string") {
        errors.push(`${name}: missing dir`);
        continue;
      }
      if (!Array.isArray(component.files) || component.files.length === 0) {
        errors.push(`${name}: missing or empty files[]`);
      }
      if (!Array.isArray(component.deps)) {
        errors.push(`${name}: missing deps[]`);
      }
      if (Array.isArray(component.files)) {
        const absDir = path.join(rootDir, ...component.dir.split("/"));
        for (const rel of component.files) {
          if (!existsSync(path.join(absDir, ...String(rel).split("/")))) {
            errors.push(`${name}: listed file ${rel} does not exist`);
          }
        }
      }
    }
  }
}

for (const warning of warnings) {
  console.warn(`warning: ${warning}`);
}

if (errors.length > 0) {
  console.error("shadcn interop check failed:\n");
  for (const failure of errors) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const count = registry?.components?.length ?? 0;
const suffix = warnings.length > 0 ? ` (${warnings.length} warning(s))` : "";
console.log(`shadcn interop OK: ${count} registry components, components.json aliases resolve.${suffix}`);
