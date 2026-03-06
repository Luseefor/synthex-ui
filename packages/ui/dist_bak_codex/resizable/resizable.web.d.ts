import * as React from "react";
import { type ResizableHandleSharedProps, type ResizablePanelGroupSharedProps, type ResizablePanelSharedProps } from "./resizable.shared";
export interface ResizablePanelGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, ResizablePanelGroupSharedProps {
}
export interface ResizablePanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, ResizablePanelSharedProps {
}
export interface ResizableHandleProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ResizableHandleSharedProps {
}
export declare const ResizablePanel: React.ForwardRefExoticComponent<ResizablePanelProps & React.RefAttributes<HTMLDivElement>>;
export declare const ResizableHandle: React.ForwardRefExoticComponent<ResizableHandleProps & React.RefAttributes<HTMLButtonElement>>;
export declare const ResizablePanelGroup: React.ForwardRefExoticComponent<ResizablePanelGroupProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=resizable.web.d.ts.map