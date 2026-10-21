import type { Command } from "commander";
import { updateComponents } from "../utils/componentUpdates";
import { printComponentPreview } from "./diff";

export function registerUpdateCommand(program: Command): void {
  program.command("update")
    .description("Merge registry changes into recorded components, with backups and conflict protection.")
    .argument("[component...]", "Installed components (defaults to all recorded installs)")
    .option("--cwd <dir>", "Target project directory")
    .option("--dry-run", "Preview the update without writing components, state, or backups", false)
    .option("--json", "Output the structured change preview", false)
    .option("--write-conflicts", "Save original, local, and incoming versions for manual conflict resolution", false)
    .option("--resolved <file...>", "Accept current contents of explicitly resolved conflicts (project-relative paths)")
    .action(async (components: string[], options: { cwd?: string; dryRun: boolean; json: boolean; writeConflicts: boolean; resolved?: string[] }) => {
      const manifest = await updateComponents(components, options);
      printComponentPreview(manifest, options.json);
      if (manifest.conflicts > 0) process.exitCode = 1;
    });
}
