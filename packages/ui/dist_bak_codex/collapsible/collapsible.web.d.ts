import * as React from "react";
import { type CollapsibleSharedProps } from "./collapsible.shared";
export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement>, CollapsibleSharedProps {
    readonly children?: React.ReactNode;
}
export declare function Collapsible({ children, defaultOpen, disabled, onOpenChange, open, ...props }: CollapsibleProps): import("react/jsx-runtime").JSX.Element;
export declare const CollapsibleTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const CollapsibleContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=collapsible.web.d.ts.map