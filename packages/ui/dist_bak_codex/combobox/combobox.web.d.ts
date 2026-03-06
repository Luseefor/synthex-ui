import * as React from "react";
import { type ComboboxItemSharedProps, type ComboboxSharedProps } from "./combobox.shared";
export interface ComboboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "value">, ComboboxSharedProps {
}
export declare function Combobox({ children, className, defaultOpen, defaultQuery, defaultValue, onOpenChange, onQueryChange, onValueChange, open, placeholder, query, value, ...props }: ComboboxProps): import("react/jsx-runtime").JSX.Element;
export declare const ComboboxTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const ComboboxValue: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
export declare const ComboboxContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "value"> {
}
export declare const ComboboxInput: React.ForwardRefExoticComponent<ComboboxInputProps & React.RefAttributes<HTMLInputElement>>;
export interface ComboboxListProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const ComboboxList: React.ForwardRefExoticComponent<ComboboxListProps & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const ComboboxEmpty: React.ForwardRefExoticComponent<ComboboxEmptyProps & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">, ComboboxItemSharedProps {
}
export declare const ComboboxItem: React.ForwardRefExoticComponent<ComboboxItemProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=combobox.web.d.ts.map