/**
 * Chart primitives use hand-rolled SVG (inline <svg> on web, react-native-svg
 * on native). No recharts dependency is intentional: it keeps the bundle
 * small and works cross-platform with a single shared data model.
 *
 * shadcn chart-compat layer (no recharts):
 * Only API names match shadcn (`ChartConfig`, `ChartStyle`,
 * `ChartContainer config`, `ChartTooltipContent indicator/labelKey`,
 * `ChartLegendContent`). Rendering stays hand-rolled. `config` maps series
 * keys to `{ label, color }`; on web colors become `--color-<key>` CSS vars
 * via `ChartStyle` / `ChartContainer style`. On native `config` is
 * accepted for type parity and ignored (theme colors are used directly).
 */
import type { ReactNode } from "react";

export interface ChartDatum {
  readonly label: string;
  readonly value: number;
}

export interface ChartSeries {
  readonly key: string;
  readonly label: string;
  readonly color?: string;
  readonly data: readonly ChartDatum[];
}

export interface ChartConfigEntry {
  readonly label?: ReactNode;
  readonly color?: string;
}

export type ChartConfig = Record<string, ChartConfigEntry>;

export type ChartTooltipIndicator = "dot" | "line" | "dashed";

export interface BaseChartSharedProps {
  readonly series: readonly ChartSeries[];
  readonly height?: number;
  readonly ariaLabel?: string;
}

export interface ChartContainerSharedProps {
  readonly children: ReactNode;
  readonly config?: ChartConfig;
}

export interface ChartLegendSharedProps {
  readonly series: readonly ChartSeries[];
}

export interface ChartTooltipItem {
  readonly label: string;
  readonly value: string | number;
  readonly color?: string;
}

export interface ChartTooltipContentSharedProps {
  readonly label?: string;
  readonly items: readonly ChartTooltipItem[];
  readonly indicator?: ChartTooltipIndicator;
  readonly labelKey?: string;
  readonly config?: ChartConfig;
}

export function getChartConfigStyle(config?: ChartConfig): Record<string, string> {
  if (!config) return {};
  const style: Record<string, string> = {};
  for (const [key, entry] of Object.entries(config)) {
    if (entry?.color) style[`--color-${key}`] = entry.color;
  }
  return style;
}

export function getChartStyleCss(chartId: string, config: ChartConfig): string {
  const declarations = Object.entries(config)
    .filter(([, entry]) => entry?.color)
    .map(([key, entry]) => `  --color-${key}: ${entry.color};`)
    .join("\n");
  return `[data-chart="${chartId}"] {\n${declarations}\n}`;
}

export function resolveChartTooltipLabel(
  label: string | undefined,
  labelKey: string | undefined,
  config: ChartConfig | undefined,
): string | undefined {
  if (label !== undefined) return label;
  if (labelKey !== undefined) {
    const configured = config?.[labelKey]?.label;
    if (typeof configured === "string") return configured;
    return labelKey;
  }
  return undefined;
}
