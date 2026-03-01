#!/usr/bin/env bun

import { Command, CommanderError } from "commander";
import { registerInitCommand } from "./commands/init";
import { registerLayoutCommands } from "./commands/layout";
import { registerRedoCommand } from "./commands/redo";
import { registerRuntimeCommands } from "./commands/run";
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

  registerInitCommand(program);
  registerLayoutCommands(program);
  registerUndoCommand(program);
  registerRedoCommand(program);
  registerRuntimeCommands(program);
  registerValidateCommand(program);

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    if (error instanceof CommanderError) {
      logger.error(error.message);
      process.exitCode = Number(error.exitCode) || 1;
      return;
    }

    const cliError = toCliError(error);
    logger.error(cliError.message, cliError.details);
    process.exitCode = cliError.exitCode;
  }
}

void main();
