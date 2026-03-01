import type { Command } from "commander";
import { createCliLayoutEngine } from "../engine/layoutEngine";
import { logger } from "../utils/logger";

export function registerUndoCommand(program: Command): void {
  program
    .command("undo")
    .description("Undo the most recent layout mutation.")
    .action(async () => {
      const layoutEngine = await createCliLayoutEngine();
      await layoutEngine.undo();

      logger.success("Undo applied.");
    });
}
