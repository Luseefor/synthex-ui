import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
export const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
export function addMonths(date, amount) {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}
export function isSameDay(left, right) {
    if (!left || !right) {
        return false;
    }
    return (left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate());
}
export function formatMonthLabel(date) {
    return date.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
    });
}
export function formatDateLabel(date) {
    if (!date) {
        return "";
    }
    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
export function createCalendarGrid(month) {
    const firstDay = startOfMonth(month);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return {
            date,
            inCurrentMonth: date.getMonth() === month.getMonth(),
            key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        };
    });
}
export function useCalendarController({ defaultMonth, defaultValue, month, onMonthChange, onValueChange, value, }) {
    const [currentMonth, setCurrentMonth] = useControllableState({
        defaultValue: startOfMonth(defaultMonth ?? defaultValue ?? new Date()),
        onChange: onMonthChange,
        value: month ? startOfMonth(month) : undefined,
    });
    const [currentValue, setCurrentValue] = useControllableState({
        defaultValue,
        onChange: onValueChange,
        value,
    });
    return React.useMemo(() => ({
        month: currentMonth,
        setMonth(nextMonth) {
            setCurrentMonth(startOfMonth(nextMonth));
        },
        setValue: setCurrentValue,
        value: currentValue,
    }), [currentMonth, currentValue, setCurrentMonth, setCurrentValue]);
}
