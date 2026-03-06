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
export declare function normalizePanelSizes(panels: readonly ResizablePanelMetrics[]): number[];
export declare function clampPanelSizes(sizes: readonly number[], index: number, delta: number, panels: readonly ResizablePanelMetrics[]): number[];
//# sourceMappingURL=resizable.shared.d.ts.map