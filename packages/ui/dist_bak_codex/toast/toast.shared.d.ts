import * as React from "react";
export interface ToastSharedProps {
    readonly duration?: number;
    readonly open?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
    readonly variant?: "default" | "success" | "warning" | "destructive";
}
export interface ToastDescriptor {
    readonly action?: (() => void) | undefined;
    readonly actionLabel?: string;
    readonly description?: React.ReactNode;
    readonly duration?: number;
    readonly id: string;
    readonly title: React.ReactNode;
    readonly variant?: ToastSharedProps["variant"];
}
interface ToastContextValue {
    readonly dismissToast: (id: string) => void;
    readonly pushToast: (toast: Omit<ToastDescriptor, "id">) => string;
    readonly removeToast: (id: string) => void;
    readonly toasts: readonly ToastDescriptor[];
}
export declare function useToastStore(): ToastContextValue;
export declare function useToastState(): {
    dismissToast: (id: string) => void;
    pushToast: (toast: Omit<ToastDescriptor, "id">) => `${string}-${string}-${string}-${string}-${string}`;
    removeToast: (id: string) => void;
    toasts: readonly ToastDescriptor[];
};
export declare function ToastProviderStore({ children, value, }: {
    readonly children: React.ReactNode;
    readonly value: ToastContextValue;
}): import("react/jsx-runtime").JSX.Element;
export declare function useToast(): {
    dismiss: (id: string) => void;
    toast: (toast: Omit<ToastDescriptor, "id">) => string;
    toasts: readonly ToastDescriptor[];
};
export {};
//# sourceMappingURL=toast.shared.d.ts.map