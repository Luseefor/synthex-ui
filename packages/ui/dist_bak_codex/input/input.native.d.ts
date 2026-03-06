import * as React from "react";
import { TextInput as NativeTextInput, type StyleProp, type TextInputProps as NativeTextInputProps, type TextStyle } from "react-native";
import { type InputSharedProps } from "./input.shared";
export interface InputProps extends Omit<NativeTextInputProps, "style">, InputSharedProps {
    readonly style?: StyleProp<TextStyle>;
}
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<NativeTextInput>>;
//# sourceMappingURL=input.native.d.ts.map