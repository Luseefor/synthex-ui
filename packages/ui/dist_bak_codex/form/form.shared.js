import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
const FormFieldContext = React.createContext(null);
const FormItemContext = React.createContext(null);
export function FormFieldProvider({ children, description, error, name, required = false, }) {
    const value = React.useMemo(() => ({
        description,
        error,
        name,
        required,
    }), [description, error, name, required]);
    return _jsx(FormFieldContext.Provider, { value: value, children: children });
}
export function FormItemProvider({ children, id, }) {
    const value = React.useMemo(() => ({
        controlId: `${id}-control`,
        descriptionId: `${id}-description`,
        itemId: id,
        messageId: `${id}-message`,
    }), [id]);
    return _jsx(FormItemContext.Provider, { value: value, children: children });
}
export function useFormFieldMeta() {
    const field = React.useContext(FormFieldContext);
    const item = React.useContext(FormItemContext);
    if (!field) {
        throw new Error("Form components must be used within <FormField>.");
    }
    if (!item) {
        throw new Error("Form components must be used within <FormItem>.");
    }
    const describedBy = [
        field.description ? item.descriptionId : null,
        field.error ? item.messageId : null,
    ]
        .filter(Boolean)
        .join(" ");
    return {
        ...field,
        ...item,
        describedBy: describedBy || undefined,
    };
}
