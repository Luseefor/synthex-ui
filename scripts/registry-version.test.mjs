import { test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

test("registry versions follow the published UI package rather than the private workspace", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "synthex-registry-version-"));
  try {
    mkdirSync(path.join(root, "scripts"), { recursive: true });
    mkdirSync(path.join(root, "packages/ui/src/button"), { recursive: true });
    for (const script of ["generate-registry.mjs", "validate-registry.mjs"]) {
      copyFileSync(fileURLToPath(new URL(script, import.meta.url)), path.join(root, "scripts", script));
    }
    writeFileSync(path.join(root, "package.json"), JSON.stringify({ private: true, version: "1.1.0" }));
    writeFileSync(path.join(root, "packages/ui/package.json"), JSON.stringify({ version: "2.3.4" }));
    writeFileSync(path.join(root, "packages/ui/src/button/button.web.tsx"), "export const Button = 1;\n");
    writeFileSync(path.join(root, "packages/ui/src/button/button.shared.ts"), "export const shared = 1;\n");
    const run = (script) => spawnSync(process.execPath, [path.join(root, "scripts", script)], { cwd: root, encoding: "utf8" });
    const generated = run("generate-registry.mjs");
    assert.equal(generated.status, 0, generated.stderr);
    const registryPath = path.join(root, "registry.json");
    const registry = JSON.parse(readFileSync(registryPath, "utf8"));
    assert.equal(registry.version, "2.3.4");
    assert.equal(JSON.parse(readFileSync(path.join(root, "packages/web-preview/public/registry.json"), "utf8")).version, "2.3.4");
    const validated = run("validate-registry.mjs");
    assert.equal(validated.status, 0, validated.stderr);
    writeFileSync(registryPath, JSON.stringify({ ...registry, version: "1.1.0" }));
    const stale = run("validate-registry.mjs");
    assert.notEqual(stale.status, 0);
    assert.match(stale.stderr, /version mismatch.*packages\/ui\/package.json/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
