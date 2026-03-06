import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.web";
import { addMonths, createCalendarGrid, formatMonthLabel, isSameDay, useCalendarController, weekdayLabels, } from "./calendar.shared";
export const Calendar = React.forwardRef(({ className, defaultMonth, defaultValue, month, onMonthChange, onValueChange, value, ...props }, ref) => {
    const controller = useCalendarController({
        defaultMonth,
        defaultValue,
        month,
        onMonthChange,
        onValueChange,
        value,
    });
    const days = createCalendarGrid(controller.month);
    return (_jsxs("div", { ref: ref, className: cn("grid gap-4 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4", className), ...props, children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("button", { type: "button", "aria-label": "Previous month", className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] text-[color:var(--sx-color-foreground)]", onClick: () => controller.setMonth(addMonths(controller.month, -1)), children: _jsx(ChevronLeftIcon, { size: 16 }) }), _jsx("div", { className: "text-sm font-semibold text-[color:var(--sx-color-foreground)]", children: formatMonthLabel(controller.month) }), _jsx("button", { type: "button", "aria-label": "Next month", className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] text-[color:var(--sx-color-foreground)]", onClick: () => controller.setMonth(addMonths(controller.month, 1)), children: _jsx(ChevronRightIcon, { size: 16 }) })] }), _jsxs("div", { className: "grid grid-cols-7 gap-1", children: [weekdayLabels.map((label) => (_jsx("div", { className: "flex h-8 items-center justify-center text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--sx-color-foreground-muted)]", children: label }, label))), days.map((day) => {
                        const selected = isSameDay(day.date, controller.value);
                        return (_jsx("button", { type: "button", className: cn("flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] text-sm transition-colors duration-[var(--sx-motion-fast)]", day.inCurrentMonth
                                ? "text-[color:var(--sx-color-foreground)]"
                                : "text-[color:var(--sx-color-foreground-muted)] opacity-70", selected
                                ? "bg-[color:var(--sx-color-primary)] font-semibold text-[color:var(--sx-color-foreground-on-brand)]"
                                : "hover:bg-[color:var(--sx-color-surface-muted)]"), onClick: () => controller.setValue(day.date), children: day.date.getDate() }, day.key));
                    })] })] }));
});
Calendar.displayName = "Calendar";
