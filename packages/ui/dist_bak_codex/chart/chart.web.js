import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
const DEFAULT_SERIES_COLORS = [
    "var(--sx-color-primary)",
    "var(--sx-color-accent)",
    "#0f766e",
    "#9333ea",
];
const SVG_WIDTH = 640;
export const ChartContainer = React.forwardRef(({ children, className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)]", className), ...props, children: children })));
ChartContainer.displayName = "ChartContainer";
export const ChartLegend = React.forwardRef(({ className, series, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("flex flex-wrap gap-3", className), ...props, children: series.map((entry, index) => (_jsxs("div", { className: "flex items-center gap-2 text-sm text-[color:var(--sx-color-foreground-muted)]", children: [_jsx("span", { "aria-hidden": "true", className: "h-2.5 w-2.5 rounded-full", style: { backgroundColor: resolveSeriesColor(entry, index) } }), _jsx("span", { children: entry.label })] }, entry.key))) })));
ChartLegend.displayName = "ChartLegend";
export const ChartTooltip = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] p-3 shadow-[0_12px_28px_rgba(15,23,42,0.08)]", className), ...props })));
ChartTooltip.displayName = "ChartTooltip";
export const ChartTooltipContent = React.forwardRef(({ className, items, label, ...props }, ref) => (_jsxs("div", { ref: ref, className: cn("flex flex-col gap-2", className), ...props, children: [label ? (_jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--sx-color-foreground-muted)]", children: label })) : null, _jsx("div", { className: "flex flex-col gap-1.5", children: items.map((item) => (_jsxs("div", { className: "flex items-center justify-between gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2 text-[color:var(--sx-color-foreground-muted)]", children: [_jsx("span", { "aria-hidden": "true", className: "h-2.5 w-2.5 rounded-full", style: { backgroundColor: item.color ?? "var(--sx-color-primary)" } }), _jsx("span", { children: item.label })] }), _jsx("span", { className: "font-medium text-[color:var(--sx-color-foreground)]", children: item.value })] }, `${item.label}-${item.value}`))) })] })));
ChartTooltipContent.displayName = "ChartTooltipContent";
export function LineChart({ ariaLabel = "Line chart", height = 240, series }) {
    const points = getSeriesPoints(series, height);
    return (_jsxs("svg", { "aria-label": ariaLabel, className: "w-full overflow-visible", role: "img", viewBox: `0 0 ${SVG_WIDTH} ${height}`, children: [_jsx(ChartGrid, { height: height }), points.map((entry, index) => (_jsxs("g", { children: [_jsx("polyline", { fill: "none", points: entry.points.map((point) => `${point.x},${point.y}`).join(" "), stroke: resolveSeriesColor(series[index], index), strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "3" }), entry.points.map((point) => (_jsx("circle", { cx: point.x, cy: point.y, fill: resolveSeriesColor(series[index], index), r: "4" }, `${entry.key}-${point.label}`)))] }, entry.key))), _jsx(ChartAxisLabels, { series: series, height: height })] }));
}
export function AreaChart({ ariaLabel = "Area chart", height = 240, series }) {
    const points = getSeriesPoints(series, height);
    const baseline = height - 28;
    return (_jsxs("svg", { "aria-label": ariaLabel, className: "w-full overflow-visible", role: "img", viewBox: `0 0 ${SVG_WIDTH} ${height}`, children: [_jsx(ChartGrid, { height: height }), points.map((entry, index) => {
                const color = resolveSeriesColor(series[index], index);
                const areaPath = [
                    `M ${entry.points[0]?.x ?? 0} ${baseline}`,
                    ...entry.points.map((point) => `L ${point.x} ${point.y}`),
                    `L ${entry.points.at(-1)?.x ?? 0} ${baseline}`,
                    "Z",
                ].join(" ");
                return (_jsxs("g", { children: [_jsx("path", { d: areaPath, fill: color, fillOpacity: "0.18", stroke: "none" }), _jsx("polyline", { fill: "none", points: entry.points.map((point) => `${point.x},${point.y}`).join(" "), stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "3" })] }, entry.key));
            }), _jsx(ChartAxisLabels, { series: series, height: height })] }));
}
export function BarChart({ ariaLabel = "Bar chart", height = 240, series }) {
    const points = getSeriesPoints(series, height);
    const labels = series[0]?.data.map((entry) => entry.label) ?? [];
    const plotWidth = SVG_WIDTH - 64;
    const step = labels.length > 0 ? plotWidth / labels.length : plotWidth;
    const barGroupWidth = step * 0.62;
    const barWidth = series.length > 0 ? barGroupWidth / series.length : barGroupWidth;
    const baseline = height - 28;
    return (_jsxs("svg", { "aria-label": ariaLabel, className: "w-full overflow-visible", role: "img", viewBox: `0 0 ${SVG_WIDTH} ${height}`, children: [_jsx(ChartGrid, { height: height }), points.map((entry, seriesIndex) => entry.points.map((point, pointIndex) => (_jsx("rect", { fill: resolveSeriesColor(series[seriesIndex], seriesIndex), height: Math.max(baseline - point.y, 8), rx: "8", width: Math.max(barWidth - 6, 10), x: 48 + pointIndex * step + seriesIndex * barWidth, y: point.y }, `${entry.key}-${point.label}`)))), _jsx(ChartAxisLabels, { series: series, height: height })] }));
}
function ChartGrid({ height }) {
    const rows = 4;
    return (_jsx("g", { children: Array.from({ length: rows }).map((_, index) => {
            const y = 20 + index * ((height - 48) / (rows - 1));
            return (_jsx("line", { stroke: "var(--sx-color-border)", strokeDasharray: "4 6", strokeWidth: "1", x1: "40", x2: SVG_WIDTH - 16, y1: y, y2: y }, y));
        }) }));
}
function ChartAxisLabels({ height, series, }) {
    const labels = series[0]?.data.map((entry) => entry.label) ?? [];
    const plotWidth = SVG_WIDTH - 64;
    const step = labels.length > 1 ? plotWidth / (labels.length - 1) : plotWidth;
    return (_jsx("g", { children: labels.map((label, index) => (_jsx("text", { fill: "var(--sx-color-foreground-muted)", fontFamily: "var(--sx-font-family-sans)", fontSize: "12", textAnchor: "middle", x: 40 + index * step, y: height - 6, children: label }, label))) }));
}
function getSeriesPoints(series, height) {
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
function resolveSeriesColor(series, index) {
    return series.color ?? DEFAULT_SERIES_COLORS[index % DEFAULT_SERIES_COLORS.length];
}
