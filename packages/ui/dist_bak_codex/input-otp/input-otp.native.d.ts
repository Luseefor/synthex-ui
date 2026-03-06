import * as React from "react";
import { Text, TextInput, View, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type InputOTPSharedProps } from "./input-otp.shared";
export interface InputOTPProps extends Omit<ViewProps, "style">, InputOTPSharedProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare function InputOTP({ children, defaultValue, length, onValueChange, style, value, ...props }: InputOTPProps): import("react/jsx-runtime").JSX.Element;
export interface InputOTPGroupProps extends Omit<ViewProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare const InputOTPGroup: React.ForwardRefExoticComponent<InputOTPGroupProps & React.RefAttributes<View>>;
export interface InputOTPSlotProps extends Omit<React.ComponentProps<typeof TextInput>, "onChangeText" | "style" | "value"> {
    readonly index: number;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const InputOTPSlot: React.ForwardRefExoticComponent<InputOTPSlotProps & React.RefAttributes<TextInput>>;
export declare const InputOTPSeparator: React.ForwardRefExoticComponent<import("react-native").TextProps & React.RefAttributes<Text>>;
//# sourceMappingURL=input-otp.native.d.ts.map