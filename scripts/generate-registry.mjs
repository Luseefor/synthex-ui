#!/usr/bin/env node
// Generates registry.json at the repo root from packages/ui/src.
// Each entry: { name, dir, files, deps } + registryDependencies for internal links.
import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(here, "..");
const srcDir = path.join(rootDir, "packages/ui/src");
const outPath = path.join(rootDir, "registry.json");

function walkRelative(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkRelative(full, base, out);
    } else if (entry.isFile()) {
      out.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function toPackageName(spec) {
  if (spec.startsWith("@")) {
    const parts = spec.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : spec;
  }
  const first = spec.split("/")[0];
  return first ?? spec;
}

function isTestFile(rel) {
  return rel.includes("__tests__") || /\.test\.[^.]+$/.test(rel) || /\.spec\.[^.]+$/.test(rel);
}

const dirNames = readdirSync(srcDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort((a, b) => a.localeCompare(b));

// Directories that are infrastructure, not installable components.
// `_shared` holds tokens/theme/variants consumed via registryDependencies,
// `components` is the barrel re-export, and `dashboard` is a composite demo.
// They stay in registry.json (so dependency resolution works) with
// `internal: true`, and `synthex list` hides them by default.
const INTERNAL_COMPONENTS = new Set(["components", "dashboard"]);

function isInternalComponent(name) {
  return name.startsWith("_") || INTERNAL_COMPONENTS.has(name);
}

const dirSet = new Set(dirNames);
const importFromRe = /from\s+['"]([^'"]+)['"]/g;
const sideEffectRe = /import\s+['"]([^'"]+)['"]/g;
const dynamicRe = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

const components = dirNames.map((name) => {
  const abs = path.join(srcDir, name);
  const files = walkRelative(abs);
  const external = new Set();
  const internal = new Set();

  for (const rel of files) {
    if (!/\.(mjs|cjs|js|jsx|ts|tsx)$/.test(rel) || isTestFile(rel)) continue;
    let content = "";
    try {
      content = readFileSync(path.join(abs, ...rel.split("/")), "utf8");
    } catch {
      continue;
    }
    const specs = [];
    for (const re of [importFromRe, sideEffectRe, dynamicRe]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(content)) !== null) {
        if (m[1]) specs.push(m[1]);
      }
    }
    for (const spec of specs) {
      if (spec.startsWith(".")) {
        if (spec.startsWith("..")) {
          const parts = spec.split("/").filter((p) => p !== ".." && p !== "." && p !== "");
          const candidate = parts[0];
          if (candidate && dirSet.has(candidate) && candidate !== name) {
            internal.add(candidate);
          }
        }
        continue;
      }
      if (spec.startsWith("node:") || spec === "node:test") continue;
      external.add(toPackageName(spec));
    }
  }

  return {
    name,
    dir: `packages/ui/src/${name}`,
    internal: isInternalComponent(name),
    files,
    deps: [...external].sort((a, b) => a.localeCompare(b)),
    registryDependencies: [...internal].sort((a, b) => a.localeCompare(b)),
  };
});

let version = "1.1.0";
try {
  const pkg = JSON.parse(readFileSync(path.join(rootDir, "packages/ui/package.json"), "utf8"));
  if (typeof pkg.version === "string") version = pkg.version;
} catch {
  // keep default
}

const registry = {
  name: "synthex",
  version,
  description: "Synthex UI component registry (generated from packages/ui/src).",
  components,
};

writeFileSync(outPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Wrote ${outPath} with ${components.length} components.`);

// Serve the registry from the web-preview deploy so `/registry.json` works.
// public/ is copied verbatim to dist/ by Vite; keep it in sync on every run.
try {
  const publicDir = path.join(rootDir, "packages/web-preview/public");
  mkdirSync(publicDir, { recursive: true });
  copyFileSync(outPath, path.join(publicDir, "registry.json"));
  console.log("Synced packages/web-preview/public/registry.json.");
} catch (error) {
  console.error(`Warning: could not sync public/registry.json: ${error.message}`);
}
