import {
  cloneLayout,
  createStore,
  findNodeById,
  layoutReducer,
  serializeLayout,
  traverseLayout,
  validateLayout,
  type LayoutAction,
  type LayoutDirection,
  type LayoutNode,
  type PanelNode,
} from "@luseefor/synthex-core";
import type {
  CliLayoutEngineOptions,
  FileManager,
  LayoutEngineDispatchOptions,
  LayoutEngineService,
  Middleware,
} from "../types";
import { CliError } from "../utils/errors";
import { createFileManager } from "./fileManager";
import { createHistoryManager } from "./historyManager";
import { applyMiddleware, createHistoryMiddleware, createLoggerMiddleware } from "./middleware";

export async function createCliLayoutEngine(
  options: CliLayoutEngineOptions = {},
): Promise<LayoutEngineService> {
  const fileManager = createFileManager(options.cwd);
  const defaultLayout = createDefaultLayout();
  const initialLayout = await loadInitialLayout(
    fileManager,
    defaultLayout,
    options.allowMissingLayout ?? false,
  );
  const historySnapshot = await fileManager.readHistory();
  const historyManager = createHistoryManager(historySnapshot);
  const store = createStore(cloneLayout(initialLayout), layoutReducer);
  const customMiddlewares: Middleware[] = [];
  let activeDispatchOptions: LayoutEngineDispatchOptions = {};
  let operationQueue: Promise<void> = Promise.resolve();

  const dispatchInternal = (action: LayoutAction): LayoutNode => {
    return applyMiddleware(
      action,
      [
        ...customMiddlewares,
        createLoggerMiddleware(() => activeDispatchOptions),
        createHistoryMiddleware({
          historyManager,
          getDispatchOptions: () => activeDispatchOptions,
        }),
      ],
      store.dispatch,
      store.getState,
    );
  };

  const persistState = async (): Promise<void> => {
    await Promise.all([
      fileManager.saveLayout(store.getState()),
      fileManager.saveHistory(historyManager.getSnapshot()),
    ]);
  };

  const dispatchUnlocked = async (
    action: LayoutAction,
    dispatchOptions: LayoutEngineDispatchOptions = {},
  ): Promise<LayoutNode> => {
    activeDispatchOptions = dispatchOptions;

    try {
      const nextState = dispatchInternal(action);
      await persistState();
      return cloneLayout(nextState);
    } finally {
      activeDispatchOptions = {};
    }
  };

  const dispatch = async (
    action: LayoutAction,
    dispatchOptions: LayoutEngineDispatchOptions = {},
  ): Promise<LayoutNode> => runExclusive(() => dispatchUnlocked(action, dispatchOptions));

  const applyHistoryStateUnlocked = async (
    layout: LayoutNode,
    commandName: string,
  ): Promise<LayoutNode> => {
    return dispatchUnlocked(
      {
        type: "SET_LAYOUT",
        layout,
      },
      {
        commandName,
        recordHistory: false,
      },
    );
  };

  return {
    createDefaultLayout,

    getState() {
      return cloneLayout(store.getState());
    },

    dispatch,

    async undo() {
      return runExclusive(async () => {
        const entry = historyManager.undo();

        if (!entry) {
          throw new CliError("Nothing to undo.");
        }

        if (!validateLayout(entry.prevState).valid) {
          historyManager.redo();
          throw new CliError("Unable to restore layout from history. History entry is invalid.");
        }

        return applyHistoryStateUnlocked(entry.prevState, "undo");
      });
    },

    async redo() {
      return runExclusive(async () => {
        const entry = historyManager.redo();

        if (!entry) {
          throw new CliError("Nothing to redo.");
        }

        if (!validateLayout(entry.nextState).valid) {
          historyManager.undo();
          throw new CliError("Unable to reapply layout from history. History entry is invalid.");
        }

        return applyHistoryStateUnlocked(entry.nextState, "redo");
      });
    },

    registerMiddleware(middleware) {
      customMiddlewares.push(middleware);
    },

    getHistory() {
      return historyManager.getSnapshot();
    },

    replaceLayout(layout, commandName = "SET_LAYOUT") {
      return dispatch(
        {
          type: "SET_LAYOUT",
          layout,
        },
        {
          commandName,
        },
      );
    },

    async addPanel(panelId) {
      return runExclusive(async () => {
        const currentLayout = store.getState();

        if (findNodeById(currentLayout, panelId)) {
          throw new CliError(`A layout node with id "${panelId}" already exists.`);
        }

        const targetNodeId = resolvePrimaryTabHost(currentLayout);

        if (!targetNodeId) {
          throw new CliError("Unable to resolve a panel host for insertion.");
        }

        return dispatchUnlocked(
          {
            type: "ADD_PANEL",
            targetNodeId,
            panel: createPanelNode(panelId, toTitle(panelId)),
          },
          {
            commandName: "layout:add-panel",
          },
        );
      });
    },

    async splitNode(nodeId, direction) {
      return runExclusive(async () => {
        const currentLayout = store.getState();
        const targetNode = findNodeById(currentLayout, nodeId);

        if (!targetNode) {
          throw new CliError(`Node "${nodeId}" was not found in the current layout.`);
        }

        const nextPanelId = createGeneratedPanelId(currentLayout, `${nodeId}-panel`);

        return dispatchUnlocked(
          {
            type: "SPLIT_NODE",
            targetNodeId: targetNode.id,
            direction,
            node: createPanelNode(nextPanelId, toTitle(nextPanelId)),
            position: "after",
          },
          {
            commandName: "layout:split",
          },
        );
      });
    },

    print(layout = store.getState()) {
      return serializeLayout(layout);
    },

    validate(layout = store.getState()) {
      return validateLayout(layout);
    },
  };

  async function runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    const previous = operationQueue;
    let release = (): void => {};
    operationQueue = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;

    try {
      return await operation();
    } finally {
      release();
    }
  }
}

export function createDefaultLayout(): LayoutNode {
  const workspacePanel = createPanelNode("workspace", "Workspace");
  const inspectorPanel = createPanelNode("inspector", "Inspector");

  return {
    id: "root",
    type: "split",
    direction: "horizontal",
    sizes: [0.75, 0.25],
    children: [
      {
        id: "workspace-tabs",
        type: "tabs",
        activePanelId: workspacePanel.id,
        children: [workspacePanel],
      },
      inspectorPanel,
    ],
  };
}

async function loadInitialLayout(
  fileManager: FileManager,
  fallbackLayout: LayoutNode,
  allowMissingLayout: boolean,
): Promise<LayoutNode> {
  if (allowMissingLayout) {
    const layout = await fileManager.readLayoutIfExists();
    return layout ?? cloneLayout(fallbackLayout);
  }

  return fileManager.readLayout();
}

function resolvePrimaryTabHost(layout: LayoutNode): string | null {
  let tabsId: string | null = null;
  let panelId: string | null = null;

  traverseLayout(layout, (node) => {
    if (!tabsId && node.type === "tabs") {
      tabsId = node.id;
    }

    if (!tabsId && !panelId && node.type === "panel") {
      panelId = node.id;
    }
  });

  return tabsId ?? panelId;
}

function createPanelNode(panelId: string, title: string): PanelNode {
  return {
    id: panelId,
    type: "panel",
    panelType: panelId,
    title,
  };
}

function createGeneratedPanelId(layout: LayoutNode, seed: string): string {
  let counter = 1;
  let nextId = seed;

  while (findNodeById(layout, nextId)) {
    nextId = `${seed}-${counter}`;
    counter += 1;
  }

  return nextId;
}

function toTitle(value: string): string {
  return value
    .split(/[-_:/]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
