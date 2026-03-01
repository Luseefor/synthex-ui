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

export interface BaseChartSharedProps {
  readonly series: readonly ChartSeries[];
  readonly height?: number;
  readonly ariaLabel?: string;
}

export interface ChartContainerSharedProps {
  readonly children: ReactNode;
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
}
