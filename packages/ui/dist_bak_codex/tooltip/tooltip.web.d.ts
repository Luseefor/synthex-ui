import * as React from "react";
import { type TooltipSharedProps } from "./tooltip.shared";
export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">, TooltipSharedProps {
    readonly children: React.ReactNode;
}
export declare function Tooltip({ children, className, defaultOpen, onOpenChange, open, ...props }: TooltipProps): import("react/jsx-runtime").JSX.Element;
export declare const TooltipTrigger: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & {
    asChild?: boolean;
} & React.RefAttributes<HTMLSpanElement>>;
export declare const TooltipContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=tooltip.web.d.ts.map