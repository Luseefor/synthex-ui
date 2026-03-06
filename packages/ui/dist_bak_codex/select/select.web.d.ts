import * as React from "react";
import { type SelectItemSharedProps, type SelectSharedProps } from "./select.shared";
export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "value">, SelectSharedProps {
}
export declare function Select({ children, className, defaultOpen, defaultValue, onOpenChange, onValueChange, open, placeholder, value, ...props }: SelectProps): import("react/jsx-runtime").JSX.Element;
export declare const SelectTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const SelectValue: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
export declare const SelectContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface SelectItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">, SelectItemSharedProps {
}
export declare const SelectItem: React.ForwardRefExoticComponent<SelectItemProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=select.web.d.ts.map