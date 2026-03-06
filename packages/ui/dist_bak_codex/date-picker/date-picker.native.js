import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { CalendarIcon } from "../icons/index.native";
import { Calendar } from "../calendar/calendar.native";
import { useControllableState } from "../hooks/useControllableState";
import { getDatePickerLabel } from "./date-picker.shared";
export function DatePicker({ defaultValue, onValueChange, placeholder, style, value, ...props }) {
    const theme = useTheme();
    const [currentValue, setCurrentValue] = useControllableState({
        defaultValue,
        onChange: onValueChange,
        value,
    });
    const [open, setOpen] = React.useState(false);
    return (_jsxs(View, { style: [{ gap: 8 }, style], ...props, children: [_jsxs(Pressable, { accessibilityRole: "button", onPress: () => setOpen((current) => !current), style: {
                    minHeight: 40,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.surfaceRaised,
                    paddingHorizontal: 14,
                }, children: [_jsx(Text, { style: { color: theme.colors.foreground, fontSize: theme.typography.size.sm }, children: getDatePickerLabel(currentValue, placeholder) }), _jsx(CalendarIcon, { size: 16 })] }), open ? (_jsx(Calendar, { value: currentValue, onValueChange: (next) => {
                    setCurrentValue(next);
                    setOpen(false);
                } })) : null] }));
}
