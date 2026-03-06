import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveButtonVariants } from "./button.shared";
export const Button = React.forwardRef(({ children, disabled, size, style, textStyle, variant, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveButtonVariants({ size, variant });
    const styles = React.useMemo(() => {
        const common = {
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: theme.space.sm,
            borderWidth: resolved.variant === "outline" ? 1 : 0,
            borderColor: resolved.variant === "outline" ? theme.colors.borderStrong : "transparent",
        };
        const sizeStyle = {
            sm: {
                minHeight: 36,
                paddingHorizontal: 14,
                borderRadius: theme.radius.md,
            },
            md: {
                minHeight: 40,
                paddingHorizontal: 16,
                borderRadius: theme.radius.md,
            },
            lg: {
                minHeight: 44,
                paddingHorizontal: 20,
                borderRadius: theme.radius.lg,
            },
            icon: {
                width: 40,
                height: 40,
                borderRadius: theme.radius.md,
            },
        };
        const toneStyle = {
            default: {
                backgroundColor: theme.colors.primary,
                shadowColor: "#0f172a",
                shadowOpacity: 0.18,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
                elevation: 2,
            },
            secondary: {
                backgroundColor: theme.colors.secondaryMuted,
            },
            destructive: {
                backgroundColor: theme.colors.destructive,
            },
            ghost: {
                backgroundColor: "transparent",
            },
            outline: {
                backgroundColor: theme.colors.surface,
            },
            link: {
                backgroundColor: "transparent",
                paddingHorizontal: 0,
                minHeight: 0,
            },
        };
        const labelStyle = {
            default: {
                color: theme.colors.foregroundOnBrand,
            },
            secondary: {
                color: theme.colors.foreground,
            },
            destructive: {
                color: theme.colors.foregroundOnBrand,
            },
            ghost: {
                color: theme.colors.foreground,
            },
            outline: {
                color: theme.colors.foreground,
            },
            link: {
                color: theme.colors.primary,
                textDecorationLine: "underline",
            },
        };
        const labelSizeStyle = {
            sm: {
                fontSize: 13,
            },
            md: {
                fontSize: theme.typography.size.sm,
            },
            lg: {
                fontSize: 15,
            },
            icon: {
                fontSize: theme.typography.size.sm,
            },
        };
        return {
            container: [common, sizeStyle[resolved.size], toneStyle[resolved.variant]],
            label: [
                {
                    fontFamily: theme.typography.family.sans,
                    fontWeight: theme.typography.weight.semibold,
                    letterSpacing: -0.2,
                },
                labelSizeStyle[resolved.size],
                labelStyle[resolved.variant],
            ],
            pressed: {
                opacity: 0.92,
            },
            disabled: {
                opacity: 0.45,
            },
        };
    }, [resolved.size, resolved.variant, theme]);
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "button", disabled: disabled, style: ({ pressed }) => [
            ...styles.container,
            pressed && styles.pressed,
            disabled && styles.disabled,
            style,
        ], ...props, children: renderButtonChildren(children, [styles.label, textStyle]) }));
});
Button.displayName = "Button";
function renderButtonChildren(children, textStyle) {
    return React.Children.map(children, (child) => {
        if (typeof child === "string" || typeof child === "number") {
            return _jsx(Text, { style: textStyle, children: child });
        }
        return child;
    });
}
