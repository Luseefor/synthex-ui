import * as React from "react";
import { cn } from "../_shared/variants";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.web";
import {
  addMonths,
  createCalendarGrid,
  formatMonthLabel,
  isSameDay,
  useCalendarController,
  weekdayLabels,
  type CalendarSharedProps,
} from "./calendar.shared";

export interface CalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">,
    CalendarSharedProps {}

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      className,
      defaultMonth,
      defaultValue,
      month,
      onMonthChange,
      onValueChange,
      value,
      ...props
    },
    ref,
  ) => {
    const controller = useCalendarController({
      defaultMonth,
      defaultValue,
      month,
      onMonthChange,
      onValueChange,
      value,
    });
    const days = createCalendarGrid(controller.month);

    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-4 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Previous month"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] text-[color:var(--sx-color-foreground)]"
            onClick={() => controller.setMonth(addMonths(controller.month, -1))}
          >
            <ChevronLeftIcon size={16} />
          </button>
          <div className="text-sm font-semibold text-[color:var(--sx-color-foreground)]">
            {formatMonthLabel(controller.month)}
          </div>
          <button
            type="button"
            aria-label="Next month"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] text-[color:var(--sx-color-foreground)]"
            onClick={() => controller.setMonth(addMonths(controller.month, 1))}
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="flex h-8 items-center justify-center text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--sx-color-foreground-muted)]"
            >
              {label}
            </div>
          ))}
          {days.map((day) => {
            const selected = isSameDay(day.date, controller.value);

            return (
              <button
                key={day.key}
                type="button"
                className={cn(
                  "flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] text-sm transition-colors duration-150",
                  day.inCurrentMonth
                    ? "text-[color:var(--sx-color-foreground)]"
                    : "text-[color:var(--sx-color-foreground-muted)] opacity-70",
                  selected
                    ? "bg-[color:var(--sx-color-primary)] font-semibold text-[color:var(--sx-color-foreground-on-brand)]"
                    : "hover:bg-[color:var(--sx-color-surface-muted)]",
                )}
                onClick={() => controller.setValue(day.date)}
              >
                {day.date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

Calendar.displayName = "Calendar";
