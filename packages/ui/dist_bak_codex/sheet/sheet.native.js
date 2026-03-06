import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Modal, Pressable, Text, View, } from "react-native";
import { CloseIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import { DialogProvider as SheetProvider, useDialogContext as useSheetContext, useDialogController as useSheetController, } from "../dialog/dialog.shared";
export function Sheet({ children, defaultOpen, onOpenChange, open }) {
    const controller = useSheetController({ defaultOpen, onOpenChange, open });
    return _jsx(SheetProvider, { value: controller, children: children });
}
export const SheetTrigger = React.forwardRef(({ children, onPress, style, asChild, ...props }, ref) => {
    const context = useSheetContext();
    const handlePress = React.useCallback((event) => {
        context.setOpen(true);
        onPress?.(event);
    }, [context, onPress]);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ref,
            ...props,
            onPress: (e) => {
                handlePress(e);
                children.props.onPress?.(e);
            },
        });
    }
    return (_jsx(Pressable, { ref: ref, onPress: handlePress, style: style, ...props, children: children }));
});
SheetTrigger.displayName = "SheetTrigger";
export const SheetClose = React.forwardRef(({ children, onPress, style, asChild, ...props }, ref) => {
    const context = useSheetContext();
    const handlePress = React.useCallback((event) => {
        context.setOpen(false);
        onPress?.(event);
    }, [context, onPress]);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ref,
            ...props,
            onPress: (e) => {
                handlePress(e);
                children.props.onPress?.(e);
            },
        });
    }
    return (_jsx(Pressable, { ref: ref, onPress: handlePress, style: style, ...props, children: children }));
});
SheetClose.displayName = "SheetClose";
export const SheetContent = React.forwardRef(({ children, side = "right", style, ...props }, ref) => {
    const context = useSheetContext();
    const theme = useTheme();
    if (!context.open) {
        return null;
    }
    return (_jsx(Modal, { transparent: true, animationType: "fade", visible: context.open, onRequestClose: () => context.setOpen(false), children: _jsx(Pressable, { style: {
                flex: 1,
                backgroundColor: "rgba(15,23,42,0.38)",
            }, onPress: () => context.setOpen(false), children: _jsx(Pressable, { style: {
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    [side]: 0,
                    width: "100%",
                    maxWidth: 420,
                }, onPress: (event) => event.stopPropagation(), children: _jsxs(View, { ref: ref, style: [
                        {
                            flex: 1,
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surface,
                            padding: 24,
                        },
                        side === "right"
                            ? { borderLeftWidth: 1 }
                            : { borderRightWidth: 1 },
                        style,
                    ], ...props, children: [_jsx(Pressable, { accessibilityRole: "button", onPress: () => context.setOpen(false), style: {
                                position: "absolute",
                                right: 16,
                                top: 16,
                                width: 36,
                                height: 36,
                                borderRadius: 999,
                                borderWidth: 1,
                                borderColor: theme.colors.border,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: theme.colors.surface,
                            }, children: _jsx(CloseIcon, { size: 16 }) }), children] }) }) }) }));
});
SheetContent.displayName = "SheetContent";
export const SheetHeader = React.forwardRef(({ style, ...props }, ref) => _jsx(View, { ref: ref, style: [{ gap: 8 }, style], ...props }));
SheetHeader.displayName = "SheetHeader";
export const SheetTitle = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    return (_jsx(Text, { ref: ref, style: [
            {
                color: theme.colors.foreground,
                fontFamily: theme.typography.family.sans,
                fontSize: theme.typography.size.xl,
                fontWeight: theme.typography.weight.semibold,
                letterSpacing: -0.4,
            },
            style,
        ], ...props }));
});
SheetTitle.displayName = "SheetTitle";
export const SheetDescription = React.forwardRef(({ style, ...props }, ref) => {
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
SheetDescription.displayName = "SheetDescription";
export const SheetFooter = React.forwardRef(({ style, ...props }, ref) => (_jsx(View, { ref: ref, style: [{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 12 }, style], ...props })));
SheetFooter.displayName = "SheetFooter";
