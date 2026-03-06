import * as React from "react";
import type { BaseChartSharedProps, ChartContainerSharedProps, ChartLegendSharedProps, ChartTooltipContentSharedProps } from "./chart.shared";
export interface ChartContainerProps extends ChartContainerSharedProps {
}
export interface ChartLegendProps extends ChartLegendSharedProps {
}
export interface ChartTooltipProps {
    readonly children?: React.ReactNode;
}
export interface ChartTooltipContentProps extends ChartTooltipContentSharedProps {
}
export interface LineChartProps extends BaseChartSharedProps {
}
export interface AreaChartProps extends BaseChartSharedProps {
}
export interface BarChartProps extends BaseChartSharedProps {
}
export declare function ChartContainer({ children }: ChartContainerProps): import("react/jsx-runtime").JSX.Element;
export declare function ChartLegend({ series }: ChartLegendProps): import("react/jsx-runtime").JSX.Element;
export declare function ChartTooltip({ children }: ChartTooltipProps): import("react/jsx-runtime").JSX.Element;
export declare function ChartTooltipContent({ items, label }: ChartTooltipContentProps): import("react/jsx-runtime").JSX.Element;
export declare function LineChart({ ariaLabel, height, series }: LineChartProps): import("react/jsx-runtime").JSX.Element;
export declare function AreaChart({ ariaLabel, height, series }: AreaChartProps): import("react/jsx-runtime").JSX.Element;
export declare function BarChart({ ariaLabel, height, series }: BarChartProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=chart.native.d.ts.map