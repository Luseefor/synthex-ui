import type { LayoutDirection, LayoutNode, LayoutNodeId, PanelNode, SplitNode, TabsNode } from "./types";

export interface LayoutTraversalContext {
  readonly parent: LayoutNode | null;
  readonly depth: number;
  readonly index: number;
}

export type LayoutInsertPosition =
  | {
      readonly kind: "tab";
      readonly index?: number;
      readonly tabsId?: LayoutNodeId;
    }
  | {
      readonly kind: "before" | "after";
      readonly direction: LayoutDirection;
      readonly splitId?: LayoutNodeId;
      readonly sizes?: readonly number[];
    };

export interface RemoveNodeResult {
  readonly layout: LayoutNode | null;
  readonly removedNode: LayoutNode | null;
}

export interface InsertNodeResult {
  readonly layout: LayoutNode;
  readonly inserted: boolean;
}

export function cloneLayout<TNode extends LayoutNode>(node: TNode): TNode {
  switch (node.type) {
    case "panel":
      return {
        ...node,
        props: node.props ? cloneJsonObject(node.props) : undefined,
      } as TNode;

    case "tabs":
      return {
        ...node,
        children: node.children.map((child) => cloneLayout(child)),
      } as TNode;

    case "split":
      return {
        ...node,
        sizes: [...node.sizes],
        children: node.children.map((child) => cloneLayout(child)),
      } as TNode;
  }
}

export function traverseLayout(
  node: LayoutNode,
  visitor: (node: LayoutNode, context: LayoutTraversalContext) => void,
  context: LayoutTraversalContext = { parent: null, depth: 0, index: 0 },
): void {
  visitor(node, context);

  if (node.type === "split") {
    node.children.forEach((child, index) => {
      traverseLayout(child, visitor, {
        parent: node,
        depth: context.depth + 1,
        index,
      });
    });
  }

  if (node.type === "tabs") {
    node.children.forEach((child, index) => {
      traverseLayout(child, visitor, {
        parent: node,
        depth: context.depth + 1,
        index,
      });
    });
  }
}

export function findNodeById(node: LayoutNode, nodeId: LayoutNodeId): LayoutNode | null {
  if (node.id === nodeId) {
    return node;
  }

  if (node.type === "split") {
    for (const child of node.children) {
      const match = findNodeById(child, nodeId);

      if (match) {
        return match;
      }
    }
  }

  if (node.type === "tabs") {
    for (const child of node.children) {
      if (child.id === nodeId) {
        return child;
      }
    }
  }

  return null;
}

export function removeNodeById(layout: LayoutNode, nodeId: LayoutNodeId): RemoveNodeResult {
  const result = removeNodeByIdInternal(layout, nodeId);

  return {
    layout: result.layout ? normalizeLayout(result.layout) : null,
    removedNode: result.removedNode,
  };
}

export function insertNodeAt(
  layout: LayoutNode,
  targetNodeId: LayoutNodeId,
  nodeToInsert: LayoutNode,
  position: LayoutInsertPosition,
): InsertNodeResult {
  const result = insertNodeAtInternal(layout, targetNodeId, nodeToInsert, position);

  return {
    inserted: result.inserted,
    layout: result.inserted ? normalizeLayout(result.layout) : layout,
  };
}

export function normalizeLayout(layout: LayoutNode): LayoutNode {
  const normalized = normalizeLayoutInternal(layout);

  if (!normalized) {
    return layout;
  }

  return normalized;
}

export function normalizeSplitRatios(
  sizes: readonly number[],
  childCount: number,
): readonly number[] {
  if (childCount <= 0) {
    return [];
  }

  if (sizes.length !== childCount) {
    const evenRatio = 1 / childCount;
    return Array.from({ length: childCount }, () => evenRatio);
  }

  const sanitized = sizes.map((size) => (Number.isFinite(size) && size > 0 ? size : 0));
  const total = sanitized.reduce((sum, size) => sum + size, 0);

  if (total <= 0) {
    const evenRatio = 1 / childCount;
    return Array.from({ length: childCount }, () => evenRatio);
  }

  return sanitized.map((size) => size / total);
}

