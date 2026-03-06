import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveCardVariants } from "./card.shared";
export const Card = React.forwardRef(({ style, variant, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveCardVariants({ variant });
    const cardStyle = React.useMemo(() => {
        const common = {
            borderRadius: theme.radius.xl,
            borderWidth: 1,
        };
        const toneStyle = {
            default: {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                shadowColor: "#0f172a",
                shadowOpacity: 0.06,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 2,
            },
            elevated: {
                borderColor: "transparent",
                backgroundColor: theme.colors.surfaceRaised,
                shadowColor: "#0f172a",
                shadowOpacity: 0.12,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 5,
            },
            interactive: {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                shadowColor: "#0f172a",
                shadowOpacity: 0.08,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 6 },
                elevation: 3,
            },
            muted: {
                borderColor: "transparent",
                backgroundColor: theme.colors.surfaceMuted,
            },
            accent: {
                borderColor: theme.colors.accent,
                backgroundColor: theme.colors.accentMuted,
                shadowColor: theme.colors.accent,
                shadowOpacity: 0.12,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 5 },
                elevation: 3,
            },
        };
        return {
            ...common,
            ...toneStyle[resolved.variant],
        };
    }, [resolved.variant, theme]);
    return _jsx(View, { ref: ref, style: [cardStyle, style], ...props });
});
Card.displayName = "Card";
export const CardHeader = React.forwardRef(({ style, ...props }, ref) => (_jsx(View, { ref: ref, style: [
        {
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 12,
            gap: 6,
        },
        style,
    ], ...props })));
CardHeader.displayName = "CardHeader";
export const CardTitle = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(Text, { ref: ref, style: [
            {
                color: theme.colors.foreground,
                fontFamily: theme.typography.family.sans,
                fontWeight: theme.typography.weight.semibold,
                fontSize: theme.typography.size.lg,
                letterSpacing: -0.3,
            },
            style,
        ], ...props }));
});
CardTitle.displayName = "CardTitle";
export const CardDescription = React.forwardRef(({ style, ...props }, ref) => {
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
CardDescription.displayName = "CardDescription";
export const CardContent = React.forwardRef(({ style, ...props }, ref) => (_jsx(View, { ref: ref, style: [
        {
            paddingHorizontal: 24,
            paddingBottom: 24,
        },
        style,
    ], ...props })));
CardContent.displayName = "CardContent";
export const CardFooter = React.forwardRef(({ style, ...props }, ref) => (_jsx(View, { ref: ref, style: [
        {
            paddingHorizontal: 24,
            paddingBottom: 24,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        style,
    ], ...props })));
CardFooter.displayName = "CardFooter";
