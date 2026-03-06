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
export declare const weekdayLabels: readonly ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export declare function startOfMonth(date: Date): Date;
export declare function addMonths(date: Date, amount: number): Date;
export declare function isSameDay(left?: Date, right?: Date): boolean;
export declare function formatMonthLabel(date: Date): string;
export declare function formatDateLabel(date?: Date): string;
export declare function createCalendarGrid(month: Date): readonly CalendarDayCell[];
export declare function useCalendarController({ defaultMonth, defaultValue, month, onMonthChange, onValueChange, value, }: CalendarSharedProps): {
    month: Date;
    setMonth(nextMonth: Date): void;
    setValue: (nextValue: Date | undefined) => void;
    value: Date | undefined;
};
//# sourceMappingURL=calendar.shared.d.ts.map