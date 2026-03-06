import * as React from "react";
import { type TextInputProps, type TextProps as NativeTextProps, type ViewProps } from "react-native";
import { Label } from "../label/label.native";
export interface SpinnerProps extends ViewProps {
    readonly size?: "sm" | "md" | "lg";
}
export declare function Spinner({ size, style, ...props }: SpinnerProps): import("react/jsx-runtime").JSX.Element;
export interface KbdProps extends NativeTextProps {
}
export declare function Kbd({ style, ...props }: KbdProps): import("react/jsx-runtime").JSX.Element;
export interface ButtonGroupProps extends ViewProps {
}
export declare function ButtonGroup({ style, ...props }: ButtonGroupProps): import("react/jsx-runtime").JSX.Element;
export interface FieldProps extends ViewProps {
}
export declare function Field({ style, ...props }: FieldProps): import("react/jsx-runtime").JSX.Element;
export interface FieldSetProps extends ViewProps {
}
export declare function FieldSet({ style, ...props }: FieldSetProps): import("react/jsx-runtime").JSX.Element;
export interface FieldLegendProps extends NativeTextProps {
}
export declare function FieldLegend({ style, ...props }: FieldLegendProps): import("react/jsx-runtime").JSX.Element;
export interface FieldContentProps extends ViewProps {
}
export declare function FieldContent({ style, ...props }: FieldContentProps): import("react/jsx-runtime").JSX.Element;
export interface FieldLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
}
export declare function FieldLabel({ style, ...props }: FieldLabelProps): import("react/jsx-runtime").JSX.Element;
export interface FieldDescriptionProps extends NativeTextProps {
}
export declare function FieldDescription({ style, ...props }: FieldDescriptionProps): import("react/jsx-runtime").JSX.Element;
export interface FieldErrorProps extends NativeTextProps {
}
export declare function FieldError({ style, ...props }: FieldErrorProps): import("react/jsx-runtime").JSX.Element;
export interface InputGroupProps extends ViewProps {
}
export declare function InputGroup({ style, ...props }: InputGroupProps): import("react/jsx-runtime").JSX.Element;
export interface InputGroupAddonProps extends ViewProps {
}
export declare function InputGroupAddon({ style, ...props }: InputGroupAddonProps): import("react/jsx-runtime").JSX.Element;
export interface EmptyProps extends ViewProps {
}
export declare function Empty({ style, ...props }: EmptyProps): import("react/jsx-runtime").JSX.Element;
export interface EmptyHeaderProps extends ViewProps {
}
export declare function EmptyHeader({ style, ...props }: EmptyHeaderProps): import("react/jsx-runtime").JSX.Element;
export interface EmptyTitleProps extends NativeTextProps {
}
export declare function EmptyTitle({ style, ...props }: EmptyTitleProps): import("react/jsx-runtime").JSX.Element;
export interface EmptyDescriptionProps extends NativeTextProps {
}
export declare function EmptyDescription({ style, ...props }: EmptyDescriptionProps): import("react/jsx-runtime").JSX.Element;
export interface ItemProps extends ViewProps {
}
export declare function Item({ style, ...props }: ItemProps): import("react/jsx-runtime").JSX.Element;
export interface ItemTitleProps extends NativeTextProps {
}
export declare function ItemTitle({ style, ...props }: ItemTitleProps): import("react/jsx-runtime").JSX.Element;
export interface ItemDescriptionProps extends NativeTextProps {
}
export declare function ItemDescription({ style, ...props }: ItemDescriptionProps): import("react/jsx-runtime").JSX.Element;
export interface NativeSelectProps extends TextInputProps {
    readonly label?: string;
}
export declare function NativeSelect({ label, style, ...props }: NativeSelectProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=utilities.native.d.ts.map