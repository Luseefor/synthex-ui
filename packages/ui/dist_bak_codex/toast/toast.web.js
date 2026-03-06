import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { Button } from "../button/button.web";
import { CheckIcon, CloseIcon } from "../icons/index.web";
import { ToastProviderStore, useToast, useToastState, useToastStore, } from "./toast.shared";
export function ToastProvider({ children, ...props }) {
    const store = useToastState();
    return (_jsx(ToastProviderStore, { value: store, children: _jsx("div", { ...props, children: children }) }));
}
export const ToastViewport = React.forwardRef(({ className, ...props }, ref) => {
    const store = useToastStore();
    return (_jsx("div", { ref: ref, "data-slot": "toast-viewport", className: cn("fixed bottom-0 right-0 z-[100] flex w-full max-w-[420px] flex-col-reverse gap-2 p-4 sm:bottom-4 sm:right-4 sm:flex-col", className), ...props, children: store.toasts.map((toast) => (_jsxs(Toast, { duration: toast.duration, variant: toast.variant, children: [_jsxs("div", { className: "flex flex-1 flex-col gap-1", children: [_jsx(ToastTitle, { children: toast.title }), toast.description ? (_jsx(ToastDescription, { children: toast.description })) : null] }), _jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [toast.actionLabel ? (_jsx(ToastAction, { onClick: () => {
                                toast.action?.();
                                store.dismissToast(toast.id);
                            }, children: toast.actionLabel })) : null, _jsx(ToastClose, { onClick: () => store.dismissToast(toast.id) })] })] }, toast.id))) }));
});
ToastViewport.displayName = "ToastViewport";
export const Toast = React.forwardRef(({ children, className, duration = 5000, onOpenChange, open = true, variant = "default", ...props }, ref) => {
    const [visible, setVisible] = React.useState(open);
    const [exiting, setExiting] = React.useState(false);
    React.useEffect(() => {
        setVisible(open);
    }, [open]);
    React.useEffect(() => {
        if (!visible || !duration) {
            return;
        }
        const timeout = window.setTimeout(() => {
            setExiting(true);
            window.setTimeout(() => {
                setVisible(false);
                onOpenChange?.(false);
            }, 200);
        }, duration);
        return () => {
            window.clearTimeout(timeout);
        };
    }, [duration, onOpenChange, visible]);
    if (!visible) {
        return null;
    }
    const variantClasses = variant === "success"
        ? "border-l-[3px] border-l-emerald-500"
        : variant === "warning"
            ? "border-l-[3px] border-l-amber-500"
            : variant === "destructive"
                ? "border-l-[3px] border-l-[color:var(--sx-color-destructive)]"
                : "border-l-[3px] border-l-[color:var(--sx-color-primary)]";
    const iconBg = variant === "success"
        ? "bg-emerald-500/10 text-emerald-600"
        : variant === "warning"
            ? "bg-amber-500/10 text-amber-600"
            : variant === "destructive"
                ? "bg-[color:var(--sx-color-destructive-muted)] text-[color:var(--sx-color-destructive)]"
                : "bg-[color:var(--sx-color-primary-muted)] text-[color:var(--sx-color-primary)]";
    return (_jsxs("div", { ref: ref, role: "status", "data-state": exiting ? "closed" : "open", className: cn("group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-4 shadow-[var(--sx-shadow-toast)]", variantClasses, exiting
            ? "animate-[sx-toast-exit_200ms_var(--sx-easing-standard)_forwards]"
            : "animate-[sx-toast-enter_300ms_var(--sx-easing-emphasized)]", className), ...props, children: [_jsx("div", { className: cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full", iconBg), children: variant === "destructive" ? _jsx(CloseIcon, { size: 14, strokeWidth: 2.5 }) : _jsx(CheckIcon, { size: 14, strokeWidth: 2.5 }) }), _jsx("div", { className: "flex flex-1 items-center justify-between gap-4 min-w-0", children: children })] }));
});
Toast.displayName = "Toast";
export function ToastTitle({ className, ...props }) {
    return (_jsx("div", { className: cn("text-sm font-semibold leading-5 tracking-[-0.01em] text-[color:var(--sx-color-foreground)]", className), ...props }));
}
export function ToastDescription({ className, ...props }) {
    return (_jsx("p", { className: cn("text-[13px] leading-5 text-[color:var(--sx-color-foreground-muted)]", className), ...props }));
}
export function ToastAction({ className, type = "button", ...props }) {
    return (_jsx(Button, { type: type, size: "sm", variant: "outline", className: cn("h-7 shrink-0 rounded-[var(--sx-radius-md)] text-xs font-medium", className), ...props }));
}
export function ToastClose({ className, type = "button", ...props }) {
    return (_jsx("button", { type: type, "aria-label": "Dismiss toast", className: cn("inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--sx-radius-sm)] text-[color:var(--sx-color-foreground-muted)] opacity-0 transition-all duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] hover:text-[color:var(--sx-color-foreground)] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)]", className), ...props, children: _jsx(CloseIcon, { size: 14 }) }));
}
export function Toaster() {
    return _jsx(ToastViewport, {});
}
export const Sonner = Toaster;
export function useSonner() {
    return useToast();
}
export { useToast };
