import * as React from "react";
import { type RadioGroupItemSharedProps, type RadioGroupSharedProps } from "./radio-group.shared";
export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "value">, RadioGroupSharedProps {
}
export declare function RadioGroup({ children, className, defaultValue, onValueChange, value, ...props }: RadioGroupProps): import("react/jsx-runtime").JSX.Element;
export interface RadioGroupItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">, RadioGroupItemSharedProps {
}
export declare const RadioGroupItem: React.ForwardRefExoticComponent<RadioGroupItemProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=radio-group.web.d.ts.map