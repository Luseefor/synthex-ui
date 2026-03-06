import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Line, Path, Rect, Text as SvgText, Polyline } from "react-native-svg";
import { useTheme } from "../_shared/theme/context";
const DEFAULT_SERIES_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#d97706"];
const SVG_WIDTH = 640;
export function ChartContainer({ children }) {
    const theme = useTheme();
    return _jsx(View, { style: getStyles(theme).container, children: children });
}
export function ChartLegend({ series }) {
    const theme = useTheme();
    return (_jsx(View, { style: getStyles(theme).legendRow, children: series.map((entry, index) => (_jsxs(View, { style: getStyles(theme).legendItem, children: [_jsx(View, { style: [
                        getStyles(theme).legendSwatch,
                        { backgroundColor: resolveSeriesColor(entry, index) },
                    ] }), _jsx(Text, { style: getStyles(theme).legendLabel, children: entry.label })] }, entry.key))) }));
}
export function ChartTooltip({ children }) {
    const theme = useTheme();
    return _jsx(View, { style: getStyles(theme).tooltip, children: children });
}
export function ChartTooltipContent({ items, label }) {
    const theme = useTheme();
    return (_jsxs(View, { style: getStyles(theme).tooltipContent, children: [label ? _jsx(Text, { style: getStyles(theme).tooltipLabel, children: label }) : null, items.map((item) => (_jsxs(View, { style: getStyles(theme).tooltipRow, children: [_jsxs(View, { style: getStyles(theme).tooltipLabelRow, children: [_jsx(View, { style: [
                                    getStyles(theme).legendSwatch,
                                    { backgroundColor: item.color ?? theme.colors.primary },
                                ] }), _jsx(Text, { style: getStyles(theme).legendLabel, children: item.label })] }), _jsx(Text, { style: getStyles(theme).tooltipValue, children: item.value })] }, `${item.label}-${item.value}`)))] }));
}
export function LineChart({ ariaLabel, height = 240, series }) {
    const theme = useTheme();
    const points = getSeriesPoints(series, height);
    return (_jsx(View, { accessibilityLabel: ariaLabel ?? "Line chart", accessible: true, children: _jsxs(Svg, { height: height, viewBox: `0 0 ${SVG_WIDTH} ${height}`, width: "100%", children: [_jsx(ChartGrid, { height: height, stroke: theme.colors.border }), points.map((entry, index) => (_jsxs(React.Fragment, { children: [_jsx(Polyline, { fill: "none", points: entry.points.map((point) => `${point.x},${point.y}`).join(" "), stroke: resolveSeriesColor(series[index], index), strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3 }), entry.points.map((point) => (_jsx(Circle, { cx: point.x, cy: point.y, fill: resolveSeriesColor(series[index], index), r: 4 }, `${entry.key}-${point.label}`)))] }, entry.key))), _jsx(ChartAxisLabels, { color: theme.colors.foregroundMuted, height: height, series: series })] }) }));
}
export function AreaChart({ ariaLabel, height = 240, series }) {
    const theme = useTheme();
    const points = getSeriesPoints(series, height);
    const baseline = height - 28;
    return (_jsx(View, { accessibilityLabel: ariaLabel ?? "Area chart", accessible: true, children: _jsxs(Svg, { height: height, viewBox: `0 0 ${SVG_WIDTH} ${height}`, width: "100%", children: [_jsx(ChartGrid, { height: height, stroke: theme.colors.border }), points.map((entry, index) => {
                    const color = resolveSeriesColor(series[index], index);
                    const areaPath = [
                        `M ${entry.points[0]?.x ?? 0} ${baseline}`,
                        ...entry.points.map((point) => `L ${point.x} ${point.y}`),
                        `L ${entry.points.at(-1)?.x ?? 0} ${baseline}`,
                        "Z",
                    ].join(" ");
                    return (_jsxs(React.Fragment, { children: [_jsx(Path, { d: areaPath, fill: color, fillOpacity: 0.18 }), _jsx(Polyline, { fill: "none", points: entry.points.map((point) => `${point.x},${point.y}`).join(" "), stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3 })] }, entry.key));
                }), _jsx(ChartAxisLabels, { color: theme.colors.foregroundMuted, height: height, series: series })] }) }));
}
export function BarChart({ ariaLabel, height = 240, series }) {
    const theme = useTheme();
    const points = getSeriesPoints(series, height);
    const labels = series[0]?.data.map((entry) => entry.label) ?? [];
    const plotWidth = SVG_WIDTH - 64;
    const step = labels.length > 0 ? plotWidth / labels.length : plotWidth;
    const barGroupWidth = step * 0.62;
    const barWidth = series.length > 0 ? barGroupWidth / series.length : barGroupWidth;
    const baseline = height - 28;
    return (_jsx(View, { accessibilityLabel: ariaLabel ?? "Bar chart", accessible: true, children: _jsxs(Svg, { height: height, viewBox: `0 0 ${SVG_WIDTH} ${height}`, width: "100%", children: [_jsx(ChartGrid, { height: height, stroke: theme.colors.border }), points.map((entry, seriesIndex) => entry.points.map((point, pointIndex) => (_jsx(Rect, { fill: resolveSeriesColor(series[seriesIndex], seriesIndex), height: Math.max(baseline - point.y, 8), rx: 8, width: Math.max(barWidth - 6, 10), x: 48 + pointIndex * step + seriesIndex * barWidth, y: point.y }, `${entry.key}-${point.label}`)))), _jsx(ChartAxisLabels, { color: theme.colors.foregroundMuted, height: height, series: series })] }) }));
}
function ChartGrid({ height, stroke }) {
    const rows = 4;
    return (_jsx(_Fragment, { children: Array.from({ length: rows }).map((_, index) => {
            const y = 20 + index * ((height - 48) / (rows - 1));
            return (_jsx(Line, { stroke: stroke, strokeDasharray: "4 6", strokeWidth: 1, x1: 40, x2: SVG_WIDTH - 16, y1: y, y2: y }, y));
        }) }));
}
function ChartAxisLabels({ color, height, series, }) {
    const labels = series[0]?.data.map((entry) => entry.label) ?? [];
    const plotWidth = SVG_WIDTH - 64;
    const step = labels.length > 1 ? plotWidth / (labels.length - 1) : plotWidth;
    return (_jsx(_Fragment, { children: labels.map((label, index) => (_jsx(SvgText, { fill: color, fontSize: "12", textAnchor: "middle", x: 40 + index * step, y: height - 6, children: label }, label))) }));
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
function getStyles(theme) {
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
    };
}
