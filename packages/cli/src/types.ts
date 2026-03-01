import type {
  LayoutAction,
  LayoutDirection,
  LayoutNode,
  LayoutValidationResult,
} from "@synthex/core";

export interface SynthexConfig {
  readonly name: string;
  readonly version: 1;
  readonly layoutFile: "layout.json";
}

export interface ManagedFileResult {
  readonly path: string;
  readonly created: boolean;
}

export interface HistoryEntry {
  readonly timestamp: string;
  readonly commandName: string;
  readonly payload: LayoutAction;
  readonly snapshotHash?: string;
  readonly prevState: LayoutNode;
  readonly nextState: LayoutNode;
}

export interface HistorySnapshot {
  readonly version: 1;
  readonly records: readonly HistoryEntry[];
  readonly past: readonly HistoryEntry[];
  readonly future: readonly HistoryEntry[];
}

export interface LayoutEngineDispatchOptions {
  readonly commandName?: string;
  readonly recordHistory?: boolean;
}

export type Middleware = (
  action: LayoutAction,
  prevState: LayoutNode,
  next: (action: LayoutAction) => LayoutNode,
) => LayoutNode;

export interface HistoryManager {
  record: (
    action: LayoutAction,
    prevState: LayoutNode,
    nextState: LayoutNode,
    options?: LayoutEngineDispatchOptions,
  ) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  clear: () => void;
  getSnapshot: () => HistorySnapshot;
}

export interface CliLayoutEngineOptions {
  readonly cwd?: string;
  readonly allowMissingLayout?: boolean;
}

export interface LayoutEngineService {
  createDefaultLayout: () => LayoutNode;
  getState: () => LayoutNode;
  dispatch: (
    action: LayoutAction,
    options?: LayoutEngineDispatchOptions,
  ) => Promise<LayoutNode>;
  undo: () => Promise<LayoutNode>;
  redo: () => Promise<LayoutNode>;
  registerMiddleware: (middleware: Middleware) => void;
  getHistory: () => HistorySnapshot;
  replaceLayout: (layout: LayoutNode, commandName?: string) => Promise<LayoutNode>;
  addPanel: (panelId: string) => Promise<LayoutNode>;
  splitNode: (nodeId: string, direction: LayoutDirection) => Promise<LayoutNode>;
  print: (layout?: LayoutNode) => string;
  validate: (layout?: LayoutNode) => LayoutValidationResult;
}

export interface FileManager {
  getLayoutPath: () => string;
  getConfigPath: () => string;
  getHistoryPath: () => string;
  readLayout: () => Promise<LayoutNode>;
  readLayoutIfExists: () => Promise<LayoutNode | null>;
  ensureLayoutFile: (layout: LayoutNode) => Promise<ManagedFileResult>;
  saveLayout: (layout: LayoutNode) => Promise<string>;
  ensureConfigFile: (config: SynthexConfig) => Promise<ManagedFileResult>;
  readHistory: () => Promise<HistorySnapshot>;
  ensureHistoryFile: (history: HistorySnapshot) => Promise<ManagedFileResult>;
  saveHistory: (history: HistorySnapshot) => Promise<string>;
}

export type ScriptActionInput =
  | LayoutAction
  | {
      readonly type: LayoutAction["type"];
      readonly payload?: Record<string, unknown>;
      readonly [key: string]: unknown;
    };

export interface ScriptApi {
  dispatch: (action: ScriptActionInput) => Promise<LayoutNode>;
  getState: () => LayoutNode;
  undo: () => Promise<LayoutNode>;
  redo: () => Promise<LayoutNode>;
}

export type ScriptEntrypoint = (api: ScriptApi) => Promise<unknown> | unknown;
