import type { CSSProperties, ReactNode } from "react";
import type { LayoutAction, LayoutNode, PanelNode } from "@luseefor/synthex-core";
import { SplitView } from "./SplitView";
import { TabView } from "./TabView";
import {
  resolveWorkbenchSurface,
  resolveWorkbenchTheme,
  type LayoutRendererThemeProps,
} from "./theme";

export interface LayoutRendererProps extends LayoutRendererThemeProps {
  readonly layout: LayoutNode;
  readonly onAction?: (action: LayoutAction) => void;
  readonly onSelectNode?: (nodeId: string) => void;
  readonly selectedNodeId?: string | null;
  readonly renderPanel?: (panel: PanelNode) => ReactNode;
  readonly renderTabLabel?: (panel: PanelNode) => ReactNode;
}

const frameStyle: CSSProperties = {
  display: "flex",
  minWidth: 0,
  minHeight: 0,
  width: "100%",
  height: "100%",
};

export function LayoutRenderer(props: LayoutRendererProps) {
  const theme = resolveWorkbenchTheme(props.theme);

  return (
    <div
      data-synthex-layout-root="true"
      style={{
        ...frameStyle,
        background: resolveWorkbenchSurface(theme, "canvas"),
        color: theme.textColor,
      }}
    >
      <LayoutNodeView
        {...props}
        node={props.layout}
        theme={theme}
      />
    </div>
  );
}

interface LayoutNodeViewProps {
  readonly node: LayoutNode;
  readonly onAction?: (action: LayoutAction) => void;
  readonly onSelectNode?: (nodeId: string) => void;
  readonly selectedNodeId?: string | null;
  readonly renderPanel?: (panel: PanelNode) => ReactNode;
  readonly renderTabLabel?: (panel: PanelNode) => ReactNode;
  readonly theme: ReturnType<typeof resolveWorkbenchTheme>;
}

function LayoutNodeView({
  node,
  onAction,
  onSelectNode,
  selectedNodeId,
  renderPanel,
  renderTabLabel,
  theme,
}: LayoutNodeViewProps) {
  if (node.type === "split") {
    return (
      <SplitView
        split={node}
        selectedNodeId={selectedNodeId}
        theme={theme}
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
            renderTabLabel={renderTabLabel}
            theme={theme}
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
        theme={theme}
        renderPanel={renderPanel}
        renderTabLabel={renderTabLabel}
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
      style={createPanelFrameStyle(selectedNodeId === node.id, theme)}
    >
      {renderPanel ? renderPanel(node) : node.title ?? node.panelType}
    </button>
  );
}

function createPanelFrameStyle(
  isSelected: boolean,
  theme: ReturnType<typeof resolveWorkbenchTheme>,
): CSSProperties {
  return {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    width: "100%",
    height: "100%",
    minWidth: 0,
    minHeight: 0,
    padding: 0,
    border: `1px solid ${isSelected ? theme.selectedBorderColor : theme.borderColor}`,
    background: resolveWorkbenchSurface(theme, "surface"),
    color: theme.textColor,
    textAlign: "left",
    cursor: "pointer",
  };
}
