import * as React from "react";
import { TextInput as NativeTextInput, type StyleProp, type TextInputProps as NativeTextInputProps, type TextStyle } from "react-native";
import { type TextareaSharedProps } from "./textarea.shared";
export interface TextareaProps extends Omit<NativeTextInputProps, "style">, TextareaSharedProps {
    readonly style?: StyleProp<TextStyle>;
}
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<NativeTextInput>>;
//# sourceMappingURL=textarea.native.d.ts.map