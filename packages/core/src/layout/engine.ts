import { createCommandRegistry, type CommandRegistry } from "../command/registry";
import { createEventBus, type EventBus } from "../events/eventBus";
import { serializeLayout } from "../serialization/serialize";
import { createStore, type Store } from "../state/store";
import { cloneLayout } from "./utils";
import {
  layoutReducer,
  type AddPanelAction,
  type LayoutAction,
  type MoveNodeAction,
  type RemovePanelAction,
  type ResizeSplitAction,
  type SetActivePanelAction,
  type SplitNodeAction,
} from "./reducer";
import type { LayoutNode } from "./types";

export interface LayoutEngineEvents {
  "layout.changed": LayoutNode;
}

interface LayoutCommandContext {
  getState: () => LayoutNode;
  dispatch: (action: LayoutAction) => LayoutNode;
}

export interface LayoutEngine {
  store: Store<LayoutNode, LayoutAction>;
  commands: CommandRegistry<LayoutCommandContext>;
  events: EventBus<LayoutEngineEvents>;
  getState: () => LayoutNode;
  dispatch: (action: LayoutAction) => LayoutNode;
  serialize: () => string;
}

export function createLayoutEngine(initialLayout: LayoutNode): LayoutEngine {
  const store = createStore(cloneLayout(initialLayout), layoutReducer);
  const events = createEventBus<LayoutEngineEvents>();

  store.subscribe(() => {
    events.publish("layout.changed", store.getState());
  });

  const commands = createCommandRegistry<LayoutCommandContext>(() => ({
    getState: store.getState,
    dispatch: store.dispatch,
  }));

  registerLayoutCommands(commands);

  return {
    store,
    commands,
    events,
    getState: store.getState,
    dispatch: store.dispatch,
    serialize: () => serializeLayout(store.getState()),
  };
}

function registerLayoutCommands(registry: CommandRegistry<LayoutCommandContext>): void {
  registry.register<AddPanelAction, LayoutNode>({
    id: "ADD_PANEL",
    execute: (context, payload) => {
      const snapshot = cloneLayout(context.getState());
      context.dispatch(payload);
      return snapshot;
    },
    undo: (context, _payload, snapshot) => {
      context.dispatch({
        type: "SET_LAYOUT",
        layout: snapshot,
      });
    },
  });

  registry.register<RemovePanelAction, LayoutNode>({
    id: "REMOVE_PANEL",
    execute: (context, payload) => {
      const snapshot = cloneLayout(context.getState());
      context.dispatch(payload);
      return snapshot;
    },
    undo: (context, _payload, snapshot) => {
      context.dispatch({
        type: "SET_LAYOUT",
        layout: snapshot,
      });
    },
  });

  registry.register<SplitNodeAction, LayoutNode>({
    id: "SPLIT_NODE",
    execute: (context, payload) => {
      const snapshot = cloneLayout(context.getState());
      context.dispatch(payload);
      return snapshot;
    },
    undo: (context, _payload, snapshot) => {
      context.dispatch({
        type: "SET_LAYOUT",
        layout: snapshot,
      });
    },
  });

  registry.register<MoveNodeAction, LayoutNode>({
    id: "MOVE_NODE",
    execute: (context, payload) => {
      const snapshot = cloneLayout(context.getState());
      context.dispatch(payload);
      return snapshot;
    },
    undo: (context, _payload, snapshot) => {
      context.dispatch({
        type: "SET_LAYOUT",
        layout: snapshot,
      });
    },
  });

  registry.register<ResizeSplitAction, LayoutNode>({
    id: "RESIZE_SPLIT",
    execute: (context, payload) => {
      const snapshot = cloneLayout(context.getState());
      context.dispatch(payload);
      return snapshot;
    },
    mergeHistory: (previous, next) => {
      if (previous.payload.splitId !== next.payload.splitId) {
        return null;
      }

      return {
        payload: next.payload,
        result: previous.result,
      };
    },
    undo: (context, _payload, snapshot) => {
      context.dispatch({
        type: "SET_LAYOUT",
        layout: snapshot,
      });
    },
  });

  registry.register<SetActivePanelAction, LayoutNode>({
    id: "SET_ACTIVE_PANEL",
    execute: (context, payload) => {
      const snapshot = cloneLayout(context.getState());
      context.dispatch(payload);
      return snapshot;
    },
    undo: (context, _payload, snapshot) => {
      context.dispatch({
        type: "SET_LAYOUT",
        layout: snapshot,
      });
    },
  });
}
