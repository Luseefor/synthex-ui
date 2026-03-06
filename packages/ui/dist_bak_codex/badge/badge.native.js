import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveBadgeVariants } from "./badge.shared";
export function Badge({ children, style, textStyle, variant, ...props }) {
    const theme = useTheme();
    const resolved = resolveBadgeVariants({ variant });
    const containerStyle = {
        alignSelf: "flex-start",
        borderRadius: theme.radius.pill,
        borderWidth: resolved.variant === "outline" ? 1 : 0,
        borderColor: resolved.variant === "outline" ? theme.colors.borderStrong : "transparent",
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: {
            default: theme.colors.primaryMuted,
            secondary: theme.colors.secondaryMuted,
            destructive: theme.colors.destructiveMuted,
            outline: "transparent",
        }[resolved.variant],
    };
    const labelStyle = {
        color: {
            default: theme.colors.primary,
            secondary: theme.colors.foreground,
            destructive: theme.colors.destructive,
            outline: theme.colors.foreground,
        }[resolved.variant],
        fontFamily: theme.typography.family.sans,
        fontSize: 11,
        fontWeight: theme.typography.weight.bold,
        letterSpacing: 0.8,
        textTransform: "uppercase",
    };
    return (_jsx(View, { style: [containerStyle, style], ...props, children: renderBadgeText(children, [labelStyle, textStyle]) }));
}
function renderBadgeText(children, textStyle) {
    return React.Children.map(children, (child) => {
        if (typeof child === "string" || typeof child === "number") {
            return _jsx(Text, { style: textStyle, children: child });
        }
        return child;
    });
}
