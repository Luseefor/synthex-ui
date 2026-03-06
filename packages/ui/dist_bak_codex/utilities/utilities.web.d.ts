import * as React from "react";
import { Label } from "../label/label.web";
export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
    readonly size?: "sm" | "md" | "lg";
}
export declare function Spinner({ className, size, ...props }: SpinnerProps): import("react/jsx-runtime").JSX.Element;
export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
}
export declare function Kbd({ className, ...props }: KbdProps): import("react/jsx-runtime").JSX.Element;
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function ButtonGroup({ className, ...props }: ButtonGroupProps): import("react/jsx-runtime").JSX.Element;
export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function Field({ className, ...props }: FieldProps): import("react/jsx-runtime").JSX.Element;
export interface FieldSetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
}
export declare function FieldSet({ className, ...props }: FieldSetProps): import("react/jsx-runtime").JSX.Element;
export interface FieldLegendProps extends React.HTMLAttributes<HTMLLegendElement> {
}
export declare function FieldLegend({ className, ...props }: FieldLegendProps): import("react/jsx-runtime").JSX.Element;
export interface FieldContentProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function FieldContent({ className, ...props }: FieldContentProps): import("react/jsx-runtime").JSX.Element;
export interface FieldLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
}
export declare function FieldLabel({ className, ...props }: FieldLabelProps): import("react/jsx-runtime").JSX.Element;
export interface FieldDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
}
export declare function FieldDescription({ className, ...props }: FieldDescriptionProps): import("react/jsx-runtime").JSX.Element;
export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
}
export declare function FieldError({ className, ...props }: FieldErrorProps): import("react/jsx-runtime").JSX.Element;
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function InputGroup({ className, ...props }: InputGroupProps): import("react/jsx-runtime").JSX.Element;
export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function InputGroupAddon({ className, ...props }: InputGroupAddonProps): import("react/jsx-runtime").JSX.Element;
export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function Empty({ className, ...props }: EmptyProps): import("react/jsx-runtime").JSX.Element;
export interface EmptyHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function EmptyHeader({ className, ...props }: EmptyHeaderProps): import("react/jsx-runtime").JSX.Element;
export interface EmptyTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
}
export declare function EmptyTitle({ className, ...props }: EmptyTitleProps): import("react/jsx-runtime").JSX.Element;
export interface EmptyDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
}
export declare function EmptyDescription({ className, ...props }: EmptyDescriptionProps): import("react/jsx-runtime").JSX.Element;
export interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function Item({ className, ...props }: ItemProps): import("react/jsx-runtime").JSX.Element;
export interface ItemTitleProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function ItemTitle({ className, ...props }: ItemTitleProps): import("react/jsx-runtime").JSX.Element;
export interface ItemDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
}
export declare function ItemDescription({ className, ...props }: ItemDescriptionProps): import("react/jsx-runtime").JSX.Element;
export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    readonly label?: string;
}
export declare function NativeSelect({ children, className, label, ...props }: NativeSelectProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=utilities.web.d.ts.map