function removeNodeByIdInternal(
  node: LayoutNode,
  nodeId: LayoutNodeId,
): RemoveNodeResult {
  if (node.id === nodeId) {
    return {
      layout: null,
      removedNode: cloneLayout(node),
    };
  }

  if (node.type === "panel") {
    return {
      layout: node,
      removedNode: null,
    };
  }

  if (node.type === "tabs") {
    const childIndex = node.children.findIndex((child) => child.id === nodeId);

    if (childIndex >= 0) {
      const removedNode = node.children[childIndex];

      if (!removedNode) {
        return {
          layout: node,
          removedNode: null,
        };
      }

      const nextChildren = node.children.filter((child) => child.id !== nodeId);

      if (nextChildren.length === 0) {
        return {
          layout: null,
          removedNode: cloneLayout(removedNode),
        };
      }

      const activePanelId = nextChildren.some((child) => child.id === node.activePanelId)
        ? node.activePanelId
        : nextChildren[0]?.id ?? "";

      return {
        layout: {
          ...node,
          activePanelId,
          children: nextChildren,
        },
        removedNode: cloneLayout(removedNode),
      };
    }

    return {
      layout: node,
      removedNode: null,
    };
  }

  const nextChildren: LayoutNode[] = [];
  let removedNode: LayoutNode | null = null;

  for (const child of node.children) {
    if (removedNode) {
      nextChildren.push(child);
      continue;
    }

    const result = removeNodeByIdInternal(child, nodeId);

    if (!result.removedNode) {
      if (result.layout) {
        nextChildren.push(result.layout);
      }

      continue;
    }

    removedNode = result.removedNode;

    if (result.layout) {
      nextChildren.push(result.layout);
    }
  }

  if (!removedNode) {
    return {
      layout: node,
      removedNode: null,
    };
  }

  return {
    layout: {
      ...node,
      children: nextChildren,
      sizes: normalizeSplitRatios(node.sizes, nextChildren.length),
    },
    removedNode,
  };
}

function insertNodeAtInternal(
  node: LayoutNode,
  targetNodeId: LayoutNodeId,
  nodeToInsert: LayoutNode,
  position: LayoutInsertPosition,
): InsertNodeResult {
  if (node.id === targetNodeId) {
    return insertDirectlyAtNode(node, nodeToInsert, position, node);
  }

  if (node.type === "tabs") {
    if (position.kind === "tab") {
      const childIndex = node.children.findIndex((child) => child.id === targetNodeId);

      if (childIndex >= 0) {
        const panelToInsert = nodeToInsert.type === "panel" ? cloneLayout(nodeToInsert) : null;

        if (!panelToInsert) {
          return { inserted: false, layout: node };
        }

        const insertionIndex = clampIndex(node.children.length, position.index ?? childIndex + 1);
        const nextChildren = [...node.children];
        nextChildren.splice(insertionIndex, 0, panelToInsert);

        return {
          inserted: true,
          layout: {
            ...node,
            activePanelId: panelToInsert.id,
            children: nextChildren,
          },
        };
      }
    }

    if (node.children.some((child) => child.id === targetNodeId)) {
      const splitAroundTabs = createSplitContainer(
        node,
        nodeToInsert,
        position.kind === "tab"
          ? { kind: "after", direction: "horizontal" }
          : position,
        layoutScopedIdSeed(node.id, nodeToInsert.id, "split"),
      );

      return splitAroundTabs
        ? { inserted: true, layout: splitAroundTabs }
        : { inserted: false, layout: node };
    }

    return {
      inserted: false,
      layout: node,
    };
  }

  if (node.type !== "split") {
    return {
      inserted: false,
      layout: node,
    };
  }

  const nextChildren = [...node.children];

  for (let index = 0; index < nextChildren.length; index += 1) {
    const child = nextChildren[index];

    if (!child) {
      continue;
    }

    const result = insertNodeAtInternal(child, targetNodeId, nodeToInsert, position);

    if (!result.inserted) {
      continue;
    }

    nextChildren[index] = result.layout;
    return {
      inserted: true,
      layout: {
        ...node,
        children: nextChildren,
      },
    };
  }

  return {
    inserted: false,
    layout: node,
  };
}

