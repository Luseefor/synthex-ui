import type * as React from "react";

export type ResizableDirection = "horizontal" | "vertical";

export interface ResizablePanelGroupSharedProps {
  readonly children: React.ReactNode;
  readonly direction: ResizableDirection;
}

export interface ResizablePanelSharedProps {
  readonly children: React.ReactNode;
  readonly defaultSize?: number;
  readonly minSize?: number;
}

export interface ResizableHandleSharedProps {
  readonly withHandle?: boolean;
}

export interface ResizablePanelMetrics {
  readonly defaultSize?: number;
  readonly minSize: number;
}

export function normalizePanelSizes(panels: readonly ResizablePanelMetrics[]) {
  if (panels.length === 0) {
    return [] as number[];
  }

  const explicitTotal = panels.reduce((total, panel) => total + (panel.defaultSize ?? 0), 0);
  const unspecifiedCount = panels.filter((panel) => panel.defaultSize == null).length;

  if (explicitTotal <= 0) {
    return panels.map(() => 100 / panels.length);
  }

  const remaining = Math.max(0, 100 - explicitTotal);
  const fallbackSize = unspecifiedCount > 0 ? remaining / unspecifiedCount : 0;

  return panels.map((panel) => panel.defaultSize ?? fallbackSize);
}

export function clampPanelSizes(
  sizes: readonly number[],
  index: number,
  delta: number,
  panels: readonly ResizablePanelMetrics[],
) {
  const currentPanel = panels[index];
  const nextPanel = panels[index + 1];

  if (!currentPanel || !nextPanel) {
    return [...sizes];
  }

  const current = [...sizes];
  const currentSize = current[index] ?? 0;
  const nextSize = current[index + 1] ?? 0;
  const currentTotal = currentSize + nextSize;
  const minCurrent = currentPanel.minSize;
  const minNext = nextPanel.minSize;

  const nextCurrent = Math.min(
    currentTotal - minNext,
    Math.max(minCurrent, currentSize + delta),
  );

  current[index] = nextCurrent;
  current[index + 1] = currentTotal - nextCurrent;

  return current;
}
