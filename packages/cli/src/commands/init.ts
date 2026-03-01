import { basename } from "node:path";
import type { Command } from "commander";
import { createFileManager } from "../engine/fileManager";
import { createDefaultLayout } from "../engine/layoutEngine";
import type { HistorySnapshot, SynthexConfig } from "../types";
import { logger } from "../utils/logger";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Initialize a Synthex project in the current directory.")
    .action(async () => {
      const fileManager = createFileManager();
      const defaultLayout = createDefaultLayout();
      const projectConfig = createProjectConfig(process.cwd());
      const historySnapshot = createInitialHistory();

      const layoutFile = await fileManager.ensureLayoutFile(defaultLayout);
      const configFile = await fileManager.ensureConfigFile(projectConfig);
      const historyFile = await fileManager.ensureHistoryFile(historySnapshot);

      logger.success("Synthex project initialized.");
      logger.info("Project files", {
        layout: layoutFile.path,
        layoutCreated: layoutFile.created,
        config: configFile.path,
        configCreated: configFile.created,
        history: historyFile.path,
        historyCreated: historyFile.created,
      });
    });
}

function createProjectConfig(cwd: string): SynthexConfig {
  return {
    name: basename(cwd),
    version: 1,
    layoutFile: "layout.json",
  };
}

function createInitialHistory(): HistorySnapshot {
  return {
    version: 1,
    records: [],
    past: [],
    future: [],
  };
}
