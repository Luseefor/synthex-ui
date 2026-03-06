import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { DropdownMenuProvider, useDropdownMenuContext, useDropdownMenuController, } from "./dropdown-menu.shared";
export function DropdownMenu({ children, defaultOpen, onOpenChange, open, style, ...props }) {
    const controller = useDropdownMenuController({ defaultOpen, onOpenChange, open });
    return (_jsx(DropdownMenuProvider, { value: controller, children: _jsx(View, { style: [{ position: "relative" }, style], ...props, children: children }) }));
}
export const DropdownMenuTrigger = React.forwardRef(({ children, onPress, style, asChild, ...props }, ref) => {
    const context = useDropdownMenuContext();
    const handlePress = React.useCallback((event) => {
        context.setOpen(!context.open);
        onPress?.(event);
    }, [context, onPress]);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ref,
            ...props,
            accessibilityRole: "button",
            accessibilityState: { expanded: context.open },
            onPress: (e) => {
                handlePress(e);
                children.props.onPress?.(e);
            },
        });
    }
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "button", accessibilityState: { expanded: context.open }, onPress: handlePress, style: style, ...props, children: children }));
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";
export const DropdownMenuContent = React.forwardRef(({ style, ...props }, ref) => {
    const context = useDropdownMenuContext();
    const theme = useTheme();
    if (!context.open) {
        return null;
    }
    return (_jsx(View, { ref: ref, style: [
            {
                marginTop: 8,
                minWidth: 224,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg + 2,
                backgroundColor: theme.colors.surface,
                padding: 6,
                gap: 4,
            },
            style,
        ], ...props }));
});
DropdownMenuContent.displayName = "DropdownMenuContent";
export const DropdownMenuLabel = React.forwardRef(({ children, style, textStyle, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(View, { ref: ref, style: [{ paddingHorizontal: 12, paddingVertical: 8 }, style], ...props, children: _jsx(Text, { style: [
                {
                    color: theme.colors.foregroundMuted,
                    fontFamily: theme.typography.family.sans,
                    fontSize: 11,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                },
                textStyle,
            ], children: children }) }));
});
DropdownMenuLabel.displayName = "DropdownMenuLabel";
export const DropdownMenuSeparator = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(View, { ref: ref, style: [{ marginVertical: 4, height: 1, backgroundColor: theme.colors.border }, style], ...props }));
});
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
export const DropdownMenuItem = React.forwardRef(({ children, onPress, style, textStyle, ...props }, ref) => {
    const context = useDropdownMenuContext();
    const theme = useTheme();
    return (_jsx(Pressable, { ref: ref, accessibilityRole: "button", onPress: (event) => {
            onPress?.(event);
            context.setOpen(false);
        }, style: ({ pressed }) => [
            {
                minHeight: 40,
                borderRadius: theme.radius.md,
                justifyContent: "center",
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: pressed ? theme.colors.surfaceMuted : "transparent",
            },
            style,
        ], ...props, children: typeof children === "string" || typeof children === "number" ? (_jsx(Text, { style: [
                {
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.family.sans,
                    fontSize: theme.typography.size.sm,
                },
                textStyle,
            ], children: children })) : (children) }));
});
DropdownMenuItem.displayName = "DropdownMenuItem";
