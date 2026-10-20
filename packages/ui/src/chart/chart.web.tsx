import * as React from "react";
import {
  Area as RechartsArea,
  AreaChart as RechartsAreaChart,
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "../_shared/variants";
import { useReducedMotion } from "../hooks/useReducedMotion.web";
import {
  getChartConfigStyle,
  getChartStyleCss,
  resolveChartTooltipLabel,
  resolveSeriesColor,
  transformSeriesToRechartsData,
  type BaseChartSharedProps,
  type ChartConfig,
  type ChartContainerSharedProps,
  type ChartLegendSharedProps,
  type ChartSeries,
  type ChartTooltipContentSharedProps,
} from "./chart.shared";

const DEFAULT_WIDTH = 640;

export interface ChartStyleProps {
  readonly id: string;
  readonly config: ChartConfig;
}

export const ChartStyle = ({ config, id }: ChartStyleProps) => (
  <style data-chart-style={id} dangerouslySetInnerHTML={{ __html: getChartStyleCss(id, config) }} />
);

export interface ChartContainerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    ChartContainerSharedProps {}

export interface ChartLegendProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ChartLegendSharedProps {}

export interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ChartTooltipContentSharedProps {}

export interface LineChartProps extends BaseChartSharedProps {}
export interface AreaChartProps extends BaseChartSharedProps {}
export interface BarChartProps extends BaseChartSharedProps {}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ children, className, config, id, style, ...props }, ref) => (
    <div
      ref={ref}
      data-chart={id ?? "chart"}
      data-slot="chart"
      className={cn(
        "rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] [&_.recharts-cartesian-axis-tick_text]:fill-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      id={id}
      style={{ ...getChartConfigStyle(config), ...style } as React.CSSProperties}
      {...props}
    >
      {config && id ? <ChartStyle id={id} config={config} /> : null}
      {children}
    </div>
  ),
);

ChartContainer.displayName = "ChartContainer";

function LegendSwatch({ color }: { readonly color: string }) {
  return (
    <span
      aria-hidden="true"
      className="h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function renderLegendEntries(
  series: readonly ChartSeries[] | undefined,
  payload: ChartLegendSharedProps["payload"],
  config?: ChartConfig,
) {
  if (series && series.length > 0) {
    return series.map((entry, index) => (
      <div key={entry.key} className="flex items-center gap-2 text-sm text-[color:var(--sx-color-foreground-muted)]">
        <LegendSwatch color={resolveSeriesColor(entry.key, entry.color, index, config)} />
        <span>{entry.label}</span>
      </div>
    ));
  }
  if (payload && payload.length > 0) {
    return payload.map((entry, index) => {
      const key = String(entry.dataKey ?? entry.value ?? index);
      const label =
        typeof entry.value === "string"
          ? entry.value
          : (config?.[key]?.label as string | undefined) ?? key;
      const color =
        entry.color ?? resolveSeriesColor(key, undefined, index, config);
      return (
        <div key={key} className="flex items-center gap-2 text-sm text-[color:var(--sx-color-foreground-muted)]">
          <LegendSwatch color={color} />
          <span>{label}</span>
        </div>
      );
    });
  }
  return null;
}

export const ChartLegend = React.forwardRef<HTMLDivElement, ChartLegendProps>(
  ({ className, series, payload, config, ...props }, ref) => (
    <div ref={ref} data-slot="chart-legend" className={cn("flex flex-wrap gap-3", className)} {...props}>
      {renderLegendEntries(series, payload, config)}
    </div>
  ),
);

ChartLegend.displayName = "ChartLegend";

export const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendProps>(
  ({ className, series, payload, config, ...props }, ref) => (
    <div ref={ref} data-slot="chart-legend-content" className={cn("flex flex-wrap gap-3", className)} {...props}>
      {renderLegendEntries(series, payload, config)}
    </div>
  ),
);

ChartLegendContent.displayName = "ChartLegendContent";

export const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="chart-tooltip-wrapper"
      className={cn(
        "rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]",
        className,
      )}
      {...props}
    />
  ),
);

ChartTooltip.displayName = "ChartTooltip";

