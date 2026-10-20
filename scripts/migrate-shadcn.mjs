#!/usr/bin/env node
// shadcn -> synthex codemod: @/components/ui/* to synthex-ui/components.
// Button variant/size props are compatible, passed through unchanged.
// Usage: node scripts/migrate-shadcn.mjs [--dry-run] <dir>
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const target = args.find((a) => !a.startsWith("-")) ?? ".";
const root = path.resolve(process.cwd(), target);
const IMPORT_RE = /from\s*(["'])((?:@\/)?components\/ui\/[\w-]+|(?:\.{1,2}\/)+ui\/[\w-]+)\1/g;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === "dist" || e === ".git") continue;
    const p = path.join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx)$/.test(e)) out.push(p);
  }
  return out;
}

function transform(src) {
  return src.replace(IMPORT_RE, `from "synthex-ui/components"`);
}

let changed = 0;
for (const file of walk(root)) {
  const src = readFileSync(file, "utf8");
  if (!IMPORT_RE.test(src)) continue;
  IMPORT_RE.lastIndex = 0;
  const next = transform(src);
  if (next === src) continue;
  changed += 1;
  if (dryRun) console.log(`would migrate: ${path.relative(root, file)}`);
  else {
    writeFileSync(file, next);
    console.log(`migrated: ${path.relative(root, file)}`);
  }
}
console.log(dryRun ? `${changed} file(s) would change.` : `${changed} file(s) migrated.`);
