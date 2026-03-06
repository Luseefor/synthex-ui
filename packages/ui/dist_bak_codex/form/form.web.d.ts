import * as React from "react";
import { type FormFieldSharedProps, type FormItemSharedProps } from "./form.shared";
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
}
export declare const Form: React.ForwardRefExoticComponent<FormProps & React.RefAttributes<HTMLFormElement>>;
export declare function FormField(props: FormFieldSharedProps): import("react/jsx-runtime").JSX.Element;
export declare const FormItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & FormItemSharedProps & React.RefAttributes<HTMLDivElement>>;
export declare const FormLabel: React.ForwardRefExoticComponent<Omit<import("../label/label.web").LabelProps & React.RefAttributes<HTMLLabelElement>, "ref"> & React.RefAttributes<HTMLLabelElement>>;
export declare const FormControl: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
    readonly children: React.ReactElement<any>;
} & React.RefAttributes<HTMLDivElement>>;
export declare const FormDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const FormMessage: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
//# sourceMappingURL=form.web.d.ts.map