function ChartTooltipIndicatorDot({
  color,
  indicator,
}: {
  color: string | undefined;
  indicator: "dot" | "line" | "dashed";
}) {
  const backgroundColor = color ?? "var(--sx-color-primary)";
  if (indicator === "line") {
    return (
      <span
        aria-hidden="true"
        data-indicator="line"
        className="h-[2px] w-3.5 rounded-full"
        style={{ backgroundColor }}
      />
    );
  }
  if (indicator === "dashed") {
    return (
      <span
        aria-hidden="true"
        data-indicator="dashed"
        className="h-0 w-3.5 border-t-2 border-dashed"
        style={{ borderColor: backgroundColor }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      data-indicator="dot"
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor }}
    />
  );
}

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    {
      className,
      config,
      indicator = "dot",
      items,
      label,
      labelKey,
      payload,
      ...props
    },
    ref,
  ) => {
    const resolvedLabel = resolveChartTooltipLabel(
      (label as string | undefined) ?? (payload?.[0]?.name as string | undefined) ?? (props as { readonly label?: string }).label,
      labelKey,
      config,
    );

    const resolvedItems =
      items ??
      (payload ?? []).map((entry) => ({
        label: String(entry.name ?? entry.dataKey ?? ""),
        value: (entry.value as string | number | undefined) ?? "",
        color: entry.color,
        dataKey: entry.dataKey == null ? undefined : String(entry.dataKey),
      }));

    if (!resolvedItems || resolvedItems.length === 0) {
      if (!resolvedLabel) return null;
    }

    return (
      <div ref={ref} data-slot="chart-tooltip-content" className={cn("flex min-w-[10rem] flex-col gap-2 rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]", className)} {...props}>
        {resolvedLabel ? (
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--sx-color-foreground-muted)]">
            {resolvedLabel}
          </div>
        ) : null}
        <div className="flex flex-col gap-1.5">
          {resolvedItems.map((item) => (
            <div key={`${item.label}-${item.value}`} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2 text-[color:var(--sx-color-foreground-muted)]">
                <ChartTooltipIndicatorDot color={item.color} indicator={indicator} />
                <span>{item.label}</span>
              </div>
              <span className="font-medium text-[color:var(--sx-color-foreground)]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

ChartTooltipContent.displayName = "ChartTooltipContent";

function ChartFrame({
  ariaLabel,
  children,
  height,
}: {
  readonly ariaLabel: string;
  readonly children: React.ReactNode;
  readonly height: number;
}) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      data-slot="chart-frame"
      className="w-full overflow-visible"
      style={{ height }}
    >
      {children}
    </div>
  );
}

export function LineChart({ ariaLabel = "Line chart", height = 240, series, config }: LineChartProps) {
  // `series` is a Synthex convenience (shadcn composes Container/Legend/Tooltip
  // with recharts directly); kept for parity with native hand-rolled charts.
  const data = React.useMemo(() => transformSeriesToRechartsData(series), [series]);
  const reducedMotion = useReducedMotion();

  return (
    <ChartFrame ariaLabel={ariaLabel} height={height}>
      <RechartsLineChart data={data as never} width={DEFAULT_WIDTH} height={height} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="var(--sx-color-border)" strokeDasharray="4 6" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "var(--sx-color-foreground-muted)", fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} width={40} tick={{ fill: "var(--sx-color-foreground-muted)", fontSize: 12 }} />
        <RechartsTooltip content={<ChartTooltipContent config={config} />} />
        {series.map((entry, index) => (
          <RechartsLine
            key={entry.key}
            dataKey={entry.key}
            name={entry.label}
            stroke={resolveSeriesColor(entry.key, entry.color, index, config)}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 4 }}
            isAnimationActive={!reducedMotion}
          />
        ))}
      </RechartsLineChart>
    </ChartFrame>
  );
}

export function AreaChart({ ariaLabel = "Area chart", height = 240, series, config }: AreaChartProps) {
  const data = React.useMemo(() => transformSeriesToRechartsData(series), [series]);
  const reducedMotion = useReducedMotion();

  return (
    <ChartFrame ariaLabel={ariaLabel} height={height}>
      <RechartsAreaChart data={data as never} width={DEFAULT_WIDTH} height={height} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="var(--sx-color-border)" strokeDasharray="4 6" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "var(--sx-color-foreground-muted)", fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} width={40} tick={{ fill: "var(--sx-color-foreground-muted)", fontSize: 12 }} />
        <RechartsTooltip content={<ChartTooltipContent config={config} />} />
        {series.map((entry, index) => {
          const color = resolveSeriesColor(entry.key, entry.color, index, config);
          return (
            <RechartsArea
              key={entry.key}
              dataKey={entry.key}
              name={entry.label}
              stroke={color}
              fill={color}
              fillOpacity={0.18}
              strokeWidth={3}
              isAnimationActive={!reducedMotion}
            />
          );
        })}
      </RechartsAreaChart>
    </ChartFrame>
  );
}

export function BarChart({ ariaLabel = "Bar chart", height = 240, series, config }: BarChartProps) {
  const data = React.useMemo(() => transformSeriesToRechartsData(series), [series]);
  const reducedMotion = useReducedMotion();

  return (
    <ChartFrame ariaLabel={ariaLabel} height={height}>
      <RechartsBarChart data={data as never} width={DEFAULT_WIDTH} height={height} margin={{ top: 8, right: 16, bottom: 8, left: 0 }} barCategoryGap="20%">
        <CartesianGrid stroke="var(--sx-color-border)" strokeDasharray="4 6" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "var(--sx-color-foreground-muted)", fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} width={40} tick={{ fill: "var(--sx-color-foreground-muted)", fontSize: 12 }} />
        <RechartsTooltip content={<ChartTooltipContent config={config} />} cursor={{ fill: "var(--sx-color-surface-muted)" }} />
        {series.map((entry, index) => (
          <RechartsBar
            key={entry.key}
            dataKey={entry.key}
            name={entry.label}
            fill={resolveSeriesColor(entry.key, entry.color, index, config)}
            radius={[8, 8, 0, 0]}
            isAnimationActive={!reducedMotion}
          />
        ))}
      </RechartsBarChart>
    </ChartFrame>
  );
}
