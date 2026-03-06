import * as React from "react";
import { Text, type TextProps, View, type ModalProps, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type DialogSharedProps } from "./dialog.shared";
export interface DialogProps extends DialogSharedProps {
    readonly children: React.ReactNode;
}
export declare function Dialog({ children, defaultOpen, onOpenChange, open }: DialogProps): import("react/jsx-runtime").JSX.Element;
export interface DialogTriggerProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly asChild?: boolean;
}
export declare const DialogTrigger: React.ForwardRefExoticComponent<DialogTriggerProps & React.RefAttributes<View>>;
export interface DialogCloseProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly asChild?: boolean;
}
export declare const DialogClose: React.ForwardRefExoticComponent<DialogCloseProps & React.RefAttributes<View>>;
export interface DialogContentProps extends Omit<ViewProps, "style"> {
    readonly hideClose?: boolean;
    readonly modalProps?: Omit<ModalProps, "children" | "transparent" | "visible">;
    readonly style?: StyleProp<ViewStyle>;
}
export declare const DialogContent: React.ForwardRefExoticComponent<DialogContentProps & React.RefAttributes<View>>;
export interface DialogSectionProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const DialogHeader: React.ForwardRefExoticComponent<DialogSectionProps & React.RefAttributes<View>>;
export interface DialogTextProps extends Omit<TextProps, "style"> {
    readonly style?: StyleProp<TextStyle>;
}
export declare const DialogTitle: React.ForwardRefExoticComponent<DialogTextProps & React.RefAttributes<Text>>;
export declare const DialogDescription: React.ForwardRefExoticComponent<DialogTextProps & React.RefAttributes<Text>>;
export declare const DialogFooter: React.ForwardRefExoticComponent<DialogSectionProps & React.RefAttributes<View>>;
//# sourceMappingURL=dialog.native.d.ts.map