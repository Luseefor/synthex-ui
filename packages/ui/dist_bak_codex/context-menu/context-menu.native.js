import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Pressable, Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { ContextMenuProvider, useContextMenuContext, useContextMenuController, } from "./context-menu.shared";
export function ContextMenu({ children, defaultOpen, onOpenChange, open, style, ...props }) {
    const controller = useContextMenuController({ defaultOpen, onOpenChange, open });
    return (_jsx(ContextMenuProvider, { value: controller, children: _jsx(View, { style: [{ position: "relative" }, style], ...props, children: children }) }));
}
export const ContextMenuTrigger = React.forwardRef(({ children, onLongPress, style, ...props }, ref) => {
    const context = useContextMenuContext();
    return (_jsx(Pressable, { ref: ref, onLongPress: (event) => {
            context.setOpen(true);
            onLongPress?.(event);
        }, style: style, ...props, children: children }));
});
ContextMenuTrigger.displayName = "ContextMenuTrigger";
export const ContextMenuContent = React.forwardRef(({ style, ...props }, ref) => {
    const context = useContextMenuContext();
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
ContextMenuContent.displayName = "ContextMenuContent";
export const ContextMenuLabel = React.forwardRef(({ children, style, textStyle, ...props }, ref) => {
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
ContextMenuLabel.displayName = "ContextMenuLabel";
export const ContextMenuSeparator = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(View, { ref: ref, style: [{ marginVertical: 4, height: 1, backgroundColor: theme.colors.border }, style], ...props }));
});
ContextMenuSeparator.displayName = "ContextMenuSeparator";
export const ContextMenuItem = React.forwardRef(({ children, onPress, style, textStyle, ...props }, ref) => {
    const context = useContextMenuContext();
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
ContextMenuItem.displayName = "ContextMenuItem";
