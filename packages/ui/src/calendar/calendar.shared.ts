import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";

export interface CalendarSharedProps {
  readonly defaultMonth?: Date;
  readonly defaultValue?: Date;
  readonly month?: Date;
  readonly onMonthChange?: (month: Date) => void;
  readonly onValueChange?: (value?: Date) => void;
  readonly value?: Date;
}

export interface CalendarDayCell {
  readonly date: Date;
  readonly inCurrentMonth: boolean;
  readonly key: string;
}

export const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameDay(left?: Date, right?: Date) {
  if (!left || !right) {
    return false;
  }

  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function formatMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function formatDateLabel(date?: Date) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function createCalendarGrid(month: Date): readonly CalendarDayCell[] {
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

export function useCalendarController({
  defaultMonth,
  defaultValue,
  month,
  onMonthChange,
  onValueChange,
  value,
}: CalendarSharedProps) {
  const [currentMonth, setCurrentMonth] = useControllableState<Date>({
    defaultValue: startOfMonth(defaultMonth ?? defaultValue ?? new Date()),
    onChange: onMonthChange,
    value: month ? startOfMonth(month) : undefined,
  });
  const [currentValue, setCurrentValue] = useControllableState<Date | undefined>({
    defaultValue,
    onChange: onValueChange,
    value,
  });

  return React.useMemo(
    () => ({
      month: currentMonth,
      setMonth(nextMonth: Date) {
        setCurrentMonth(startOfMonth(nextMonth));
      },
      setValue: setCurrentValue,
      value: currentValue,
    }),
    [currentMonth, currentValue, setCurrentMonth, setCurrentValue],
  );
}
