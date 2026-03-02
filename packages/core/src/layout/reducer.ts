import {
  cloneLayout,
  findNodeById,
  insertNodeAt,
  normalizeLayout,
  normalizeSplitRatios,
  removeNodeById,
} from "./utils";
import { validateLayout } from "./validation";
import type { LayoutDirection, LayoutNode, LayoutNodeId, PanelNode } from "./types";

export interface SetLayoutAction {
  type: "SET_LAYOUT";
  layout: LayoutNode;
}

export interface SetActivePanelAction {
  type: "SET_ACTIVE_PANEL";
  tabsId: string;
  panelId: string;
}

export interface AddPanelAction {
  type: "ADD_PANEL";
  targetNodeId: LayoutNodeId;
  panel: PanelNode;
  index?: number;
  tabsId?: LayoutNodeId;
}

export interface RemovePanelAction {
  type: "REMOVE_PANEL";
  panelId: LayoutNodeId;
}

export interface SplitNodeAction {
  type: "SPLIT_NODE";
  targetNodeId: LayoutNodeId;
  direction: LayoutDirection;
  node: LayoutNode;
  position?: "before" | "after";
  splitId?: LayoutNodeId;
  sizes?: readonly number[];
}

export interface MoveNodeAction {
  type: "MOVE_NODE";
  nodeId: LayoutNodeId;
  targetNodeId: LayoutNodeId;
  position:
  | {
    kind: "tab";
    index?: number;
    tabsId?: LayoutNodeId;
  }
  | {
    kind: "before" | "after";
    direction: LayoutDirection;
    splitId?: LayoutNodeId;
    sizes?: readonly number[];
  };
}

export interface ResizeSplitAction {
  type: "RESIZE_SPLIT";
  splitId: LayoutNodeId;
  sizes: readonly number[];
}

export interface UpdatePanelAction {
  type: "UPDATE_PANEL";
  panelId: LayoutNodeId;
  update: Partial<Omit<PanelNode, "id" | "type">>;
}

export type LayoutAction =
  | SetLayoutAction
  | SetActivePanelAction
  | AddPanelAction
  | RemovePanelAction
  | SplitNodeAction
  | MoveNodeAction
  | ResizeSplitAction
  | UpdatePanelAction;

export function layoutReducer(state: LayoutNode, action: LayoutAction): LayoutNode {
  switch (action.type) {
    case "SET_LAYOUT":
      return normalizeAndValidate(action.layout, state);

    case "SET_ACTIVE_PANEL":
      return normalizeAndValidate(
        mapLayout(state, (node) => {
          if (node.id !== action.tabsId || node.type !== "tabs") {
            return node;
          }

          if (!node.children.some((panel) => panel.id === action.panelId)) {
            return node;
          }

          return {
            ...node,
            activePanelId: action.panelId,
          };
        }),
        state,
      );

    case "ADD_PANEL": {
      const result = insertNodeAt(state, action.targetNodeId, action.panel, {
        kind: "tab",
        index: action.index,
        tabsId: action.tabsId,
      });

      return result.inserted ? normalizeAndValidate(result.layout, state) : state;
    }

    case "REMOVE_PANEL": {
      const result = removeNodeById(state, action.panelId);

      if (!result.removedNode || result.removedNode.type !== "panel" || !result.layout) {
        return state;
      }

      return normalizeAndValidate(result.layout, state);
    }

    case "SPLIT_NODE": {
      const result = insertNodeAt(state, action.targetNodeId, action.node, {
        kind: action.position ?? "after",
        direction: action.direction,
        splitId: action.splitId,
        sizes: action.sizes,
      });

      return result.inserted ? normalizeAndValidate(result.layout, state) : state;
    }

    case "MOVE_NODE": {
      if (action.nodeId === action.targetNodeId) {
        return state;
      }

      const nodeToMove = findNodeById(state, action.nodeId);

      if (!nodeToMove) {
        return state;
      }

      if (findNodeById(nodeToMove, action.targetNodeId)) {
        return state;
      }

      const extracted = removeNodeById(state, action.nodeId);

      if (!extracted.removedNode || !extracted.layout) {
        return state;
      }

      const inserted = insertNodeAt(extracted.layout, action.targetNodeId, extracted.removedNode, action.position);

      return inserted.inserted ? normalizeAndValidate(inserted.layout, state) : state;
    }

    case "RESIZE_SPLIT": {
      const resized = mapLayout(state, (node) => {
        if (node.id !== action.splitId || node.type !== "split") {
          return node;
        }

        return {
          ...node,
          sizes: normalizeSplitRatios(action.sizes, node.children.length),
        };
      });

      return normalizeAndValidate(resized, state);
    }

    case "UPDATE_PANEL": {
      const updated = mapLayout(state, (node) => {
        if (node.id !== action.panelId || node.type !== "panel") {
          return node;
        }

        return {
          ...node,
          ...action.update,
        };
      });

      return normalizeAndValidate(updated, state);
    }

    default:
      return state;
  }
}

function mapLayout(
  node: LayoutNode,
  mapper: (node: LayoutNode) => LayoutNode,
): LayoutNode {
  const mapped = mapper(node);

  if (mapped.type === "split") {
    return {
      ...mapped,
      children: mapped.children.map((child) => mapLayout(child, mapper)),
    };
  }

  return mapped;
}

function normalizeAndValidate(nextState: LayoutNode, fallbackState: LayoutNode): LayoutNode {
  const normalized = normalizeLayout(cloneLayout(nextState));
  const validation = validateLayout(normalized);

  return validation.valid ? normalized : fallbackState;
}
