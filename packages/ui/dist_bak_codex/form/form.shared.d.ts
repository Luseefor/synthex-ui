import * as React from "react";
export interface FormFieldSharedProps {
    readonly children: React.ReactNode;
    readonly description?: React.ReactNode;
    readonly error?: React.ReactNode;
    readonly name: string;
    readonly required?: boolean;
}
export interface FormItemSharedProps {
    readonly children: React.ReactNode;
}
export declare function FormFieldProvider({ children, description, error, name, required, }: FormFieldSharedProps): import("react/jsx-runtime").JSX.Element;
export declare function FormItemProvider({ children, id, }: FormItemSharedProps & {
    readonly id: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function useFormFieldMeta(): {
    describedBy: string | undefined;
    controlId: string;
    descriptionId: string;
    itemId: string;
    messageId: string;
    description?: React.ReactNode;
    error?: React.ReactNode;
    name: string;
    required: boolean;
};
//# sourceMappingURL=form.shared.d.ts.map