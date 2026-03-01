import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";
import { deserializeLayout, serializeLayout, type LayoutNode } from "@synthex/core";
import type {
  FileManager,
  HistoryEntry,
  HistorySnapshot,
  ManagedFileResult,
  SynthexConfig,
} from "../types";
import { CliError } from "../utils/errors";

const LAYOUT_FILE_NAME = "layout.json";
const CONFIG_FILE_NAME = "synthex.config.json";
const INTERNAL_DIRECTORY_NAME = ".synthex";
const HISTORY_FILE_NAME = "history.json";

export function createFileManager(cwd = process.cwd()): FileManager {
  const layoutPath = path.join(cwd, LAYOUT_FILE_NAME);
  const configPath = path.join(cwd, CONFIG_FILE_NAME);
  const internalDirectoryPath = path.join(cwd, INTERNAL_DIRECTORY_NAME);
  const historyPath = path.join(internalDirectoryPath, HISTORY_FILE_NAME);

  return {
    getLayoutPath() {
      return layoutPath;
    },

    getConfigPath() {
      return configPath;
    },

    getHistoryPath() {
      return historyPath;
    },

    async readLayout() {
      const exists = await fileExists(layoutPath);

      if (!exists) {
        throw new CliError(`Layout file not found at ${layoutPath}. Run \`synthex init\` first.`);
      }

      return readLayoutFile(layoutPath);
    },

    async readLayoutIfExists() {
      const exists = await fileExists(layoutPath);
      return exists ? readLayoutFile(layoutPath) : null;
    },

    async ensureLayoutFile(layout) {
      const exists = await fileExists(layoutPath);

      if (!exists) {
        await writeLayoutFile(layoutPath, layout);
      }

      return {
        path: layoutPath,
        created: !exists,
      } satisfies ManagedFileResult;
    },

    async readHistory() {
      const exists = await fileExists(historyPath);

      if (!exists) {
        return createEmptyHistorySnapshot();
      }

      try {
        const content = await readFile(historyPath, "utf8");
        return parseHistorySnapshot(content);
      } catch (error) {
        throw new CliError(`Failed to read history file at ${historyPath}.`, 1, unwrapError(error));
      }
    },

    async ensureHistoryFile(history) {
      const exists = await fileExists(historyPath);

      if (!exists) {
        await writeHistoryFile(historyPath, history);
      }

      return {
        path: historyPath,
        created: !exists,
      } satisfies ManagedFileResult;
    },

    async saveHistory(history) {
      await writeHistoryFile(historyPath, history);
      return historyPath;
    },

    async saveLayout(layout) {
      await writeLayoutFile(layoutPath, layout);
      return layoutPath;
    },

    async ensureConfigFile(config) {
      const exists = await fileExists(configPath);

      if (!exists) {
        await writeConfigFile(configPath, config);
      }

      return {
        path: configPath,
        created: !exists,
      } satisfies ManagedFileResult;
    },
  };
}

async function readLayoutFile(filePath: string): Promise<LayoutNode> {
  try {
    const content = await readFile(filePath, "utf8");
    return deserializeLayout(content);
  } catch (error) {
    throw new CliError(`Failed to read layout file at ${filePath}.`, 1, unwrapError(error));
  }
}

async function writeLayoutFile(filePath: string, layout: LayoutNode): Promise<void> {
  try {
    await ensureDirectory(path.dirname(filePath));
    await writeFile(filePath, `${serializeLayout(layout)}\n`, "utf8");
  } catch (error) {
    throw new CliError(`Failed to write layout file at ${filePath}.`, 1, unwrapError(error));
  }
}

async function writeConfigFile(filePath: string, config: SynthexConfig): Promise<void> {
  try {
    await ensureDirectory(path.dirname(filePath));
    await writeFile(filePath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  } catch (error) {
    throw new CliError(`Failed to write config file at ${filePath}.`, 1, unwrapError(error));
  }
}

async function writeHistoryFile(filePath: string, history: HistorySnapshot): Promise<void> {
  try {
    await ensureDirectory(path.dirname(filePath));
    await writeFile(filePath, `${JSON.stringify(history, null, 2)}\n`, "utf8");
  } catch (error) {
    throw new CliError(`Failed to write history file at ${filePath}.`, 1, unwrapError(error));
  }
}

function parseHistorySnapshot(content: string): HistorySnapshot {
  const parsed = JSON.parse(content) as Partial<HistorySnapshot>;

  if (parsed.version !== 1) {
    throw new Error("Unsupported history file version.");
  }

  return {
    version: 1,
    records: normalizeHistoryEntries(parsed.records),
    past: normalizeHistoryEntries(parsed.past),
    future: normalizeHistoryEntries(parsed.future),
  };
}

function normalizeHistoryEntries(entries: unknown): readonly HistoryEntry[] {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.map((entry) => normalizeHistoryEntry(entry));
}

function normalizeHistoryEntry(entry: unknown): HistoryEntry {
  if (!entry || typeof entry !== "object") {
    throw new Error("History entry is not an object.");
  }

  const candidate = entry as Partial<HistoryEntry>;

  if (
    typeof candidate.timestamp !== "string" ||
    typeof candidate.commandName !== "string" ||
    !candidate.payload ||
    typeof candidate.payload !== "object" ||
    !candidate.prevState ||
    typeof candidate.prevState !== "object" ||
    !candidate.nextState ||
    typeof candidate.nextState !== "object"
  ) {
    throw new Error("History entry is missing required fields.");
  }

  return {
    timestamp: candidate.timestamp,
    commandName: candidate.commandName,
    payload: candidate.payload,
    snapshotHash:
      typeof candidate.snapshotHash === "string" ? candidate.snapshotHash : undefined,
    prevState: candidate.prevState,
    nextState: candidate.nextState,
  };
}

function createEmptyHistorySnapshot(): HistorySnapshot {
  return {
    version: 1,
    records: [],
    past: [],
    future: [],
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirectory(directoryPath: string): Promise<void> {
  await mkdir(directoryPath, { recursive: true });
}

function unwrapError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
