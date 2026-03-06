import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveAlertVariants } from "./alert.shared";
export const Alert = React.forwardRef(({ style, variant, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveAlertVariants({ variant });
    const alertStyle = React.useMemo(() => {
        const tones = {
            default: {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
            },
            destructive: {
                borderColor: theme.colors.destructive,
                backgroundColor: theme.colors.destructiveMuted,
            },
            success: {
                borderColor: theme.colors.accent,
                backgroundColor: theme.colors.accentMuted,
            },
            warning: {
                borderColor: "#d97706",
                backgroundColor: "rgba(245,158,11,0.14)",
            },
        };
        return {
            borderWidth: 1,
            borderRadius: theme.radius.lg,
            paddingHorizontal: 16,
            paddingVertical: 14,
            gap: 6,
            ...tones[resolved.variant],
        };
    }, [resolved.variant, theme]);
    return _jsx(View, { ref: ref, style: [alertStyle, style], ...props });
});
Alert.displayName = "Alert";
export const AlertTitle = React.forwardRef(({ style, variant, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveAlertVariants({ variant });
    const color = resolved.variant === "destructive"
        ? theme.colors.destructive
        : resolved.variant === "success"
            ? theme.colors.accent
            : resolved.variant === "warning"
                ? "#b45309"
                : theme.colors.foreground;
    return (_jsx(Text, { ref: ref, style: [
            {
                color,
                fontFamily: theme.typography.family.sans,
                fontSize: theme.typography.size.sm,
                fontWeight: theme.typography.weight.semibold,
                letterSpacing: -0.2,
            },
            style,
        ], ...props }));
});
AlertTitle.displayName = "AlertTitle";
export const AlertDescription = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(Text, { ref: ref, style: [
            {
                color: theme.colors.foregroundMuted,
                fontFamily: theme.typography.family.sans,
                fontSize: theme.typography.size.sm,
                lineHeight: theme.typography.size.sm * theme.typography.lineHeight.relaxed,
            },
            style,
        ], ...props }));
});
AlertDescription.displayName = "AlertDescription";
