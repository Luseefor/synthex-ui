import type { Command } from "commander";
import { createCliLayoutEngine } from "../engine/layoutEngine";
import { CliError } from "../utils/errors";
import { logger } from "../utils/logger";

export function registerValidateCommand(program: Command): void {
  program
    .command("validate")
    .description("Validate the current layout.json file.")
    .action(async () => {
      const layoutEngine = await createCliLayoutEngine();
      const validation = layoutEngine.validate();

      if (!validation.valid) {
        throw new CliError("Layout validation failed.", 1, validation.issues);
      }

      logger.success("Layout is valid.");
    });
}
