import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.native";
import { addMonths, createCalendarGrid, formatMonthLabel, isSameDay, useCalendarController, weekdayLabels, } from "./calendar.shared";
export const Calendar = React.forwardRef(({ defaultMonth, defaultValue, month, onMonthChange, onValueChange, style, value, ...props }, ref) => {
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
    return (_jsxs(View, { ref: ref, style: [
            {
                gap: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.surface,
                padding: 16,
            },
            style,
        ], ...props, children: [_jsxs(View, { style: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, children: [_jsx(Pressable, { accessibilityRole: "button", onPress: () => controller.setMonth(addMonths(controller.month, -1)), style: {
                            width: 36,
                            height: 36,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surfaceRaised,
                        }, children: _jsx(ChevronLeftIcon, { size: 16 }) }), _jsx(Text, { style: { color: theme.colors.foreground, fontSize: theme.typography.size.sm, fontWeight: theme.typography.weight.semibold }, children: formatMonthLabel(controller.month) }), _jsx(Pressable, { accessibilityRole: "button", onPress: () => controller.setMonth(addMonths(controller.month, 1)), style: {
                            width: 36,
                            height: 36,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surfaceRaised,
                        }, children: _jsx(ChevronRightIcon, { size: 16 }) })] }), _jsxs(View, { style: { flexDirection: "row", flexWrap: "wrap" }, children: [weekdayLabels.map((label) => (_jsx(View, { style: { width: "14.2857%", height: 32, alignItems: "center", justifyContent: "center" }, children: _jsx(Text, { style: { color: theme.colors.foregroundMuted, fontSize: theme.typography.size.xs, fontWeight: theme.typography.weight.semibold }, children: label }) }, label))), days.map((day) => {
                        const selected = isSameDay(day.date, controller.value);
                        return (_jsx(Pressable, { accessibilityRole: "button", onPress: () => controller.setValue(day.date), style: {
                                width: "14.2857%",
                                height: 40,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: theme.radius.md,
                                backgroundColor: selected ? theme.colors.primary : "transparent",
                                opacity: day.inCurrentMonth ? 1 : 0.65,
                            }, children: _jsx(Text, { style: {
                                    color: selected ? theme.colors.foregroundOnBrand : day.inCurrentMonth ? theme.colors.foreground : theme.colors.foregroundMuted,
                                    fontSize: theme.typography.size.sm,
                                    fontWeight: selected ? theme.typography.weight.semibold : theme.typography.weight.medium,
                                }, children: day.date.getDate() }) }, day.key));
                    })] })] }));
});
Calendar.displayName = "Calendar";
