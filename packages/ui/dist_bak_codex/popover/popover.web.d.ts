import * as React from "react";
import { type PopoverSharedProps } from "./popover.shared";
export interface PopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, PopoverSharedProps {
    readonly children: React.ReactNode;
}
export declare function Popover({ children, className, defaultOpen, onOpenChange, open, ...props }: PopoverProps): import("react/jsx-runtime").JSX.Element;
export declare const PopoverTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
} & React.RefAttributes<HTMLButtonElement>>;
export declare const PopoverContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=popover.web.d.ts.map