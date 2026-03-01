import type { Command } from "commander";
import { createCliLayoutEngine } from "../engine/layoutEngine";
import { runScript } from "../engine/scriptRunner";
import { logger } from "../utils/logger";

export function registerRuntimeCommands(program: Command): void {
  program
    .command("test")
    .description("Verify the Bun CLI executable is wired correctly.")
    .action(() => {
      logger.success("Synthex CLI is ready.");
    });

  program
    .command("run")
    .description("Execute a Synthex automation script.")
    .argument("<file>", "Script file path")
    .action(async (file: string) => {
      const layoutEngine = await createCliLayoutEngine();
      await runScript(file, layoutEngine);

      logger.success(`Executed script "${file}".`);
    });

  program
    .command("history")
    .description("Print persisted command history.")
    .action(async () => {
      const layoutEngine = await createCliLayoutEngine({ allowMissingLayout: true });
      process.stdout.write(`${JSON.stringify(layoutEngine.getHistory(), null, 2)}\n`);
    });
}
