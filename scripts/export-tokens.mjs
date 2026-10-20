#!/usr/bin/env node
// Export design tokens (colors/radius/space) from TS sources to tokens.json.
// Usage: node scripts/export-tokens.mjs [--out tokens/tokens.json]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const outFlag = args.indexOf("--out");
const out = path.resolve(process.cwd(), outFlag >= 0 ? args[outFlag + 1] : "tokens/tokens.json");
const figmaOut = path.join(path.dirname(out), "figma-variables.json");
const tokenDir = path.join(process.cwd(), "packages/ui/src/_shared/tokens");

function parseStrings(src) {
  const entries = {};
  for (const m of src.matchAll(/(\w+)\s*:\s*["']([^"']+)["']/g)) entries[m[1]] = m[2];
  return entries;
}
function parseNumbers(src) {
  const entries = {};
  for (const m of src.matchAll(/"?([\w]+)"?\s*:\s*(\d+)/g)) entries[m[1]] = Number(m[2]);
  return entries;
}

const colors = parseStrings(readFileSync(path.join(tokenDir, "colors.ts"), "utf8"));
const radius = parseNumbers(readFileSync(path.join(tokenDir, "radius.ts"), "utf8"));
const space = parseNumbers(readFileSync(path.join(tokenDir, "space.ts"), "utf8"));
const tokens = { colors, radius, space };
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(tokens, null, 2)}\n`);
console.log(`Wrote ${Object.keys(colors).length} colors, ${Object.keys(radius).length} radii, ${Object.keys(space).length} spaces to ${out}`);

// Figma Variables import mapping: flat { Collection, Mode, VariableName, Value } rows
// derived from tokens.json so designers can bulk-import into Figma Variables.
const figmaVariables = [
  ...Object.entries(colors).map(([name, value]) => ({
    Collection: "Synthex",
    Mode: "Light",
    VariableName: `colors/${name}`,
    Value: value,
  })),
  ...Object.entries(radius).map(([name, value]) => ({
    Collection: "Synthex",
    Mode: "Light",
    VariableName: `radius/${name}`,
    Value: value,
  })),
  ...Object.entries(space).map(([name, value]) => ({
    Collection: "Synthex",
    Mode: "Light",
    VariableName: `space/${name}`,
    Value: value,
  })),
];
writeFileSync(figmaOut, `${JSON.stringify(figmaVariables, null, 2)}\n`);
console.log(`Wrote ${figmaVariables.length} variables to ${figmaOut}`);
