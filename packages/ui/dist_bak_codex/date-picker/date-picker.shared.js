import { formatDateLabel } from "../calendar/calendar.shared";
export function getDatePickerLabel(value, placeholder = "Pick a date") {
    return value ? formatDateLabel(value) : placeholder;
}
