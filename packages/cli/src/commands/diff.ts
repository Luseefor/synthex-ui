import type { Command } from "commander";
import { diffComponents } from "../utils/componentUpdates";
import type { ComponentUpdateManifest } from "../utils/componentUpdates";

export function printComponentPreview(manifest: ComponentUpdateManifest, json: boolean): void {
  if (json) {
    process.stdout.write(JSON.stringify(manifest, null, 2) + "\n");
    return;
  }
  const changes = manifest.files.filter((file) => file.status !== "unchanged");
  if (changes.length === 0) process.stdout.write("No component source changes.\n");
  for (const file of changes) {
    process.stdout.write(`${file.status}: ${file.path} (${file.installedVersion ?? "unknown"} → ${file.availableVersion ?? "unknown"})\n`);
    if (file.reason) process.stdout.write(`  ${file.reason}\n`);
    const patch = file.diff || (file.status === "local-only" ? file.localDiff : "");
    if (patch) process.stdout.write(patch.endsWith("\n") ? patch : patch + "\n");
  }
  if (manifest.backupDir) process.stdout.write(`Backup: ${manifest.backupDir}\n`);
  if (manifest.conflictDir) process.stdout.write(`Conflict files: ${manifest.conflictDir}\n`);
  if (manifest.conflicts > 0) process.stdout.write(`${manifest.conflicts} conflict(s). Component files were preserved. Use diff --json for separate local and upstream patches; update --write-conflicts saves the three versions for manual merging.\n`);
}

export function registerDiffCommand(program: Command): void {
  program.command("diff")
    .description("Preview registry changes and local edits without writing files.")
    .argument("[component...]", "Installed components (defaults to all recorded installs)")
    .option("--cwd <dir>", "Target project directory")
    .option("--json", "Output the structured change preview", false)
    .action(async (components: string[], options: { cwd?: string; json: boolean }) => {
      printComponentPreview(await diffComponents(components, { cwd: options.cwd }), options.json);
    });
}
