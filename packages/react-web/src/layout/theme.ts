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

/**
 * Default workbench theme tokens.
 *
 * Each property cascades through three layers:
 *   1. `--synthex-workbench-*` (consumer override)
 *   2. `--sx-*` (inherited from SynthexTheme / ThemeProvider)
 *   3. hardcoded fallback
 *
 * This ensures the workbench automatically inherits the active theme
 * while remaining fully overridable for custom integrations.
 */
export const defaultWorkbenchTheme: WorkbenchTheme = {
  canvasBackground:
    "var(--synthex-workbench-canvas, var(--sx-color-background, transparent))",
  surfaceBackground:
    "var(--synthex-workbench-surface, var(--sx-color-surface, #ffffff))",
  surfaceMutedBackground:
    "var(--synthex-workbench-surface-muted, var(--sx-color-surface-muted, #f8fafc))",
  surfaceRaisedBackground:
    "var(--synthex-workbench-surface-raised, var(--sx-color-surface-raised, #fcfdff))",
  borderColor:
    "var(--synthex-workbench-border, var(--sx-color-border, rgba(100, 116, 139, 0.22)))",
  borderColorStrong:
    "var(--synthex-workbench-border-strong, var(--sx-color-border-strong, rgba(100, 116, 139, 0.38)))",
  selectedBorderColor:
    "var(--synthex-workbench-selected, var(--sx-color-primary, #3b82f6))",
  textColor:
    "var(--synthex-workbench-foreground, var(--sx-color-foreground, currentColor))",
  mutedTextColor:
    "var(--synthex-workbench-foreground-muted, var(--sx-color-foreground-muted, rgba(71, 85, 105, 0.92)))",
  tabRailBackground:
    "var(--synthex-workbench-tab-rail, var(--sx-color-background-subtle, rgba(15, 23, 42, 0.05)))",
  tabActiveBackground:
    "var(--synthex-workbench-tab-active, var(--sx-color-surface, rgba(15, 23, 42, 0.08)))",
  tabInactiveBackground:
    "var(--synthex-workbench-tab-inactive, transparent)",
  tabActiveTextColor:
    "var(--synthex-workbench-tab-active-foreground, var(--sx-color-foreground, currentColor))",
  tabInactiveTextColor:
    "var(--synthex-workbench-tab-inactive-foreground, var(--sx-color-foreground-muted, rgba(71, 85, 105, 0.96)))",
  resizeHandleBackground:
    "var(--synthex-workbench-handle-background, transparent)",
  resizeHandleColor:
    "var(--synthex-workbench-handle, var(--sx-color-border-strong, rgba(100, 116, 139, 0.34)))",
  resizeHandleHoverColor:
    "var(--synthex-workbench-handle-hover, var(--sx-color-primary, rgba(59, 130, 246, 0.72)))",
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
