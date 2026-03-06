import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { TabsProvider, useTabsContext, useTabsController, } from "./tabs.shared";
export function Tabs({ children, defaultValue, onValueChange, style, value, ...props }) {
    const controller = useTabsController({ defaultValue, onValueChange, value });
    return (_jsx(TabsProvider, { value: controller, children: _jsx(View, { style: [
                {
                    gap: 16,
                },
                style,
            ], ...props, children: children }) }));
}
export const TabsList = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(View, { ref: ref, style: [
            {
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                padding: 4,
                borderRadius: theme.radius.lg + 2,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.backgroundSubtle,
            },
            style,
        ], ...props }));
});
TabsList.displayName = "TabsList";
export const TabsTrigger = React.forwardRef(({ children, disabled, style, textStyle, value, ...props }, ref) => {
    const context = useTabsContext();
    const theme = useTheme();
    const isActive = context.value === value;
    const containerStyle = {
        minWidth: 104,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.radius.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: isActive ? theme.colors.surface : "transparent",
    };
    const labelStyle = {
        color: isActive ? theme.colors.foreground : theme.colors.foregroundMuted,
        fontFamily: theme.typography.family.sans,
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weight.medium,
        letterSpacing: -0.2,
    };
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "tab", accessibilityState: { disabled: disabled || undefined, selected: isActive }, disabled: disabled, onPress: () => {
            context.setValue(value);
        }, style: ({ pressed }) => [
            containerStyle,
            isActive && {
                shadowColor: "#0f172a",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 2,
            },
            pressed && {
                opacity: 0.92,
            },
            disabled && {
                opacity: 0.45,
            },
            style,
        ], ...props, children: renderTabsText(children, [labelStyle, textStyle]) }));
});
TabsTrigger.displayName = "TabsTrigger";
export const TabsContent = React.forwardRef(({ children, forceMount, style, value, ...props }, ref) => {
    const context = useTabsContext();
    const theme = useTheme();
    const isActive = context.value === value;
    if (!isActive && !forceMount) {
        return null;
    }
    return (_jsx(View, { ref: ref, style: [
            {
                borderRadius: theme.radius.xl,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                padding: 20,
            },
            !isActive && {
                display: "none",
            },
            style,
        ], ...props, children: children }));
});
TabsContent.displayName = "TabsContent";
function renderTabsText(children, textStyle) {
    return React.Children.map(children, (child) => {
        if (typeof child === "string" || typeof child === "number") {
            return _jsx(Text, { style: textStyle, children: child });
        }
        return child;
    });
}
