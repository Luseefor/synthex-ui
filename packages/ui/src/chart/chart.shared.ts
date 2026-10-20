/**
 * Chart primitives use recharts on web and hand-rolled react-native-svg on
 * native, sharing a single data model (`ChartSeries`).
 *
 * shadcn chart-compat layer (recharts):
 * API names match shadcn (`ChartConfig`, `ChartStyle`,
 * `ChartContainer config`, `ChartTooltipContent indicator/labelKey`,
 * `ChartLegendContent`). `config` maps series keys to `{ label, color }`;
 * on web colors become `--color-<key>` CSS vars via `ChartStyle` /
 * `ChartContainer style`. On native `config` is accepted for type parity.
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
  readonly config?: ChartConfig;
}

export interface ChartContainerSharedProps {
  readonly children: ReactNode;
  readonly config?: ChartConfig;
}

export interface ChartLegendSharedProps {
  readonly series?: readonly ChartSeries[];
  readonly payload?: readonly { readonly value?: unknown; readonly color?: string; readonly dataKey?: unknown }[];
  readonly config?: ChartConfig;
}

export interface ChartTooltipItem {
  readonly label: string;
  readonly value: string | number;
  readonly color?: string;
  readonly dataKey?: string;
}

export interface ChartTooltipContentSharedProps {
  readonly label?: string;
  readonly items?: readonly ChartTooltipItem[];
  readonly indicator?: ChartTooltipIndicator;
  readonly labelKey?: string;
  readonly config?: ChartConfig;
  readonly active?: boolean;
  readonly payload?: readonly {
    readonly name?: unknown;
    readonly value?: unknown;
    readonly color?: string;
    readonly dataKey?: unknown;
  }[];
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

export function transformSeriesToRechartsData(series: readonly ChartSeries[]): readonly Record<string, string | number>[] {
  const labels = series[0]?.data.map((entry) => entry.label) ?? [];
  return labels.map((label, labelIndex) => {
    const row: Record<string, string | number> = { label };
    for (const entry of series) {
      row[entry.key] = entry.data[labelIndex]?.value ?? 0;
    }
    return row;
  });
}

export function resolveSeriesColor(
  seriesKey: string,
  seriesColor: string | undefined,
  index: number,
  config?: ChartConfig,
  fallbacks: readonly string[] = ["var(--sx-color-primary)", "var(--sx-color-accent)", "#0f766e", "#933eae"],
): string {
  if (seriesColor) return seriesColor;
  const configured = config?.[seriesKey]?.color;
  if (typeof configured === "string" && configured.length > 0) return `var(--color-${seriesKey}, ${configured})`;
  return fallbacks[index % fallbacks.length]!;
}
