import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { CalendarIcon } from "../icons/index.web";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover.web";
import { Calendar } from "../calendar/calendar.web";
import { useControllableState } from "../hooks/useControllableState";
import { getDatePickerLabel } from "./date-picker.shared";
export function DatePicker({ className, defaultValue, onValueChange, placeholder, value, ...props }) {
    const [currentValue, setCurrentValue] = useControllableState({
        defaultValue,
        onChange: onValueChange,
        value,
    });
    return (_jsxs(Popover, { className: cn("w-full", className), ...props, children: [_jsxs(PopoverTrigger, { className: "inline-flex h-10 w-full items-center justify-between gap-3 rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] px-3.5 text-sm text-[color:var(--sx-color-foreground)]", children: [_jsx("span", { children: getDatePickerLabel(currentValue, placeholder) }), _jsx(CalendarIcon, { size: 16 })] }), _jsx(PopoverContent, { className: "min-w-[19rem] p-0", children: _jsx(Calendar, { className: "border-0 shadow-none", value: currentValue, onValueChange: setCurrentValue }) })] }));
}
