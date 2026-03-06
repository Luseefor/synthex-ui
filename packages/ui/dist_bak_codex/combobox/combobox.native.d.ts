import * as React from "react";
import { ScrollView, Text, TextInput, View, type PressableProps, type StyleProp, type TextInputProps, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type ComboboxItemSharedProps, type ComboboxSharedProps } from "./combobox.shared";
export interface ComboboxProps extends Omit<ViewProps, "style">, ComboboxSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare function Combobox({ children, defaultOpen, defaultQuery, defaultValue, onOpenChange, onQueryChange, onValueChange, open, placeholder, query, style, value, ...props }: ComboboxProps): import("react/jsx-runtime").JSX.Element;
export interface ComboboxTriggerProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare const ComboboxTrigger: React.ForwardRefExoticComponent<ComboboxTriggerProps & React.RefAttributes<View>>;
export interface ComboboxValueProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<TextStyle>;
}
export declare const ComboboxValue: React.ForwardRefExoticComponent<ComboboxValueProps & React.RefAttributes<Text>>;
export interface ComboboxContentProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const ComboboxContent: React.ForwardRefExoticComponent<ComboboxContentProps & React.RefAttributes<View>>;
export interface ComboboxInputProps extends Omit<TextInputProps, "defaultValue" | "onChange" | "value"> {
    readonly style?: StyleProp<TextStyle>;
}
export declare const ComboboxInput: React.ForwardRefExoticComponent<ComboboxInputProps & React.RefAttributes<TextInput>>;
export interface ComboboxListProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const ComboboxList: React.ForwardRefExoticComponent<ComboboxListProps & React.RefAttributes<ScrollView>>;
export interface ComboboxEmptyProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const ComboboxEmpty: React.ForwardRefExoticComponent<ComboboxEmptyProps & React.RefAttributes<View>>;
export interface ComboboxItemProps extends Omit<PressableProps, "style">, ComboboxItemSharedProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const ComboboxItem: React.ForwardRefExoticComponent<ComboboxItemProps & React.RefAttributes<View>>;
//# sourceMappingURL=combobox.native.d.ts.map