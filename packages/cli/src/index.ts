#!/usr/bin/env node

import { Command, CommanderError } from "commander";
import { registerAddCommand } from "./commands/add";
import { registerApplyCommand } from "./commands/apply";
import { registerCreateCommand } from "./commands/create";
import { registerInitCommand } from "./commands/init";
import { registerLayoutCommands } from "./commands/layout";
import { registerListCommand } from "./commands/list";
import { registerMigrateCommand } from "./commands/migrate";
import { registerRedoCommand } from "./commands/redo";
import { registerRuntimeCommands } from "./commands/run";
import { registerSetupCommand } from "./commands/setup";
import { registerUndoCommand } from "./commands/undo";
import { registerValidateCommand } from "./commands/validate";
import { toCliError } from "./utils/errors";
import { logger } from "./utils/logger";

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("synthex")
    .description("Synthex UI command line interface")
    .showHelpAfterError()
    .exitOverride();

  registerAddCommand(program);
  registerApplyCommand(program);
  registerCreateCommand(program);
  registerInitCommand(program);
  registerSetupCommand(program);
  registerLayoutCommands(program);
  registerListCommand(program);
  registerMigrateCommand(program);
  registerUndoCommand(program);
  registerRedoCommand(program);
  registerRuntimeCommands(program);
  registerValidateCommand(program);

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    if (error instanceof CommanderError) {
      const code = Number(error.exitCode);
      if (code === 0) {
        process.exitCode = 0;
        return;
      }
      logger.error(error.message);
      process.exitCode = Number.isFinite(code) && code !== 0 ? code : 1;
      return;
    }

    const cliError = toCliError(error);
    logger.error(cliError.message, cliError.details);
    process.exitCode = cliError.exitCode;
  }
}

void main();
