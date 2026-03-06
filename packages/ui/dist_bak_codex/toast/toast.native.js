import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { Modal, Pressable, Text as NativeText, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { Button } from "../button/button.native";
import { CheckIcon, CloseIcon } from "../icons/index.native";
import { ToastProviderStore, useToast, useToastState, useToastStore, } from "./toast.shared";
export function ToastProvider({ children, ...props }) {
    const store = useToastState();
    return (_jsx(ToastProviderStore, { value: store, children: _jsx(View, { ...props, children: children }) }));
}
export function ToastViewport({ style, ...props }) {
    const store = useToastStore();
    const theme = useTheme();
    return (_jsx(Modal, { transparent: true, visible: store.toasts.length > 0, children: _jsx(View, { style: [
                {
                    bottom: 16,
                    gap: 12,
                    left: 16,
                    position: "absolute",
                    right: 16,
                },
                style,
            ], ...props, children: store.toasts.map((toast) => (_jsxs(View, { style: {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.lg,
                    borderWidth: 1,
                    flexDirection: "row",
                    gap: 12,
                    padding: 16,
                }, children: [_jsx(View, { style: {
                            alignItems: "center",
                            backgroundColor: toast.variant === "success"
                                ? theme.colors.primaryMuted
                                : toast.variant === "warning"
                                    ? theme.colors.accentMuted
                                    : toast.variant === "destructive"
                                        ? theme.colors.destructiveMuted
                                        : theme.colors.surfaceMuted,
                            borderColor: theme.colors.border,
                            borderRadius: 999,
                            borderWidth: 1,
                            height: 36,
                            justifyContent: "center",
                            width: 36,
                        }, children: toast.variant === "destructive" ? (_jsx(CloseIcon, { color: theme.colors.destructive, size: 14, strokeWidth: 2.2 })) : (_jsx(CheckIcon, { color: toast.variant === "warning"
                                ? theme.colors.accent
                                : toast.variant === "success"
                                    ? theme.colors.primary
                                    : theme.colors.foregroundMuted, size: 14, strokeWidth: 2.2 })) }), _jsxs(View, { style: { flex: 1 }, children: [_jsx(ToastTitle, { children: toast.title }), toast.description ? _jsx(ToastDescription, { children: toast.description }) : null, _jsxs(View, { style: { flexDirection: "row", gap: 8, marginTop: 12 }, children: [toast.actionLabel ? (_jsx(ToastAction, { onPress: () => {
                                            toast.action?.();
                                            store.dismissToast(toast.id);
                                        }, children: toast.actionLabel })) : null, _jsx(ToastClose, { onPress: () => store.dismissToast(toast.id) })] })] })] }, toast.id))) }) }));
}
export function Toast({ children, style, ...props }) {
    const theme = useTheme();
    return (_jsx(View, { style: [
            {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                borderWidth: 1,
                flexDirection: "row",
                padding: 16,
            },
            style,
        ], ...props, children: children }));
}
export function ToastTitle({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(NativeText, { style: [
            {
                color: theme.colors.foreground,
                fontFamily: theme.typography.family.sans,
                fontSize: theme.typography.size.sm,
                fontWeight: "600",
                lineHeight: 20,
            },
            style,
        ], ...props }));
}
export function ToastDescription({ style, ...props }) {
    const theme = useTheme();
    return (_jsx(NativeText, { style: [
            {
                color: theme.colors.foregroundMuted,
                fontFamily: theme.typography.family.sans,
                fontSize: theme.typography.size.sm,
                lineHeight: 20,
                marginTop: 4,
            },
            style,
        ], ...props }));
}
export function ToastAction(props) {
    return _jsx(Button, { size: "sm", variant: "secondary", ...props });
}
export function ToastClose({ children, ...props }) {
    const theme = useTheme();
    return (_jsx(Pressable, { accessibilityLabel: "Dismiss toast", style: [
            {
                alignItems: "center",
                borderColor: theme.colors.border,
                borderRadius: 999,
                borderWidth: 1,
                justifyContent: "center",
                minHeight: 32,
                minWidth: 32,
            },
        ], ...props, children: _jsx(NativeText, { style: { color: theme.colors.foregroundMuted, fontWeight: "600" }, children: children ?? "×" }) }));
}
export function Toaster() {
    return _jsx(ToastViewport, {});
}
export const Sonner = Toaster;
export function useSonner() {
    return useToast();
}
export { useToast };
