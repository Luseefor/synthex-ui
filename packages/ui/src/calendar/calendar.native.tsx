import * as React from "react";
import { Pressable, Text, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { useControllableState } from "../hooks/useControllableState";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.native";
import {
  addMonths,
  createCalendarGrid,
  formatMonthLabel,
  isDateInRange,
  isSameDay,
  startOfMonth,
  toggleDateInSelection,
  updateRangeSelection,
  weekdayLabels,
  type CalendarDateRange,
  type CalendarSharedProps,
} from "./calendar.shared";

export interface CalendarProps extends Omit<ViewProps, "style">, CalendarSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Calendar: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CalendarProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, CalendarProps>(
  (
    {
      defaultMonth,
      defaultValue,
      month,
      onMonthChange,
      onValueChange,
      style,
      testID,
      value,
      mode = "single",
      selected,
      defaultSelected,
      onSelect,
      numberOfMonths: _numberOfMonths,
      required: _required,
      ...props
    },
    ref,
  ) => {
    void _numberOfMonths;
    void _required;
    const theme = useTheme();

    const [currentMonthRaw, setCurrentMonthRaw] = useControllableState<Date>({
      defaultValue: startOfMonth(defaultMonth ?? defaultValue ?? new Date()),
      onChange: (next) => onMonthChange?.(startOfMonth(next)),
      value: month ? startOfMonth(month) : undefined,
    });
    const currentMonth = currentMonthRaw;
    const setCurrentMonth = React.useCallback(
      (next: Date) => setCurrentMonthRaw(startOfMonth(next)),
      [setCurrentMonthRaw],
    );

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

    const days = createCalendarGrid(currentMonth);

    const isSelected = React.useCallback(
      (date: Date) => {
        if (mode === "multiple") {
          return (multiSelected ?? []).some((entry) => isSameDay(entry, date));
        }
        if (mode === "range") {
          if (rangeSelected?.from && isSameDay(rangeSelected.from, date)) return true;
          if (rangeSelected?.to && isSameDay(rangeSelected.to, date)) return true;
          return isDateInRange(date, rangeSelected);
        }
        return isSameDay(date, singleSelected);
      },
      [mode, multiSelected, rangeSelected, singleSelected],
    );

    const handleSelect = React.useCallback(
      (date: Date) => {
        if (mode === "multiple") {
          setMultiSelected(toggleDateInSelection(date, multiSelected));
          return;
        }
        if (mode === "range") {
          setRangeSelected(updateRangeSelection(date, rangeSelected));
          return;
        }
        setSingleSelected(isSameDay(singleSelected, date) ? undefined : date);
      },
      [mode, multiSelected, rangeSelected, setMultiSelected, setRangeSelected, setSingleSelected, singleSelected],
    );

    return (
      <View
        ref={ref}
        testID={testID ?? "calendar"}
        style={[
          {
            gap: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.surface,
            padding: 16,
          },
          style,
        ]}
        {...props}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable
            testID="calendar-prev"
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            onPress={() => setCurrentMonth(addMonths(currentMonth, -1))}
            style={{
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceRaised,
            }}
          >
            <ChevronLeftIcon size={16} />
          </Pressable>
          <Text style={{ color: theme.colors.foreground, fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.semibold }}>
            {formatMonthLabel(currentMonth)}
          </Text>
          <Pressable
            testID="calendar-next"
            accessibilityRole="button"
            accessibilityLabel="Next month"
            onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
            style={{
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceRaised,
            }}
          >
            <ChevronRightIcon size={16} />
          </Pressable>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {weekdayLabels.map((label) => (
            <View key={label} style={{ width: "14.2857%", height: 32, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs, fontWeight: theme.typography.weight.semibold }}>
                {label}
              </Text>
            </View>
          ))}
          {days.map((day) => {
            const selectedDay = isSelected(day.date);
            return (
              <Pressable
                key={day.key}
                accessibilityRole="button"
                accessibilityLabel={String(day.date.getDate())}
                accessibilityState={{ selected: selectedDay }}
                onPress={() => handleSelect(day.date)}
                style={{
                  width: "14.2857%",
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: theme.radius.md,
                  backgroundColor: selectedDay ? theme.colors.primary : "transparent",
                  opacity: day.inCurrentMonth ? 1 : 0.65,
                }}
              >
                <Text
                  style={{
                    color: selectedDay ? theme.colors.foregroundOnBrand : day.inCurrentMonth ? theme.colors.foreground : theme.colors.foregroundMuted,
                    fontSize: theme.typography.size.sm,
                    fontWeight: selectedDay ? theme.typography.weight.semibold : theme.typography.weight.medium,
                  }}
                >
                  {day.date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  },
);

Calendar.displayName = "Calendar";

export type { CalendarDateRange };
