import * as React from "react";
import { type CheckboxSharedProps } from "./checkbox.shared";
export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "checked" | "defaultChecked" | "onChange">, CheckboxSharedProps {
}
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=checkbox.web.d.ts.map