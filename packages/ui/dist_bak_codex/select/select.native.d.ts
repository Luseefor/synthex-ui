import * as React from "react";
import { Text, type TextProps, View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type SelectItemSharedProps, type SelectSharedProps } from "./select.shared";
export interface SelectProps extends Omit<ViewProps, "style">, SelectSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare function Select({ children, defaultOpen, defaultValue, onOpenChange, onValueChange, open, placeholder, style, value, ...props }: SelectProps): import("react/jsx-runtime").JSX.Element;
export interface SelectTriggerProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare const SelectTrigger: React.ForwardRefExoticComponent<SelectTriggerProps & React.RefAttributes<View>>;
export interface SelectValueProps extends Omit<TextProps, "style"> {
    readonly style?: StyleProp<TextStyle>;
}
export declare const SelectValue: React.ForwardRefExoticComponent<SelectValueProps & React.RefAttributes<Text>>;
export interface SelectContentProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const SelectContent: React.ForwardRefExoticComponent<SelectContentProps & React.RefAttributes<View>>;
export interface SelectItemProps extends Omit<PressableProps, "style">, SelectItemSharedProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const SelectItem: React.ForwardRefExoticComponent<SelectItemProps & React.RefAttributes<View>>;
//# sourceMappingURL=select.native.d.ts.map