import * as React from "react";
import { type DatePickerSharedProps } from "./date-picker.shared";
export interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "value">, DatePickerSharedProps {
}
export declare function DatePicker({ className, defaultValue, onValueChange, placeholder, value, ...props }: DatePickerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=date-picker.web.d.ts.map