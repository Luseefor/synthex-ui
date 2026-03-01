import * as React from "react";

export interface ToastSharedProps {
  readonly duration?: number;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}

export interface ToastDescriptor {
  readonly actionLabel?: string;
  readonly description?: React.ReactNode;
  readonly duration?: number;
  readonly id: string;
  readonly title: React.ReactNode;
}

interface ToastContextValue {
  readonly dismissToast: (id: string) => void;
  readonly pushToast: (toast: Omit<ToastDescriptor, "id">) => string;
  readonly removeToast: (id: string) => void;
  readonly toasts: readonly ToastDescriptor[];
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToastStore() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("Toast components must be used within <ToastProvider>.");
  }

  return context;
}

export function useToastState() {
  const [toasts, setToasts] = React.useState<readonly ToastDescriptor[]>([]);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const removeToast = dismissToast;

  const pushToast = React.useCallback((toast: Omit<ToastDescriptor, "id">) => {
    const id = globalThis.crypto?.randomUUID?.() ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { ...toast, id }]);
    return id;
  }, []);

  return React.useMemo(
    () => ({
      dismissToast,
      pushToast,
      removeToast,
      toasts,
    }),
    [dismissToast, pushToast, removeToast, toasts],
  );
}

export function ToastProviderStore({
  children,
  value,
}: {
  readonly children: React.ReactNode;
  readonly value: ToastContextValue;
}) {
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const store = useToastStore();

  return React.useMemo(
    () => ({
      dismiss: store.dismissToast,
      toast: store.pushToast,
      toasts: store.toasts,
    }),
    [store],
  );
}