function insertDirectlyAtNode(
  targetNode: LayoutNode,
  nodeToInsert: LayoutNode,
  position: LayoutInsertPosition,
  scopeNode: LayoutNode,
): InsertNodeResult {
  if (position.kind === "tab") {
    const panelToInsert = nodeToInsert.type === "panel" ? cloneLayout(nodeToInsert) : null;

    if (!panelToInsert) {
      return { inserted: false, layout: targetNode };
    }

    if (targetNode.type === "panel") {
      const currentPanel = cloneLayout(targetNode);
      const tabsId = position.tabsId ?? layoutScopedIdSeed(currentPanel.id, panelToInsert.id, "tabs");
      const insertionIndex = clampIndex(1, position.index ?? 1);
      const children = insertionIndex === 0 ? [panelToInsert, currentPanel] : [currentPanel, panelToInsert];

      return {
        inserted: true,
        layout: {
          id: tabsId,
          type: "tabs",
          activePanelId: panelToInsert.id,
          children,
        },
      };
    }

    if (targetNode.type === "tabs") {
      const insertionIndex = clampIndex(targetNode.children.length, position.index);
      const children = [...targetNode.children];
      children.splice(insertionIndex, 0, panelToInsert);

      return {
        inserted: true,
        layout: {
          ...targetNode,
          activePanelId: panelToInsert.id,
          children,
        },
      };
    }

    return {
      inserted: false,
      layout: targetNode,
    };
  }

  const splitNode = createSplitContainer(
    targetNode,
    nodeToInsert,
    position,
    position.splitId ?? layoutScopedIdSeed(targetNode.id, nodeToInsert.id, "split"),
  );

  return splitNode
    ? { inserted: true, layout: splitNode }
    : { inserted: false, layout: targetNode };
}

function createSplitContainer(
  targetNode: LayoutNode,
  nodeToInsert: LayoutNode,
  position: Extract<LayoutInsertPosition, { kind: "before" | "after" }>,
  splitId: LayoutNodeId,
): SplitNode | null {
  if (position.kind !== "before" && position.kind !== "after") {
    return null;
  }

  const clonedTarget = cloneLayout(targetNode);
  const clonedNodeToInsert = cloneLayout(nodeToInsert);
  const children =
    position.kind === "before"
      ? [clonedNodeToInsert, clonedTarget]
      : [clonedTarget, clonedNodeToInsert];

  return {
    id: splitId,
    type: "split",
    direction: position.direction,
    sizes: normalizeSplitRatios(position.sizes ?? [1, 1], 2),
    children,
  };
}

function normalizeLayoutInternal(node: LayoutNode): LayoutNode | null {
  if (node.type === "panel") {
    return node;
  }

  if (node.type === "tabs") {
    const children = node.children.map((child) => cloneLayout(child));

    if (children.length === 0) {
      return null;
    }

    const activePanelId = children.some((child) => child.id === node.activePanelId)
      ? node.activePanelId
      : children[0]?.id ?? "";

    return {
      ...node,
      activePanelId,
      children,
    };
  }

  const children = node.children
    .map((child) => normalizeLayoutInternal(child))
    .filter((child): child is LayoutNode => child !== null);

  if (children.length === 0) {
    return null;
  }

  if (children.length === 1) {
    return children[0] ?? null;
  }

  return {
    ...node,
    children,
    sizes: normalizeSplitRatios(node.sizes, children.length),
  };
}

function layoutScopedIdSeed(
  leftId: LayoutNodeId,
  rightId: LayoutNodeId,
  prefix: "split" | "tabs",
): LayoutNodeId {
  return `${prefix}:${leftId}:${rightId}`;
}

function clampIndex(length: number, index: number | undefined): number {
  if (index === undefined) {
    return length;
  }

  if (index < 0) {
    return 0;
  }

  if (index > length) {
    return length;
  }

  return index;
}

function cloneJsonObject(value: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  Object.entries(value).forEach(([key, entryValue]) => {
    output[key] = cloneJsonValue(entryValue);
  });

  return output;
}

function cloneJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => cloneJsonValue(item));
  }

  if (value && typeof value === "object") {
    return cloneJsonObject(value as Record<string, unknown>);
  }

  return value;
}
