import * as React from "react";
import { View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type RadioGroupItemSharedProps, type RadioGroupSharedProps } from "./radio-group.shared";
export interface RadioGroupProps extends Omit<ViewProps, "style">, RadioGroupSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare function RadioGroup({ children, defaultValue, onValueChange, style, value, ...props }: RadioGroupProps): import("react/jsx-runtime").JSX.Element;
export interface RadioGroupItemProps extends Omit<PressableProps, "style">, RadioGroupItemSharedProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const RadioGroupItem: React.ForwardRefExoticComponent<RadioGroupItemProps & React.RefAttributes<View>>;
//# sourceMappingURL=radio-group.native.d.ts.map