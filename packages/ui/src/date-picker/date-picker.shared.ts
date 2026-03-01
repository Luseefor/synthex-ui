import { formatDateLabel, type CalendarSharedProps } from "../calendar/calendar.shared";

export interface DatePickerSharedProps extends Pick<CalendarSharedProps, "defaultValue" | "onValueChange" | "value"> {
  readonly placeholder?: string;
}

export function getDatePickerLabel(value?: Date, placeholder = "Pick a date") {
  return value ? formatDateLabel(value) : placeholder;
}
