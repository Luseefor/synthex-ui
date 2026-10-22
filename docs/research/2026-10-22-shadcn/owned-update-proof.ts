/** Behavioral demonstration, not a timing benchmark or a shadcn execution test. */
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { addComponents } from "../../../packages/cli/src/commands/add";
import { diffComponents, updateComponents } from "../../../packages/cli/src/utils/componentUpdates";
import { mergeComponentFile } from "../../../packages/cli/src/utils/componentMerge";
import { applyComponentTransaction } from "../../../packages/cli/src/utils/componentTransaction";

const scratch = await mkdtemp(path.join(tmpdir(), "synthex-owned-proof-"));
const project = path.join(scratch, "app"), registry = path.join(scratch, "registry");
const relative = "components/ui/button/recipe.ts";
const target = path.join(project, relative);
const base = 'export const tone = "default";\n\nexport const gap = 8;\n\nexport const label = "Save";\n';
const local = base.replace('"default"', '"brand"');
const upstream = base.replace('"Save"', '"Save changes"');
const merged = upstream.replace('"default"', '"brand"');
const checks: Array<{ name: string; passed: boolean }> = [];
function pass(name: string) { checks.push({ name, passed: true }); }
const digest = (value: Buffer) => createHash("sha256").update(value).digest("hex");
async function treeSnapshot(directory: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else result[path.relative(directory, full)] = digest(await readFile(full));
    }
  }
  await walk(directory);
  return result;
}

try {
  await mkdir(project, { recursive: true });
  for (const name of ["button", "card"]) await mkdir(path.join(registry, name), { recursive: true });
  await writeFile(path.join(registry, "registry.json"), JSON.stringify({ version: "proof-1", components: [
    { name: "button", deps: [], registryDependencies: [] },
    { name: "card", deps: [], registryDependencies: [] },
  ] }));
  await writeFile(path.join(registry, "button/recipe.ts"), base);
  await writeFile(path.join(registry, "card/recipe.ts"), 'export const version = 1;\n');
  await addComponents(["button", "card"], { cwd: project, registryRoot: registry });
  const statePath = path.join(project, ".synthex/components.json");
  let state = JSON.parse(await readFile(statePath, "utf8"));
  assert.equal(Buffer.from(state.files[relative].base, "base64").toString(), base);
  assert.equal(state.files[relative].sha256, digest(Buffer.from(base)));
  pass("install records exact original bytes and hash");

  // Identical observed local/upstream files need different answers under different histories.
  const observedLocal = Buffer.from("local\n"), observedUpstream = Buffer.from("upstream\n");
  assert.equal(mergeComponentFile(observedLocal, observedLocal, observedUpstream).status, "updated");
  assert.equal(mergeComponentFile(observedUpstream, observedLocal, observedUpstream).status, "local-only");
  pass("recorded history distinguishes upstream change from local customization");

  await writeFile(target, local);
  await writeFile(path.join(registry, "button/recipe.ts"), upstream);
  const beforePreview = await treeSnapshot(project);
  const preview = await diffComponents(["button"], { cwd: project, registryRoot: registry });
  assert.equal(preview.files.find(file => file.path === relative)?.status, "merged");
  assert.deepEqual(await treeSnapshot(project), beforePreview);
  pass("diff previews a disjoint merge without changing any project file");

  const applied = await updateComponents(["button"], { cwd: project, registryRoot: registry });
  assert.equal(applied.conflicts, 0);
  assert.equal(await readFile(target, "utf8"), merged);
  assert.ok(applied.backupDir);
  assert.equal(await readFile(path.join(applied.backupDir, "files", relative), "utf8"), local);
  state = JSON.parse(await readFile(statePath, "utf8"));
  assert.equal(Buffer.from(state.files[relative].base, "base64").toString(), upstream);
  pass("update keeps customization, applies upstream change, backs up local, advances upstream baseline");

  const afterApply = await treeSnapshot(project);
  const repeated = await updateComponents(["button"], { cwd: project, registryRoot: registry });
  assert.equal(repeated.backupDir, null);
  assert.deepEqual(await treeSnapshot(project), afterApply);
  pass("repeated update preserves bytes and creates no new backup");

  await writeFile(path.join(registry, "button/recipe.ts"), upstream.replace('"default"', '"danger"'));
  await writeFile(path.join(registry, "card/recipe.ts"), 'export const version = 2;\n');
  const beforeConflict = await treeSnapshot(project);
  for (const dryRun of [true, false]) {
    const blocked = await updateComponents(["button", "card"], { cwd: project, registryRoot: registry, dryRun });
    assert.equal(blocked.conflicts, 1);
    assert.deepEqual(await treeSnapshot(project), beforeConflict);
  }
  pass("overlapping edit blocks the entire two-component batch, in real and dry runs");

  const resolved = await updateComponents(["button", "card"], { cwd: project, registryRoot: registry, resolved: [relative] });
  assert.equal(resolved.conflicts, 0);
  assert.equal(await readFile(target, "utf8"), merged);
  assert.equal(await readFile(path.join(project, "components/ui/card/recipe.ts"), "utf8"), 'export const version = 2;\n');
  assert.equal((await updateComponents(["button"], { cwd: project, registryRoot: registry })).conflicts, 0);
  pass("explicit resolution accepts current bytes and prevents the same conflict recurring");

  const beforeStale = await treeSnapshot(project);
  await assert.rejects(applyComponentTransaction(project, [{ path: relative, expected: Buffer.from("stale"), content: Buffer.from("replacement") }]), /[Cc]oncurrent|changed/);
  assert.deepEqual(await treeSnapshot(project), beforeStale);
  pass("stale transaction expectation refuses overwrite without project mutation");

  process.stdout.write(JSON.stringify({
    schemaVersion: 1, synthexCommit: "7babe5ef2c2d1959e680d6edfc19bc384ce428ea",
    scope: "Synthex source APIs, temporary local registry and project; no shadcn execution, performance timing, semantic compilation, crash or device test",
    checks, passed: checks.length,
  }, null, 2) + "\n");
} finally {
  await rm(scratch, { recursive: true, force: true });
}
