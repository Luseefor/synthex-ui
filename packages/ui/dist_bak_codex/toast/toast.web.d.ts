import * as React from "react";
import { useToast, type ToastDescriptor, type ToastSharedProps } from "./toast.shared";
export interface ToastProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    readonly children: React.ReactNode;
}
export declare function ToastProvider({ children, ...props }: ToastProviderProps): import("react/jsx-runtime").JSX.Element;
export interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const ToastViewport: React.ForwardRefExoticComponent<ToastViewportProps & React.RefAttributes<HTMLDivElement>>;
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, ToastSharedProps {
}
export declare const Toast: React.ForwardRefExoticComponent<ToastProps & React.RefAttributes<HTMLDivElement>>;
export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function ToastTitle({ className, ...props }: ToastTitleProps): import("react/jsx-runtime").JSX.Element;
export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
}
export declare function ToastDescription({ className, ...props }: ToastDescriptionProps): import("react/jsx-runtime").JSX.Element;
export interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}
export declare function ToastAction({ className, type, ...props }: ToastActionProps): import("react/jsx-runtime").JSX.Element;
export interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}
export declare function ToastClose({ className, type, ...props }: ToastCloseProps): import("react/jsx-runtime").JSX.Element;
export declare function Toaster(): import("react/jsx-runtime").JSX.Element;
export declare const Sonner: typeof Toaster;
export declare function useSonner(): {
    dismiss: (id: string) => void;
    toast: (toast: Omit<ToastDescriptor, "id">) => string;
    toasts: readonly ToastDescriptor[];
};
export { useToast };
//# sourceMappingURL=toast.web.d.ts.map