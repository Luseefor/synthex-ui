import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, View, } from "react-native";
import { useControllableState } from "../hooks/useControllableState";
import { useTheme } from "../_shared/theme/context";
import { resolveSwitchVariants } from "./switch.shared";
export const Switch = React.forwardRef(({ checked, defaultChecked = false, disabled, onCheckedChange, onPress, style, uiSize, ...props }, ref) => {
    const theme = useTheme();
    const [currentChecked, setCurrentChecked] = useControllableState({
        defaultValue: defaultChecked,
        onChange: onCheckedChange,
        value: checked,
    });
    const resolved = resolveSwitchVariants({ uiSize });
    const isSmall = resolved.size === "sm";
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "switch", accessibilityState: { checked: !!currentChecked, disabled: !!disabled }, disabled: disabled, onPress: (event) => {
            onPress?.(event);
            if (disabled || event.defaultPrevented) {
                return;
            }
            setCurrentChecked(!currentChecked);
        }, style: ({ pressed }) => [
            {
                width: isSmall ? 40 : 48,
                height: isSmall ? 24 : 28,
                padding: 2,
                borderRadius: 999,
                backgroundColor: currentChecked ? theme.colors.primary : theme.colors.secondary,
                justifyContent: "center",
                opacity: pressed ? 0.94 : 1,
            },
            disabled && { opacity: 0.5 },
            style,
        ], ...props, children: _jsx(View, { style: {
                width: isSmall ? 20 : 24,
                height: isSmall ? 20 : 24,
                borderRadius: 999,
                backgroundColor: theme.colors.surface,
                transform: [{ translateX: currentChecked ? (isSmall ? 16 : 20) : 0 }],
            } }) }));
});
Switch.displayName = "Switch";
