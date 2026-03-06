import { type CalendarSharedProps } from "../calendar/calendar.shared";
export interface DatePickerSharedProps extends Pick<CalendarSharedProps, "defaultValue" | "onValueChange" | "value"> {
    readonly placeholder?: string;
}
export declare function getDatePickerLabel(value?: Date, placeholder?: string): string;
//# sourceMappingURL=date-picker.shared.d.ts.map