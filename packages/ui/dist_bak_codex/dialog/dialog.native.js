import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Modal, Pressable, Text, View, } from "react-native";
import { CloseIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import { DialogProvider, useDialogContext, useDialogController, } from "./dialog.shared";
export function Dialog({ children, defaultOpen, onOpenChange, open }) {
    const controller = useDialogController({ defaultOpen, onOpenChange, open });
    return _jsx(DialogProvider, { value: controller, children: children });
}
export const DialogTrigger = React.forwardRef(({ children, onPress, style, asChild, ...props }, ref) => {
    const context = useDialogContext();
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
DialogTrigger.displayName = "DialogTrigger";
export const DialogClose = React.forwardRef(({ children, onPress, style, asChild, ...props }, ref) => {
    const context = useDialogContext();
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
DialogClose.displayName = "DialogClose";
export const DialogContent = React.forwardRef(({ children, hideClose = false, modalProps, style, ...props }, ref) => {
    const context = useDialogContext();
    const theme = useTheme();
    if (!context.open) {
        return null;
    }
    return (_jsx(Modal, { transparent: true, animationType: "fade", visible: context.open, onRequestClose: () => context.setOpen(false), ...modalProps, children: _jsx(Pressable, { style: {
                flex: 1,
                paddingHorizontal: 16,
                paddingVertical: 24,
                justifyContent: "center",
                backgroundColor: "rgba(15,23,42,0.42)",
            }, onPress: () => context.setOpen(false), children: _jsx(Pressable, { onPress: (event) => event.stopPropagation(), style: {
                    alignSelf: "center",
                    width: "100%",
                    maxWidth: 520,
                }, children: _jsxs(View, { ref: ref, style: [
                        {
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            borderRadius: theme.radius.xl,
                            backgroundColor: theme.colors.surface,
                            padding: 24,
                            gap: 12,
                        },
                        style,
                    ], ...props, children: [!hideClose ? (_jsx(Pressable, { accessibilityRole: "button", onPress: () => context.setOpen(false), style: {
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
                            }, children: _jsx(CloseIcon, { size: 16 }) })) : null, children] }) }) }) }));
});
DialogContent.displayName = "DialogContent";
export const DialogHeader = React.forwardRef(({ style, ...props }, ref) => (_jsx(View, { ref: ref, style: [{ gap: 8 }, style], ...props })));
DialogHeader.displayName = "DialogHeader";
export const DialogTitle = React.forwardRef(({ style, ...props }, ref) => {
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
DialogTitle.displayName = "DialogTitle";
export const DialogDescription = React.forwardRef(({ style, ...props }, ref) => {
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
DialogDescription.displayName = "DialogDescription";
export const DialogFooter = React.forwardRef(({ style, ...props }, ref) => (_jsx(View, { ref: ref, style: [{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 12 }, style], ...props })));
DialogFooter.displayName = "DialogFooter";
