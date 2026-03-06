import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, View, } from "react-native";
import { useControllableState } from "../hooks/useControllableState";
import { CheckIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import { resolveCheckboxVariants, } from "./checkbox.shared";
export const Checkbox = React.forwardRef(({ checked, defaultChecked = false, disabled, invalid, onCheckedChange, onPress, style, uiSize, ...props }, ref) => {
    const theme = useTheme();
    const [currentChecked, setCurrentChecked] = useControllableState({
        defaultValue: defaultChecked,
        onChange: onCheckedChange,
        value: checked,
    });
    const resolved = resolveCheckboxVariants({ invalid, uiSize });
    const checkboxStyle = React.useMemo(() => {
        const dimensions = resolved.size === "sm"
            ? { width: 16, height: 16, borderRadius: 6 }
            : { width: 20, height: 20, borderRadius: 7 };
        return {
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: currentChecked
                ? theme.colors.primary
                : resolved.tone === "invalid"
                    ? theme.colors.destructive
                    : theme.colors.borderStrong,
            backgroundColor: currentChecked ? theme.colors.primary : theme.colors.surface,
            ...dimensions,
        };
    }, [currentChecked, resolved.size, resolved.tone, theme]);
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "checkbox", accessibilityState: { checked: !!currentChecked, disabled: !!disabled }, disabled: disabled, onPress: (event) => {
            onPress?.(event);
            if (disabled || event.defaultPrevented) {
                return;
            }
            setCurrentChecked(!currentChecked);
        }, style: ({ pressed }) => [
            checkboxStyle,
            pressed && { opacity: 0.92 },
            disabled && { opacity: 0.5 },
            style,
        ], ...props, children: _jsx(View, { style: { opacity: currentChecked ? 1 : 0 }, children: _jsx(CheckIcon, { color: theme.colors.foregroundOnBrand, size: resolved.size === "sm" ? 11 : 14, strokeWidth: 2.6 }) }) }));
});
Checkbox.displayName = "Checkbox";
