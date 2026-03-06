import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { NavigationMenuItemProvider, NavigationMenuProvider, useNavigationMenuContext, useNavigationMenuController, useNavigationMenuItemContext, } from "./navigation-menu.shared";
export function NavigationMenu({ children, defaultValue, onValueChange, style, value, ...props }) {
    const controller = useNavigationMenuController({ defaultValue, onValueChange, value });
    return (_jsx(NavigationMenuProvider, { value: controller, children: _jsx(View, { style: [{ gap: 16 }, style], ...props, children: children }) }));
}
export const NavigationMenuList = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(View, { ref: ref, style: [
            {
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                padding: 8,
                borderRadius: theme.radius.lg + 2,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.backgroundSubtle,
            },
            style,
        ], ...props }));
});
NavigationMenuList.displayName = "NavigationMenuList";
export const NavigationMenuItem = React.forwardRef(({ children, style, value, ...props }, ref) => (_jsx(NavigationMenuItemProvider, { value: { value }, children: _jsx(View, { ref: ref, style: style, ...props, children: children }) })));
NavigationMenuItem.displayName = "NavigationMenuItem";
export const NavigationMenuTrigger = React.forwardRef(({ children, onPress, style, textStyle, ...props }, ref) => {
    const context = useNavigationMenuContext();
    const item = useNavigationMenuItemContext();
    const theme = useTheme();
    const isActive = context.value === item.value;
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "button", accessibilityState: { expanded: isActive }, onPress: (event) => {
            context.setValue(context.value === item.value ? "" : item.value);
            onPress?.(event);
        }, style: ({ pressed }) => [
            {
                minWidth: 112,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: theme.radius.md,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: isActive ? theme.colors.surface : "transparent",
                opacity: pressed ? 0.94 : 1,
            },
            style,
        ], ...props, children: _jsx(Text, { style: [
                {
                    color: isActive ? theme.colors.foreground : theme.colors.foregroundMuted,
                    fontFamily: theme.typography.family.sans,
                    fontSize: theme.typography.size.sm,
                    fontWeight: theme.typography.weight.medium,
                },
                textStyle,
            ], children: children }) }));
});
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";
export const NavigationMenuLink = React.forwardRef(({ children, style, textStyle, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(Pressable, { ref: ref, style: ({ pressed }) => [
            {
                minWidth: 112,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: theme.radius.md,
                paddingHorizontal: 12,
                paddingVertical: 10,
                opacity: pressed ? 0.94 : 1,
            },
            style,
        ], ...props, children: _jsx(Text, { style: [
                {
                    color: theme.colors.foregroundMuted,
                    fontFamily: theme.typography.family.sans,
                    fontSize: theme.typography.size.sm,
                    fontWeight: theme.typography.weight.medium,
                },
                textStyle,
            ], children: children }) }));
});
NavigationMenuLink.displayName = "NavigationMenuLink";
export const NavigationMenuContent = React.forwardRef(({ children, style, ...props }, ref) => {
    const context = useNavigationMenuContext();
    const item = useNavigationMenuItemContext();
    const theme = useTheme();
    const isActive = context.value === item.value;
    if (!isActive) {
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
            style,
        ], ...props, children: children }));
});
NavigationMenuContent.displayName = "NavigationMenuContent";
