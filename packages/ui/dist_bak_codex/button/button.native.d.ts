import * as React from "react";
import { type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { type ButtonSharedProps } from "./button.shared";
export interface ButtonProps extends Omit<PressableProps, "children" | "style">, ButtonSharedProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<import("react-native").View>>;
//# sourceMappingURL=button.native.d.ts.map