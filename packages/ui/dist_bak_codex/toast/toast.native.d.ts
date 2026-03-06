import * as React from "react";
import { type PressableProps, type TextProps as NativeTextProps, type ViewProps } from "react-native";
import { Button } from "../button/button.native";
import { useToast, type ToastSharedProps } from "./toast.shared";
export interface ToastProviderProps extends ViewProps {
    readonly children: React.ReactNode;
}
export declare function ToastProvider({ children, ...props }: ToastProviderProps): import("react/jsx-runtime").JSX.Element;
export interface ToastViewportProps extends ViewProps {
}
export declare function ToastViewport({ style, ...props }: ToastViewportProps): import("react/jsx-runtime").JSX.Element;
export interface ToastProps extends ViewProps, ToastSharedProps {
}
export declare function Toast({ children, style, ...props }: ToastProps): import("react/jsx-runtime").JSX.Element;
export interface ToastTitleProps extends NativeTextProps {
}
export declare function ToastTitle({ style, ...props }: ToastTitleProps): import("react/jsx-runtime").JSX.Element;
export interface ToastDescriptionProps extends NativeTextProps {
}
export declare function ToastDescription({ style, ...props }: ToastDescriptionProps): import("react/jsx-runtime").JSX.Element;
export interface ToastActionProps extends React.ComponentPropsWithoutRef<typeof Button> {
}
export declare function ToastAction(props: ToastActionProps): import("react/jsx-runtime").JSX.Element;
export interface ToastCloseProps extends Omit<PressableProps, "children" | "style"> {
    readonly children?: React.ReactNode;
}
export declare function ToastClose({ children, ...props }: ToastCloseProps): import("react/jsx-runtime").JSX.Element;
export declare function Toaster(): import("react/jsx-runtime").JSX.Element;
export declare const Sonner: typeof Toaster;
export declare function useSonner(): {
    dismiss: (id: string) => void;
    toast: (toast: Omit<import("./toast.shared").ToastDescriptor, "id">) => string;
    toasts: readonly import("./toast.shared").ToastDescriptor[];
};
export { useToast };
//# sourceMappingURL=toast.native.d.ts.map