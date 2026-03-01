import * as React from "react";
import { cn } from "../_shared/variants";
import { CalendarIcon } from "../icons/index.web";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover.web";
import { Calendar } from "../calendar/calendar.web";
import { useControllableState } from "../hooks/useControllableState";
import { getDatePickerLabel, type DatePickerSharedProps } from "./date-picker.shared";

export interface DatePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "value">, DatePickerSharedProps {}

export function DatePicker({
  className,
  defaultValue,
  onValueChange,
  placeholder,
  value,
  ...props
}: DatePickerProps) {
  const [currentValue, setCurrentValue] = useControllableState<Date | undefined>({
    defaultValue,
    onChange: onValueChange,
    value,
  });

  return (
    <Popover className={cn("w-full", className)} {...props}>
      <PopoverTrigger className="inline-flex h-10 w-full items-center justify-between gap-3 rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] px-3.5 text-sm text-[color:var(--sx-color-foreground)]">
        <span>{getDatePickerLabel(currentValue, placeholder)}</span>
        <CalendarIcon size={16} />
      </PopoverTrigger>
      <PopoverContent className="min-w-[19rem] p-0">
        <Calendar
          className="border-0 shadow-none"
          value={currentValue}
          onValueChange={setCurrentValue}
        />
      </PopoverContent>
    </Popover>
  );
}
