import * as React from "react";
import { View, Text, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Line, Path, Rect, Text as SvgText, Polyline } from "react-native-svg";
import { useTheme } from "../_shared/theme/context";
import { resolveChartTooltipLabel } from "./chart.shared";
import type {
  BaseChartSharedProps,
  ChartContainerSharedProps,
  ChartLegendSharedProps,
  ChartSeries,
  ChartTooltipContentSharedProps,
} from "./chart.shared";

const DEFAULT_SERIES_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#d97706"];
const SVG_WIDTH = 640;

export interface ChartContainerProps extends ChartContainerSharedProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}
export interface ChartLegendProps extends ChartLegendSharedProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}
export interface ChartTooltipProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}
export interface ChartTooltipContentProps extends ChartTooltipContentSharedProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}
export interface LineChartProps extends BaseChartSharedProps {
  readonly testID?: string;
}
export interface AreaChartProps extends BaseChartSharedProps {
  readonly testID?: string;
}
export interface BarChartProps extends BaseChartSharedProps {
  readonly testID?: string;
}

export function ChartStyle(_props?: { readonly id?: string; readonly config?: unknown }): null {
  // Native has no CSS cascade, so config colors cannot become CSS vars.
  // Accepted for shadcn API parity; native series resolve color from the
  // `series` prop / theme directly.
  return null;
}

export function ChartContainer({ children, config: _config, style, testID }: ChartContainerProps) {
  // `config` is accepted for shadcn API parity but ignored on native:
  // there are no CSS custom properties, so colors come from `series[].color`
  // with theme fallbacks instead of `--color-<key>` vars.
  void _config;
  const theme = useTheme();

  return <View testID={testID ?? "chart"} style={[getStyles(theme).container, style]}>{children}</View>;
}

