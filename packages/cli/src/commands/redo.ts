import type { Command } from "commander";
import { createCliLayoutEngine } from "../engine/layoutEngine";
import { logger } from "../utils/logger";

export function registerRedoCommand(program: Command): void {
  program
    .command("redo")
    .description("Reapply the most recently undone layout mutation.")
    .action(async () => {
      const layoutEngine = await createCliLayoutEngine();
      await layoutEngine.redo();

      logger.success("Redo applied.");
    });
}
