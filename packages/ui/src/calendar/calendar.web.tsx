import * as React from "react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "../_shared/variants";
import { useControllableState } from "../hooks/useControllableState";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.web";
import type { CalendarDateRange, CalendarSharedProps } from "./calendar.shared";

export interface CalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "onSelect">,
    CalendarSharedProps {
  readonly className?: string;
  readonly classNames?: DayPickerProps["classNames"];
  readonly showOutsideDays?: boolean;
  readonly captionLayout?: DayPickerProps["captionLayout"];
  readonly disabled?: DayPickerProps["disabled"];
  readonly fixedWeeks?: boolean;
}

function CalendarChevron({
  orientation,
}: {
  readonly orientation?: "left" | "right" | "up" | "down";
}) {
  if (orientation === "left") {
    return <ChevronLeftIcon size={16} />;
  }
  return <ChevronRightIcon size={16} />;
}

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      className,
      classNames,
      showOutsideDays = true,
      captionLayout = "label",
      fixedWeeks,
      numberOfMonths,
      disabled,
      defaultMonth,
      month,
      onMonthChange,
      defaultValue,
      value,
      onValueChange,
      mode = "single",
      selected,
      defaultSelected,
      onSelect,
      required,
      ...props
    },
    ref,
  ) => {
    const [singleSelected, setSingleSelected] = useControllableState<Date | undefined>({
      defaultValue: (defaultSelected as Date | undefined) ?? defaultValue,
      onChange: (next) => {
        (onSelect as ((v: Date | undefined) => void) | undefined)?.(next);
        onValueChange?.(next);
      },
      value: (selected as Date | undefined) ?? value,
    });

    const [multiSelected, setMultiSelected] = useControllableState<readonly Date[] | undefined>({
      defaultValue: (defaultSelected as readonly Date[] | undefined) ?? [],
      onChange: (next) => {
        (onSelect as ((v: readonly Date[] | undefined) => void) | undefined)?.(next);
      },
      value: selected as readonly Date[] | undefined,
    });

    const [rangeSelected, setRangeSelected] = useControllableState<
      CalendarDateRange | undefined
    >({
      defaultValue: (defaultSelected as CalendarDateRange | undefined) ?? {
        from: undefined,
        to: undefined,
      },
      onChange: (next) => {
        (onSelect as ((v: CalendarDateRange | undefined) => void) | undefined)?.(next);
      },
      value: selected as CalendarDateRange | undefined,
    });

    const sharedClassNames: DayPickerProps["classNames"] = {
      months: "flex flex-col sm:flex-row gap-2",
      month: "flex flex-col gap-4",
      month_caption: "flex justify-center pt-1 relative items-center w-full",
      caption_label: "text-sm font-medium text-[color:var(--sx-color-foreground)]",
      nav: "flex items-center gap-1",
      button_previous:
        "inline-flex h-7 w-7 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] text-[color:var(--sx-color-foreground)] opacity-70 hover:opacity-100 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4",
      button_next:
        "inline-flex h-7 w-7 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] text-[color:var(--sx-color-foreground)] opacity-70 hover:opacity-100 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4",
      month_grid: "w-full border-collapse",
      weekdays: "flex",
      weekday:
        "flex h-8 w-9 items-center justify-center text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--sx-color-foreground-muted)]",
      week: "flex w-full mt-1",
      day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
      day_button:
        "inline-flex h-9 w-9 items-center justify-center rounded-[var(--sx-radius-md)] text-sm font-normal text-[color:var(--sx-color-foreground)] transition-colors hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] disabled:pointer-events-none disabled:opacity-40 aria-selected:bg-[color:var(--sx-color-primary)] aria-selected:text-[color:var(--sx-color-foreground-on-brand)] aria-selected:font-semibold aria-selected:hover:bg-[color:var(--sx-color-primary)]",
      range_start:
        "[&>button]:bg-[color:var(--sx-color-primary)] [&>button]:text-[color:var(--sx-color-foreground-on-brand)]",
      range_end:
        "[&>button]:bg-[color:var(--sx-color-primary)] [&>button]:text-[color:var(--sx-color-foreground-on-brand)]",
      range_middle:
        "[&>button]:bg-[color:var(--sx-color-primary-muted)] [&>button]:text-[color:var(--sx-color-foreground)]",
      selected: "",
      today: "[&>button]:border [&>button]:border-[color:var(--sx-color-border-strong)]",
      outside: "[&>button]:text-[color:var(--sx-color-foreground-muted)] [&>button]:opacity-60",
      disabled: "[&>button]:opacity-40",
      hidden: "invisible",
      ...classNames,
    };

    const dayPickerBase = {
      showOutsideDays,
      captionLayout,
      fixedWeeks,
      numberOfMonths,
      disabled,
      defaultMonth,
      month,
      onMonthChange,
      classNames: sharedClassNames,
      labels: {
        labelPrevious: () => "Previous month",
        labelNext: () => "Next month",
        labelDayButton: (date: Date) => String(date.getDate()),
      },
      components: {
        Chevron: CalendarChevron,
      },
    } as const;

    return (
      <div
        ref={ref}
        data-slot="calendar"
        className={cn(
          "rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4",
          className,
        )}
        {...props}
      >
        {mode === "multiple" ? (
          <DayPicker
            mode="multiple"
            selected={multiSelected as Date[] | undefined}
            onSelect={setMultiSelected as never}
            required={required as never}
            {...dayPickerBase}
          />
        ) : mode === "range" ? (
          <DayPicker
            mode="range"
            selected={rangeSelected as never}
            onSelect={setRangeSelected as never}
            required={required as never}
            {...dayPickerBase}
          />
        ) : (
          <DayPicker
            mode="single"
            required={required}
            selected={singleSelected}
            onSelect={setSingleSelected as never}
            {...dayPickerBase}
          />
        )}
      </div>
    );
  },
);

Calendar.displayName = "Calendar";

export type { CalendarDateRange };
