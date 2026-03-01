import type { CSSProperties, ReactNode } from "react";
import type { PanelNode, TabsNode } from "@synthex/core";

export interface TabViewProps {
  readonly tabs: TabsNode;
  readonly selectedNodeId?: string | null;
  readonly onSelectNode?: (nodeId: string) => void;
  readonly onSetActivePanel?: (panelId: string) => void;
  readonly renderPanel?: (panel: PanelNode) => ReactNode;
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: 0,
  width: "100%",
  height: "100%",
  border: "1px solid #d4d4d8",
  background: "#fafafa",
};

export function TabView({
  tabs,
  selectedNodeId,
  onSelectNode,
  onSetActivePanel,
  renderPanel,
}: TabViewProps) {
  const activePanel =
    tabs.children.find((panel) => panel.id === tabs.activePanelId) ?? tabs.children[0];

  return (
    <div
      style={{
        ...containerStyle,
        borderColor: selectedNodeId === tabs.id ? "#2563eb" : containerStyle.borderColor,
      }}
      onClick={() => onSelectNode?.(tabs.id)}
    >
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "6px",
          borderBottom: "1px solid #e4e4e7",
          background: "#f4f4f5",
        }}
      >
        {tabs.children.map((panel) => {
          const isActive = panel.id === activePanel?.id;

          return (
            <button
              key={panel.id}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelectNode?.(panel.id);
                onSetActivePanel?.(panel.id);
              }}
              style={{
                border: `1px solid ${isActive ? "#2563eb" : "#d4d4d8"}`,
                background: isActive ? "#dbeafe" : "#ffffff",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {panel.title ?? panel.panelType}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex" }}>
        {activePanel
          ? renderPanel?.(activePanel) ?? activePanel.title ?? activePanel.panelType
          : null}
      </div>
    </div>
  );
}
