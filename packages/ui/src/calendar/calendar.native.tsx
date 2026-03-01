import * as React from "react";
import { Pressable, Text, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.native";
import {
  addMonths,
  createCalendarGrid,
  formatMonthLabel,
  isSameDay,
  useCalendarController,
  weekdayLabels,
  type CalendarSharedProps,
} from "./calendar.shared";

export interface CalendarProps extends Omit<ViewProps, "style">, CalendarSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Calendar = React.forwardRef<React.ElementRef<typeof View>, CalendarProps>(
  (
    {
      defaultMonth,
      defaultValue,
      month,
      onMonthChange,
      onValueChange,
      style,
      value,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
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
      <View
        ref={ref}
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
            accessibilityRole="button"
            onPress={() => controller.setMonth(addMonths(controller.month, -1))}
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
            {formatMonthLabel(controller.month)}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => controller.setMonth(addMonths(controller.month, 1))}
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
            const selected = isSameDay(day.date, controller.value);
            return (
              <Pressable
                key={day.key}
                accessibilityRole="button"
                onPress={() => controller.setValue(day.date)}
                style={{
                  width: "14.2857%",
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: theme.radius.md,
                  backgroundColor: selected ? theme.colors.primary : "transparent",
                  opacity: day.inCurrentMonth ? 1 : 0.65,
                }}
              >
                <Text
                  style={{
                    color: selected ? theme.colors.foregroundOnBrand : day.inCurrentMonth ? theme.colors.foreground : theme.colors.foregroundMuted,
                    fontSize: theme.typography.size.sm,
                    fontWeight: selected ? theme.typography.weight.semibold : theme.typography.weight.medium,
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
