import * as React from "react";
import { Text, type TextProps, View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type DialogSharedProps } from "../dialog/dialog.shared";
export interface SheetProps extends DialogSharedProps {
    readonly children: React.ReactNode;
}
export declare function Sheet({ children, defaultOpen, onOpenChange, open }: SheetProps): import("react/jsx-runtime").JSX.Element;
export interface SheetTriggerProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly asChild?: boolean;
}
export declare const SheetTrigger: React.ForwardRefExoticComponent<SheetTriggerProps & React.RefAttributes<View>>;
export declare const SheetClose: React.ForwardRefExoticComponent<SheetTriggerProps & React.RefAttributes<View>>;
export interface SheetContentProps extends Omit<ViewProps, "style"> {
    readonly side?: "left" | "right";
    readonly style?: StyleProp<ViewStyle>;
}
export declare const SheetContent: React.ForwardRefExoticComponent<SheetContentProps & React.RefAttributes<View>>;
export interface SheetSectionProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const SheetHeader: React.ForwardRefExoticComponent<SheetSectionProps & React.RefAttributes<View>>;
export interface SheetTextProps extends Omit<TextProps, "style"> {
    readonly style?: StyleProp<TextStyle>;
}
export declare const SheetTitle: React.ForwardRefExoticComponent<SheetTextProps & React.RefAttributes<Text>>;
export declare const SheetDescription: React.ForwardRefExoticComponent<SheetTextProps & React.RefAttributes<Text>>;
export declare const SheetFooter: React.ForwardRefExoticComponent<SheetSectionProps & React.RefAttributes<View>>;
//# sourceMappingURL=sheet.native.d.ts.map