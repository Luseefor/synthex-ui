import path from "node:path";
import { pathToFileURL } from "node:url";
import type { LayoutAction } from "@luseefor/synthex-core";
import type {
  LayoutEngineService,
  ScriptActionInput,
  ScriptApi,
  ScriptEntrypoint,
} from "../types";
import { CliError } from "../utils/errors";

export async function runScript(
  filePath: string,
  engine: LayoutEngineService,
): Promise<void> {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  const entrypoint = await loadEntrypoint(resolvedPath);
  const api = createScriptApi(engine, resolvedPath);

  try {
    await entrypoint(api);
  } catch (error) {
    throw new CliError(
      `Script execution failed for ${resolvedPath}.`,
      1,
      unwrapError(error),
    );
  }
}

async function loadEntrypoint(resolvedPath: string): Promise<ScriptEntrypoint> {
  const moduleUrl = new URL(pathToFileURL(resolvedPath).href);
  moduleUrl.searchParams.set("ts", Date.now().toString());

  let loadedModule: unknown;

  try {
    loadedModule = await import(moduleUrl.href);
  } catch (error) {
    throw new CliError(`Failed to load script at ${resolvedPath}.`, 1, unwrapError(error));
  }

  const candidate = loadedModule as { default?: unknown };

  if (typeof candidate.default !== "function") {
    throw new CliError(
      `Script at ${resolvedPath} must export a default function.`,
    );
  }

  return candidate.default as ScriptEntrypoint;
}

function createScriptApi(engine: LayoutEngineService, resolvedPath: string): ScriptApi {
  const commandName = `run:${path.basename(resolvedPath)}`;

  return Object.freeze({
    dispatch: async (input: ScriptActionInput) =>
      engine.dispatch(normalizeScriptAction(input), { commandName }),
    getState: () => engine.getState(),
    undo: () => engine.undo(),
    redo: () => engine.redo(),
  });
}

function normalizeScriptAction(input: ScriptActionInput): LayoutAction {
  if (!input || typeof input !== "object" || typeof input.type !== "string") {
    throw new CliError("Script dispatch received an invalid action.");
  }

  if ("payload" in input && input.payload && typeof input.payload === "object") {
    return {
      type: input.type,
      ...(input.payload as Record<string, unknown>),
    } as LayoutAction;
  }

  return input as LayoutAction;
}

function unwrapError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
