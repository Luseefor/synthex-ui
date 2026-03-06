import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, } from "react-native";
import { useControllableState } from "../hooks/useControllableState";
import { useTheme } from "../_shared/theme/context";
import { resolveToggleVariants } from "./toggle.shared";
export const Toggle = React.forwardRef(({ children, defaultPressed = false, onPress, onPressedChange, pressed, size, style, textStyle, variant, ...props }, ref) => {
    const theme = useTheme();
    const [currentPressed, setCurrentPressed] = useControllableState({
        defaultValue: defaultPressed,
        onChange: onPressedChange,
        value: pressed,
    });
    const resolved = resolveToggleVariants({ size, variant });
    const containerStyle = React.useMemo(() => {
        const sizeStyle = {
            sm: { minHeight: 36, paddingHorizontal: 14, borderRadius: theme.radius.md },
            md: { minHeight: 40, paddingHorizontal: 16, borderRadius: theme.radius.md },
            lg: { minHeight: 44, paddingHorizontal: 20, borderRadius: theme.radius.lg },
        };
        const toneStyle = resolved.variant === "default"
            ? currentPressed
                ? { backgroundColor: theme.colors.primary }
                : { backgroundColor: theme.colors.secondaryMuted }
            : {
                backgroundColor: currentPressed
                    ? theme.colors.primaryMuted
                    : theme.colors.surface,
                borderWidth: 1,
                borderColor: currentPressed ? theme.colors.primary : theme.colors.borderStrong,
            };
        return {
            alignItems: "center",
            justifyContent: "center",
            ...sizeStyle[resolved.size],
            ...toneStyle,
        };
    }, [currentPressed, resolved.size, resolved.variant, theme]);
    const labelStyle = React.useMemo(() => ({
        color: resolved.variant === "default" && currentPressed
            ? theme.colors.foregroundOnBrand
            : currentPressed
                ? theme.colors.primary
                : theme.colors.foreground,
        fontFamily: theme.typography.family.sans,
        fontSize: resolved.size === "sm"
            ? 13
            : resolved.size === "lg"
                ? 15
                : theme.typography.size.sm,
        fontWeight: theme.typography.weight.semibold,
        letterSpacing: -0.2,
    }), [currentPressed, resolved.size, resolved.variant, theme]);
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "button", accessibilityState: { selected: currentPressed }, onPress: (event) => {
            onPress?.(event);
            if (event.defaultPrevented) {
                return;
            }
            setCurrentPressed(!currentPressed);
        }, style: ({ pressed: isPressed }) => [
            containerStyle,
            isPressed && { opacity: 0.92 },
            style,
        ], ...props, children: typeof children === "string" || typeof children === "number" ? (_jsx(Text, { style: [labelStyle, textStyle], children: children })) : (children) }));
});
Toggle.displayName = "Toggle";