export function ChartLegend({ series, payload, config: _config, style, testID }: ChartLegendProps) {
  void _config;
  const theme = useTheme();
  const entries =
    series && series.length > 0
      ? series.map((entry, index) => ({ key: entry.key, label: entry.label, color: resolveSeriesColor(entry, index) }))
      : (payload ?? []).map((entry, index) => ({
          key: String(entry.dataKey ?? entry.value ?? index),
          label: String(entry.value ?? entry.dataKey ?? ""),
          color: entry.color ?? DEFAULT_SERIES_COLORS[index % DEFAULT_SERIES_COLORS.length]!,
        }));

  return (
    <View testID={testID ?? "chart-legend"} style={[getStyles(theme).legendRow, style]}>
      {entries.map((entry) => (
        <View key={entry.key} style={getStyles(theme).legendItem}>
          <View
            style={[
              getStyles(theme).legendSwatch,
              { backgroundColor: entry.color },
            ]}
          />
          <Text style={getStyles(theme).legendLabel}>{entry.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function ChartLegendContent({ series, payload, config, style, testID }: ChartLegendProps) {
  // `series` is a Synthex convenience (shadcn uses payload/config); kept with docs, resolved via ChartLegend.
  return <ChartLegend series={series} payload={payload} config={config} style={style} testID={testID ?? "chart-legend-content"} />;
}

export function ChartTooltip({ children, style, testID }: ChartTooltipProps) {
  const theme = useTheme();

  return <View testID={testID ?? "chart-tooltip-wrapper"} style={[getStyles(theme).tooltip, style]}>{children}</View>;
}

export function ChartTooltipContent({
  config,
  indicator: _indicator = "dot",
  items,
  label,
  labelKey,
  payload,
  style,
  testID,
}: ChartTooltipContentProps) {
  const theme = useTheme();
  // `indicator` only changes the web swatch shape; native keeps a single
  // dot swatch. Accepted for API parity. `labelKey` resolves via `config`
  // when `label` is absent, matching the web fallback.
  void _indicator;
  const resolvedLabel = resolveChartTooltipLabel(
    label ?? (payload?.[0]?.name as string | undefined),
    labelKey,
    config,
  );
  const resolvedItems =
    items ??
    (payload ?? []).map((entry) => ({
      label: String(entry.name ?? entry.dataKey ?? ""),
      value: (entry.value as string | number | undefined) ?? "",
      color: entry.color,
    }));

  // testID mirrors web `data-slot="chart-tooltip-content"`.
  return (
    <View testID={testID ?? "chart-tooltip-content"} style={[getStyles(theme).tooltipContent, style]}>
      {resolvedLabel ? <Text style={getStyles(theme).tooltipLabel}>{resolvedLabel}</Text> : null}
      {resolvedItems.map((item) => (
        <View key={`${item.label}-${item.value}`} style={getStyles(theme).tooltipRow}>
          <View style={getStyles(theme).tooltipLabelRow}>
            <View
              style={[
                getStyles(theme).legendSwatch,
                { backgroundColor: item.color ?? theme.colors.primary },
              ]}
            />
            <Text style={getStyles(theme).legendLabel}>{item.label}</Text>
          </View>
          <Text style={getStyles(theme).tooltipValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function LineChart({ ariaLabel, height = 240, series, testID }: LineChartProps) {
  // `series` is a Synthex convenience (shadcn composes Container/Legend/Tooltip); kept with docs.
  const theme = useTheme();
  const points = getSeriesPoints(series, height);

  return (
    <View testID={testID ?? "chart-frame"} accessibilityLabel={ariaLabel ?? "Line chart"} accessible>
      <Svg height={height} viewBox={`0 0 ${SVG_WIDTH} ${height}`} width="100%">
        <ChartGrid height={height} stroke={theme.colors.border} />
        {points.map((entry, index) => (
          <React.Fragment key={entry.key}>
            <Polyline
              fill="none"
              points={entry.points.map((point) => `${point.x},${point.y}`).join(" ")}
              stroke={resolveSeriesColor(series[index]!, index)}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
            />
            {entry.points.map((point) => (
              <Circle
                key={`${entry.key}-${point.label}`}
                cx={point.x}
                cy={point.y}
                fill={resolveSeriesColor(series[index]!, index)}
                r={4}
              />
            ))}
          </React.Fragment>
        ))}
        <ChartAxisLabels color={theme.colors.foregroundMuted} height={height} series={series} />
      </Svg>
    </View>
  );
}

export function AreaChart({ ariaLabel, height = 240, series, testID }: AreaChartProps) {
  const theme = useTheme();
  const points = getSeriesPoints(series, height);
  const baseline = height - 28;

  return (
    <View testID={testID ?? "chart-frame"} accessibilityLabel={ariaLabel ?? "Area chart"} accessible>
      <Svg height={height} viewBox={`0 0 ${SVG_WIDTH} ${height}`} width="100%">
        <ChartGrid height={height} stroke={theme.colors.border} />
        {points.map((entry, index) => {
          const color = resolveSeriesColor(series[index]!, index);
          const areaPath = [
            `M ${entry.points[0]?.x ?? 0} ${baseline}`,
            ...entry.points.map((point) => `L ${point.x} ${point.y}`),
            `L ${entry.points.at(-1)?.x ?? 0} ${baseline}`,
            "Z",
          ].join(" ");

          return (
            <React.Fragment key={entry.key}>
              <Path d={areaPath} fill={color} fillOpacity={0.18} />
              <Polyline
                fill="none"
                points={entry.points.map((point) => `${point.x},${point.y}`).join(" ")}
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
              />
            </React.Fragment>
          );
        })}
        <ChartAxisLabels color={theme.colors.foregroundMuted} height={height} series={series} />
      </Svg>
    </View>
  );
}

export function BarChart({ ariaLabel, height = 240, series, testID }: BarChartProps) {
  const theme = useTheme();
  const points = getSeriesPoints(series, height);
  const labels = series[0]?.data.map((entry) => entry.label) ?? [];
  const plotWidth = SVG_WIDTH - 64;
  const step = labels.length > 0 ? plotWidth / labels.length : plotWidth;
  const barGroupWidth = step * 0.62;
  const barWidth = series.length > 0 ? barGroupWidth / series.length : barGroupWidth;
  const baseline = height - 28;

  return (
    <View testID={testID ?? "chart-frame"} accessibilityLabel={ariaLabel ?? "Bar chart"} accessible>
      <Svg height={height} viewBox={`0 0 ${SVG_WIDTH} ${height}`} width="100%">
        <ChartGrid height={height} stroke={theme.colors.border} />
        {points.map((entry, seriesIndex) =>
          entry.points.map((point, pointIndex) => (
            <Rect
              key={`${entry.key}-${point.label}`}
              fill={resolveSeriesColor(series[seriesIndex]!, seriesIndex)}
              height={Math.max(baseline - point.y, 8)}
              rx={8}
              width={Math.max(barWidth - 6, 10)}
              x={48 + pointIndex * step + seriesIndex * barWidth}
              y={point.y}
            />
          )),
        )}
        <ChartAxisLabels color={theme.colors.foregroundMuted} height={height} series={series} />
      </Svg>
    </View>
  );
}

function ChartGrid({ height, stroke }: { height: number; stroke: string }) {
  const rows = 4;

  return (
    <>
      {Array.from({ length: rows }).map((_, index) => {
        const y = 20 + index * ((height - 48) / (rows - 1));

        return (
          <Line
            key={y}
            stroke={stroke}
            strokeDasharray="4 6"
            strokeWidth={1}
            x1={40}
            x2={SVG_WIDTH - 16}
            y1={y}
            y2={y}
          />
        );
      })}
    </>
  );
}

function ChartAxisLabels({
  color,
  height,
  series,
}: {
  color: string;
  height: number;
  series: readonly ChartSeries[];
}) {
  const labels = series[0]?.data.map((entry) => entry.label) ?? [];
  const plotWidth = SVG_WIDTH - 64;
  const step = labels.length > 1 ? plotWidth / (labels.length - 1) : plotWidth;

  return (
    <>
      {labels.map((label, index) => (
        <SvgText
          fill={color}
          fontSize="12"
          key={label}
          textAnchor="middle"
          x={40 + index * step}
          y={height - 6}
        >
          {label}
        </SvgText>
      ))}
    </>
  );
}

function getSeriesPoints(series: readonly ChartSeries[], height: number) {
  const values = series.flatMap((entry) => entry.data.map((datum) => datum.value));
  const maxValue = values.length > 0 ? Math.max(...values) : 1;
  const labels = series[0]?.data.map((entry) => entry.label) ?? [];
  const plotWidth = SVG_WIDTH - 64;
  const step = labels.length > 1 ? plotWidth / (labels.length - 1) : plotWidth;
  const baseline = height - 28;
  const minY = 20;
  const plotHeight = baseline - minY;

  return series.map((entry) => ({
    key: entry.key,
    points: entry.data.map((datum, index) => ({
      label: datum.label,
      x: 40 + index * step,
      y: baseline - (datum.value / maxValue) * plotHeight,
    })),
  }));
}

function resolveSeriesColor(series: ChartSeries, index: number) {
  return series.color ?? DEFAULT_SERIES_COLORS[index % DEFAULT_SERIES_COLORS.length]!;
}

function getStyles(theme: ReturnType<typeof useTheme>) {
  return {
  container: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg + 2,
    borderWidth: 1,
    padding: theme.space.md,
  },
  legendRow: {
    columnGap: theme.space.md,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: theme.space.sm,
  },
  legendItem: {
    alignItems: "center",
    columnGap: theme.space.xs,
    flexDirection: "row",
  },
  legendSwatch: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  legendLabel: {
    color: theme.colors.foregroundMuted,
    fontSize: theme.typography.size.sm,
  },
  tooltip: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.space.sm,
  },
  tooltipContent: {
    rowGap: theme.space.xs,
  },
  tooltipLabel: {
    color: theme.colors.foregroundMuted,
    fontSize: theme.typography.size.xs,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tooltipLabelRow: {
    alignItems: "center",
    columnGap: theme.space.xs,
    flexDirection: "row",
  },
  tooltipRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tooltipValue: {
    color: theme.colors.foreground,
    fontSize: theme.typography.size.sm,
    fontWeight: "600",
  },
  } as const;
}
