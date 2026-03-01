import type { CSSProperties, ReactNode } from "react";
import type { PanelNode, TabsNode } from "@synthex/core";
import { resolveWorkbenchSurface, resolveWorkbenchTheme, type LayoutRendererThemeProps } from "./theme";

export interface TabViewProps extends LayoutRendererThemeProps {
  readonly tabs: TabsNode;
  readonly selectedNodeId?: string | null;
  readonly onSelectNode?: (nodeId: string) => void;
  readonly onSetActivePanel?: (panelId: string) => void;
  readonly renderPanel?: (panel: PanelNode) => ReactNode;
  readonly renderTabLabel?: (panel: PanelNode) => ReactNode;
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
  renderTabLabel,
  theme: themeOverrides,
}: TabViewProps) {
  const theme = resolveWorkbenchTheme(themeOverrides);
  const activePanel =
    tabs.children.find((panel) => panel.id === tabs.activePanelId) ?? tabs.children[0];

  return (
    <div
      data-tabs-id={tabs.id}
      style={{
        ...containerStyle,
        border: `1px solid ${
          selectedNodeId === tabs.id ? theme.selectedBorderColor : theme.borderColor
        }`,
        background: resolveWorkbenchSurface(theme, "surface"),
        color: theme.textColor,
      }}
      onClick={() => onSelectNode?.(tabs.id)}
    >
      <div
        style={{
          display: "flex",
          gap: "2px",
          padding: "8px",
          borderBottom: `1px solid ${theme.borderColor}`,
          background: theme.tabRailBackground,
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
                border: `1px solid ${isActive ? theme.borderColorStrong : "transparent"}`,
                background: isActive ? theme.tabActiveBackground : theme.tabInactiveBackground,
                color: isActive ? theme.tabActiveTextColor : theme.tabInactiveTextColor,
                borderRadius: "8px",
                padding: "7px 12px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                cursor: "pointer",
              }}
            >
              {renderTabLabel ? renderTabLabel(panel) : panel.title ?? panel.panelType}
            </button>
          );
        })}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          background: resolveWorkbenchSurface(theme, "surface"),
        }}
      >
        {activePanel
          ? renderPanel?.(activePanel) ?? activePanel.title ?? activePanel.panelType
          : null}
      </div>
    </div>
  );
}
