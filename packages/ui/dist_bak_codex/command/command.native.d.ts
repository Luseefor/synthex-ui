import * as React from "react";
import { ScrollView, TextInput, type PressableProps, type StyleProp, type TextInputProps, type TextStyle, type ViewProps, type ViewStyle, View } from "react-native";
import { type CommandItemSharedProps, type CommandSharedProps } from "./command.shared";
export interface CommandProps extends Omit<ViewProps, "style">, CommandSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare function Command({ children, defaultQuery, onQueryChange, query, shouldFilter, style, ...props }: CommandProps): import("react/jsx-runtime").JSX.Element;
export interface CommandInputProps extends Omit<TextInputProps, "defaultValue" | "onChange" | "value"> {
    readonly style?: StyleProp<TextStyle>;
}
export declare const CommandInput: React.ForwardRefExoticComponent<CommandInputProps & React.RefAttributes<TextInput>>;
export interface CommandListProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const CommandList: React.ForwardRefExoticComponent<CommandListProps & React.RefAttributes<ScrollView>>;
export interface CommandEmptyProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const CommandEmpty: React.ForwardRefExoticComponent<CommandEmptyProps & React.RefAttributes<View>>;
export interface CommandGroupProps extends Omit<ViewProps, "style"> {
    readonly heading?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly headingStyle?: StyleProp<TextStyle>;
}
export declare const CommandGroup: React.ForwardRefExoticComponent<CommandGroupProps & React.RefAttributes<View>>;
export interface CommandItemProps extends Omit<PressableProps, "style">, CommandItemSharedProps {
    readonly children?: React.ReactNode;
    readonly onCommandSelect?: (value: string) => void;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const CommandItem: React.ForwardRefExoticComponent<CommandItemProps & React.RefAttributes<View>>;
//# sourceMappingURL=command.native.d.ts.map