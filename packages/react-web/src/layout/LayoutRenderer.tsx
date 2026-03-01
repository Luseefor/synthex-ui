import type { CSSProperties, ReactNode } from "react";
import type { LayoutAction, LayoutNode, PanelNode } from "@synthex/core";
import { SplitView } from "./SplitView";
import { TabView } from "./TabView";

export interface LayoutRendererProps {
  readonly layout: LayoutNode;
  readonly onAction?: (action: LayoutAction) => void;
  readonly onSelectNode?: (nodeId: string) => void;
  readonly selectedNodeId?: string | null;
  readonly renderPanel?: (panel: PanelNode) => ReactNode;
}

const frameStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  width: "100%",
  height: "100%",
};

export function LayoutRenderer(props: LayoutRendererProps) {
  return (
    <div style={frameStyle}>
      <LayoutNodeView {...props} node={props.layout} />
    </div>
  );
}

interface LayoutNodeViewProps {
  readonly node: LayoutNode;
  readonly onAction?: (action: LayoutAction) => void;
  readonly onSelectNode?: (nodeId: string) => void;
  readonly selectedNodeId?: string | null;
  readonly renderPanel?: (panel: PanelNode) => ReactNode;
}

function LayoutNodeView({
  node,
  onAction,
  onSelectNode,
  selectedNodeId,
  renderPanel,
}: LayoutNodeViewProps) {
  if (node.type === "split") {
    return (
      <SplitView
        split={node}
        selectedNodeId={selectedNodeId}
        onResize={(sizes) =>
          onAction?.({
            type: "RESIZE_SPLIT",
            splitId: node.id,
            sizes,
          })
        }
      >
        {node.children.map((child) => (
          <LayoutNodeView
            key={child.id}
            node={child}
            onAction={onAction}
            onSelectNode={onSelectNode}
            selectedNodeId={selectedNodeId}
            renderPanel={renderPanel}
          />
        ))}
      </SplitView>
    );
  }

  if (node.type === "tabs") {
    return (
      <TabView
        tabs={node}
        selectedNodeId={selectedNodeId}
        renderPanel={renderPanel}
        onSelectNode={onSelectNode}
        onSetActivePanel={(panelId) =>
          onAction?.({
            type: "SET_ACTIVE_PANEL",
            tabsId: node.id,
            panelId,
          })
        }
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectNode?.(node.id)}
      style={createPanelFrameStyle(selectedNodeId === node.id)}
    >
      {renderPanel ? renderPanel(node) : node.title ?? node.panelType}
    </button>
  );
}

function createPanelFrameStyle(isSelected: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    width: "100%",
    height: "100%",
    minWidth: 0,
    minHeight: 0,
    padding: 0,
    border: isSelected ? "1px solid #2563eb" : "1px solid #d4d4d8",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
  };
}
