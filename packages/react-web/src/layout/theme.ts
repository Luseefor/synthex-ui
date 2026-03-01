export type WorkbenchSurfaceTone = "canvas" | "surface" | "surfaceMuted" | "surfaceRaised";

export interface WorkbenchTheme {
  readonly canvasBackground: string;
  readonly surfaceBackground: string;
  readonly surfaceMutedBackground: string;
  readonly surfaceRaisedBackground: string;
  readonly borderColor: string;
  readonly borderColorStrong: string;
  readonly selectedBorderColor: string;
  readonly textColor: string;
  readonly mutedTextColor: string;
  readonly tabRailBackground: string;
  readonly tabActiveBackground: string;
  readonly tabInactiveBackground: string;
  readonly tabActiveTextColor: string;
  readonly tabInactiveTextColor: string;
  readonly resizeHandleBackground: string;
  readonly resizeHandleColor: string;
  readonly resizeHandleHoverColor: string;
}

export interface LayoutRendererThemeProps {
  readonly theme?: Partial<WorkbenchTheme>;
}

export const defaultWorkbenchTheme: WorkbenchTheme = {
  canvasBackground: "var(--synthex-workbench-canvas, transparent)",
  surfaceBackground: "var(--synthex-workbench-surface, rgba(15, 23, 42, 0.02))",
  surfaceMutedBackground: "var(--synthex-workbench-surface-muted, rgba(15, 23, 42, 0.04))",
  surfaceRaisedBackground: "var(--synthex-workbench-surface-raised, rgba(15, 23, 42, 0.06))",
  borderColor: "var(--synthex-workbench-border, rgba(100, 116, 139, 0.22))",
  borderColorStrong: "var(--synthex-workbench-border-strong, rgba(100, 116, 139, 0.38))",
  selectedBorderColor: "var(--synthex-workbench-selected, #3b82f6)",
  textColor: "var(--synthex-workbench-foreground, currentColor)",
  mutedTextColor: "var(--synthex-workbench-foreground-muted, rgba(71, 85, 105, 0.92))",
  tabRailBackground: "var(--synthex-workbench-tab-rail, rgba(15, 23, 42, 0.05))",
  tabActiveBackground: "var(--synthex-workbench-tab-active, rgba(15, 23, 42, 0.08))",
  tabInactiveBackground: "var(--synthex-workbench-tab-inactive, transparent)",
  tabActiveTextColor: "var(--synthex-workbench-tab-active-foreground, currentColor)",
  tabInactiveTextColor: "var(--synthex-workbench-tab-inactive-foreground, rgba(71, 85, 105, 0.96))",
  resizeHandleBackground: "var(--synthex-workbench-handle-background, transparent)",
  resizeHandleColor: "var(--synthex-workbench-handle, rgba(100, 116, 139, 0.34))",
  resizeHandleHoverColor: "var(--synthex-workbench-handle-hover, rgba(59, 130, 246, 0.72))",
};

export function resolveWorkbenchTheme(theme?: Partial<WorkbenchTheme>): WorkbenchTheme {
  return {
    ...defaultWorkbenchTheme,
    ...theme,
  };
}

export function resolveWorkbenchSurface(
  theme: WorkbenchTheme,
  tone: WorkbenchSurfaceTone,
): string {
  switch (tone) {
    case "canvas":
      return theme.canvasBackground;
    case "surfaceMuted":
      return theme.surfaceMutedBackground;
    case "surfaceRaised":
      return theme.surfaceRaisedBackground;
    case "surface":
    default:
      return theme.surfaceBackground;
  }
}
