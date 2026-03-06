import * as React from "react";
import { Text as NativeText, View, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type FormFieldSharedProps, type FormItemSharedProps } from "./form.shared";
export interface FormProps extends ViewProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Form: React.ForwardRefExoticComponent<FormProps & React.RefAttributes<View>>;
export declare function FormField(props: FormFieldSharedProps): import("react/jsx-runtime").JSX.Element;
export interface FormItemProps extends Omit<ViewProps, "children">, FormItemSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const FormItem: React.ForwardRefExoticComponent<FormItemProps & React.RefAttributes<View>>;
export declare const FormLabel: React.ForwardRefExoticComponent<Omit<import("../label/label.native").LabelProps & React.RefAttributes<NativeText>, "ref"> & React.RefAttributes<NativeText>>;
export declare const FormControl: React.ForwardRefExoticComponent<Omit<ViewProps, "children"> & {
    readonly children: React.ReactElement<any>;
} & React.RefAttributes<View>>;
export interface FormTextProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<TextStyle>;
}
export declare function FormDescription({ children, style }: FormTextProps): import("react/jsx-runtime").JSX.Element;
export declare function FormMessage({ children, style }: FormTextProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=form.native.d.ts.map