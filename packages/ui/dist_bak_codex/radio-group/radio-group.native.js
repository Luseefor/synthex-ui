import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { RadioGroupProvider, useRadioGroupContext, useRadioGroupController, } from "./radio-group.shared";
export function RadioGroup({ children, defaultValue, onValueChange, style, value, ...props }) {
    const controller = useRadioGroupController({ defaultValue, onValueChange, value });
    return (_jsx(RadioGroupProvider, { value: controller, children: _jsx(View, { accessibilityRole: "radiogroup", style: [{ gap: 12 }, style], ...props, children: children }) }));
}
export const RadioGroupItem = React.forwardRef(({ children, disabled, onPress, style, textStyle, value, ...props }, ref) => {
    const context = useRadioGroupContext();
    const theme = useTheme();
    const isActive = context.value === value;
    return (_jsxs(Pressable, { ref: ref, accessibilityRole: "radio", accessibilityState: { checked: !!isActive, disabled: !!disabled }, disabled: disabled, onPress: (event) => {
            context.setValue(value);
            onPress?.(event);
        }, style: ({ pressed }) => [
            {
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 4,
                opacity: pressed ? 0.92 : 1,
            },
            disabled && { opacity: 0.45 },
            style,
        ], ...props, children: [_jsx(View, { style: {
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    borderWidth: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: isActive ? theme.colors.primary : theme.colors.borderStrong,
                }, children: _jsx(View, { style: {
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: theme.colors.primary,
                        opacity: isActive ? 1 : 0,
                        transform: [{ scale: isActive ? 1 : 0.6 }],
                    } }) }), typeof children === "string" || typeof children === "number" ? (_jsx(Text, { style: [
                    {
                        color: theme.colors.foreground,
                        fontFamily: theme.typography.family.sans,
                        fontSize: theme.typography.size.sm,
                        fontWeight: theme.typography.weight.medium,
                    },
                    textStyle,
                ], children: children })) : (children)] }));
});
RadioGroupItem.displayName = "RadioGroupItem";
