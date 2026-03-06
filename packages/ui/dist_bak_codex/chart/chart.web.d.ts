import * as React from "react";
import type { BaseChartSharedProps, ChartContainerSharedProps, ChartLegendSharedProps, ChartTooltipContentSharedProps } from "./chart.shared";
export interface ChartContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, ChartContainerSharedProps {
}
export interface ChartLegendProps extends React.HTMLAttributes<HTMLDivElement>, ChartLegendSharedProps {
}
export interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
}
export interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement>, ChartTooltipContentSharedProps {
}
export interface LineChartProps extends BaseChartSharedProps {
}
export interface AreaChartProps extends BaseChartSharedProps {
}
export interface BarChartProps extends BaseChartSharedProps {
}
export declare const ChartContainer: React.ForwardRefExoticComponent<ChartContainerProps & React.RefAttributes<HTMLDivElement>>;
export declare const ChartLegend: React.ForwardRefExoticComponent<ChartLegendProps & React.RefAttributes<HTMLDivElement>>;
export declare const ChartTooltip: React.ForwardRefExoticComponent<ChartTooltipProps & React.RefAttributes<HTMLDivElement>>;
export declare const ChartTooltipContent: React.ForwardRefExoticComponent<ChartTooltipContentProps & React.RefAttributes<HTMLDivElement>>;
export declare function LineChart({ ariaLabel, height, series }: LineChartProps): import("react/jsx-runtime").JSX.Element;
export declare function AreaChart({ ariaLabel, height, series }: AreaChartProps): import("react/jsx-runtime").JSX.Element;
export declare function BarChart({ ariaLabel, height, series }: BarChartProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=chart.web.d.ts.map