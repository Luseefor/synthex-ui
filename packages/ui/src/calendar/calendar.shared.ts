import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";

export type CalendarMode = "single" | "multiple" | "range";

export interface CalendarDateRange {
  readonly from: Date | undefined;
  readonly to?: Date | undefined;
}

export interface CalendarSharedProps {
  readonly defaultMonth?: Date;
  readonly defaultValue?: Date;
  readonly month?: Date;
  readonly onMonthChange?: (month: Date) => void;
  readonly onValueChange?: (value?: Date) => void;
  readonly value?: Date;
  /** Selection mode. Defaults to "single" for legacy compat. */
  readonly mode?: CalendarMode;
  /** New API selected value (single / multiple / range). */
  readonly selected?: Date | readonly Date[] | CalendarDateRange | undefined;
  readonly defaultSelected?: Date | readonly Date[] | CalendarDateRange | undefined;
  readonly onSelect?: (
    selected: Date | readonly Date[] | CalendarDateRange | undefined,
  ) => void;
  readonly required?: boolean;
  readonly numberOfMonths?: number;
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

export function isDateInRange(date: Date, range?: CalendarDateRange): boolean {
  if (!range?.from || !range?.to) return false;
  const time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const from = new Date(
    range.from.getFullYear(),
    range.from.getMonth(),
    range.from.getDate(),
  ).getTime();
  const to = new Date(
    range.to.getFullYear(),
    range.to.getMonth(),
    range.to.getDate(),
  ).getTime();
  const [start, end] = from <= to ? [from, to] : [to, from];
  return time >= start && time <= end;
}

export function toggleDateInSelection(
  date: Date,
  current: readonly Date[] | undefined,
): Date[] {
  const list = current ? [...current] : [];
  const index = list.findIndex((entry) => isSameDay(entry, date));
  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push(date);
  }
  return list;
}

export function updateRangeSelection(
  date: Date,
  current?: CalendarDateRange,
): CalendarDateRange {
  if (!current?.from || (current.from && current.to)) {
    return { from: date, to: undefined };
  }
  const from = current.from;
  if (isSameDay(from, date)) {
    return { from: date, to: undefined };
  }
  return date.getTime() >= from.getTime()
    ? { from, to: date }
    : { from: date, to: from };
}

export function resolveLegacySelected(props: CalendarSharedProps): {
  mode: CalendarMode;
  selected: Date | readonly Date[] | CalendarDateRange | undefined;
} {
  const mode = props.mode ?? "single";
  if (props.selected !== undefined || props.defaultSelected !== undefined) {
    return {
      mode,
      selected: (props.selected ?? props.defaultSelected) as
        | Date
        | readonly Date[]
        | CalendarDateRange
        | undefined,
    };
  }
  if (mode === "single") {
    return { mode, selected: props.value ?? props.defaultValue };
  }
  if (mode === "multiple") {
    return { mode, selected: [] };
  }
  return { mode, selected: { from: undefined, to: undefined } };
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
