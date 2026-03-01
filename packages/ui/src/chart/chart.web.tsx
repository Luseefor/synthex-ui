import * as React from "react";
import { cn } from "../_shared/variants";
import type {
  BaseChartSharedProps,
  ChartContainerSharedProps,
  ChartLegendSharedProps,
  ChartSeries,
  ChartTooltipContentSharedProps,
} from "./chart.shared";

const DEFAULT_SERIES_COLORS = [
  "var(--sx-color-primary)",
  "var(--sx-color-accent)",
  "#0f766e",
  "#9333ea",
];

const SVG_WIDTH = 640;

export interface ChartContainerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    ChartContainerSharedProps {}

export interface ChartLegendProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ChartLegendSharedProps {}

export interface ChartTooltipProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ChartTooltipContentSharedProps {}

export interface LineChartProps extends BaseChartSharedProps {}
export interface AreaChartProps extends BaseChartSharedProps {}
export interface BarChartProps extends BaseChartSharedProps {}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

ChartContainer.displayName = "ChartContainer";

export const ChartLegend = React.forwardRef<HTMLDivElement, ChartLegendProps>(
  ({ className, series, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-wrap gap-3", className)} {...props}>
      {series.map((entry, index) => (
        <div key={entry.key} className="flex items-center gap-2 text-sm text-[color:var(--sx-color-foreground-muted)]">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: resolveSeriesColor(entry, index) }}
          />
          <span>{entry.label}</span>
        </div>
      ))}
    </div>
  ),
);

ChartLegend.displayName = "ChartLegend";

export const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]",
        className,
      )}
      {...props}
    />
  ),
);

ChartTooltip.displayName = "ChartTooltip";

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ className, items, label, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
      {label ? (
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--sx-color-foreground-muted)]">
          {label}
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-[color:var(--sx-color-foreground-muted)]">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color ?? "var(--sx-color-primary)" }}
              />
              <span>{item.label}</span>
            </div>
            <span className="font-medium text-[color:var(--sx-color-foreground)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  ),
);

ChartTooltipContent.displayName = "ChartTooltipContent";

export function LineChart({ ariaLabel = "Line chart", height = 240, series }: LineChartProps) {
  const points = getSeriesPoints(series, height);

  return (
    <svg
      aria-label={ariaLabel}
      className="w-full overflow-visible"
      role="img"
      viewBox={`0 0 ${SVG_WIDTH} ${height}`}
    >
      <ChartGrid height={height} />
      {points.map((entry, index) => (
        <g key={entry.key}>
          <polyline
            fill="none"
            points={entry.points.map((point) => `${point.x},${point.y}`).join(" ")}
            stroke={resolveSeriesColor(series[index]!, index)}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          {entry.points.map((point) => (
            <circle
              key={`${entry.key}-${point.label}`}
              cx={point.x}
              cy={point.y}
              fill={resolveSeriesColor(series[index]!, index)}
              r="4"
            />
          ))}
        </g>
      ))}
      <ChartAxisLabels series={series} height={height} />
    </svg>
  );
}

export function AreaChart({ ariaLabel = "Area chart", height = 240, series }: AreaChartProps) {
  const points = getSeriesPoints(series, height);
  const baseline = height - 28;

  return (
    <svg
      aria-label={ariaLabel}
      className="w-full overflow-visible"
      role="img"
      viewBox={`0 0 ${SVG_WIDTH} ${height}`}
    >
      <ChartGrid height={height} />
      {points.map((entry, index) => {
        const color = resolveSeriesColor(series[index]!, index);
        const areaPath = [
          `M ${entry.points[0]?.x ?? 0} ${baseline}`,
          ...entry.points.map((point) => `L ${point.x} ${point.y}`),
          `L ${entry.points.at(-1)?.x ?? 0} ${baseline}`,
          "Z",
        ].join(" ");

        return (
          <g key={entry.key}>
            <path d={areaPath} fill={color} fillOpacity="0.18" stroke="none" />
            <polyline
              fill="none"
              points={entry.points.map((point) => `${point.x},${point.y}`).join(" ")}
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
          </g>
        );
      })}
      <ChartAxisLabels series={series} height={height} />
    </svg>
  );
}

export function BarChart({ ariaLabel = "Bar chart", height = 240, series }: BarChartProps) {
  const points = getSeriesPoints(series, height);
  const labels = series[0]?.data.map((entry) => entry.label) ?? [];
  const plotWidth = SVG_WIDTH - 64;
  const step = labels.length > 0 ? plotWidth / labels.length : plotWidth;
  const barGroupWidth = step * 0.62;
  const barWidth = series.length > 0 ? barGroupWidth / series.length : barGroupWidth;
  const baseline = height - 28;

  return (
    <svg
      aria-label={ariaLabel}
      className="w-full overflow-visible"
      role="img"
      viewBox={`0 0 ${SVG_WIDTH} ${height}`}
    >
      <ChartGrid height={height} />
      {points.map((entry, seriesIndex) =>
        entry.points.map((point, pointIndex) => (
          <rect
            key={`${entry.key}-${point.label}`}
            fill={resolveSeriesColor(series[seriesIndex]!, seriesIndex)}
            height={Math.max(baseline - point.y, 8)}
            rx="8"
            width={Math.max(barWidth - 6, 10)}
            x={48 + pointIndex * step + seriesIndex * barWidth}
            y={point.y}
          />
        )),
      )}
      <ChartAxisLabels series={series} height={height} />
    </svg>
  );
}

function ChartGrid({ height }: { height: number }) {
  const rows = 4;

  return (
    <g>
      {Array.from({ length: rows }).map((_, index) => {
        const y = 20 + index * ((height - 48) / (rows - 1));
        return (
          <line
            key={y}
            stroke="var(--sx-color-border)"
            strokeDasharray="4 6"
            strokeWidth="1"
            x1="40"
            x2={SVG_WIDTH - 16}
            y1={y}
            y2={y}
          />
        );
      })}
    </g>
  );
}

function ChartAxisLabels({
  height,
  series,
}: {
  height: number;
  series: readonly ChartSeries[];
}) {
  const labels = series[0]?.data.map((entry) => entry.label) ?? [];
  const plotWidth = SVG_WIDTH - 64;
  const step = labels.length > 1 ? plotWidth / (labels.length - 1) : plotWidth;

  return (
    <g>
      {labels.map((label, index) => (
        <text
          key={label}
          fill="var(--sx-color-foreground-muted)"
          fontFamily="var(--sx-font-family-sans)"
          fontSize="12"
          textAnchor="middle"
          x={40 + index * step}
          y={height - 6}
        >
          {label}
        </text>
      ))}
    </g>
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
