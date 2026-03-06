import * as React from "react";
import { type SurfaceProps } from "../primitives/index.web";
export interface AppShellProps {
    readonly children: React.ReactNode;
    readonly header?: React.ReactNode;
    readonly sidebar?: React.ReactNode;
}
export declare function AppShell({ children, header, sidebar }: AppShellProps): import("react/jsx-runtime").JSX.Element;
export interface PaneProps extends SurfaceProps {
}
export declare function Pane(props: PaneProps): import("react/jsx-runtime").JSX.Element;
export interface SectionProps {
    readonly actions?: React.ReactNode;
    readonly children: React.ReactNode;
    readonly description?: React.ReactNode;
    readonly title?: React.ReactNode;
}
export declare function Section({ actions, children, description, title }: SectionProps): import("react/jsx-runtime").JSX.Element;
export interface PanelFrameProps {
    readonly actions?: React.ReactNode;
    readonly children: React.ReactNode;
    readonly description?: React.ReactNode;
    readonly title: React.ReactNode;
}
export declare function PanelFrame({ actions, children, description, title }: PanelFrameProps): import("react/jsx-runtime").JSX.Element;
export { ScrollArea } from "../primitives/index.web";
//# sourceMappingURL=index.web.d.ts.map