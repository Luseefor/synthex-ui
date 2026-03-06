import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
const ToastContext = React.createContext(null);
export function useToastStore() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error("Toast components must be used within <ToastProvider>.");
    }
    return context;
}
export function useToastState() {
    const [toasts, setToasts] = React.useState([]);
    const dismissToast = React.useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);
    const removeToast = dismissToast;
    const pushToast = React.useCallback((toast) => {
        const id = globalThis.crypto?.randomUUID?.() ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setToasts((current) => [...current, { ...toast, id }]);
        return id;
    }, []);
    return React.useMemo(() => ({
        dismissToast,
        pushToast,
        removeToast,
        toasts,
    }), [dismissToast, pushToast, removeToast, toasts]);
}
export function ToastProviderStore({ children, value, }) {
    return _jsx(ToastContext.Provider, { value: value, children: children });
}
export function useToast() {
    const store = useToastStore();
    return React.useMemo(() => ({
        dismiss: store.dismissToast,
        toast: store.pushToast,
        toasts: store.toasts,
    }), [store]);
}
