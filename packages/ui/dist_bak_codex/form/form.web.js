import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { Label } from "../label/label.web";
import { FormFieldProvider, FormItemProvider, useFormFieldMeta, } from "./form.shared";
export const Form = React.forwardRef(({ className, ...props }, ref) => (_jsx("form", { ref: ref, className: cn("space-y-8", className), ...props })));
Form.displayName = "Form";
export function FormField(props) {
    return _jsx(FormFieldProvider, { ...props });
}
export const FormItem = React.forwardRef(({ children, className, ...props }, ref) => {
    const id = React.useId();
    return (_jsx(FormItemProvider, { id: id, children: _jsx("div", { ref: ref, className: cn("grid gap-2.5", className), ...props, children: children }) }));
});
FormItem.displayName = "FormItem";
export const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
    const meta = useFormFieldMeta();
    return (_jsx(Label, { ref: ref, htmlFor: meta.controlId, className: cn(meta.error && "text-[color:var(--sx-color-destructive)]", className), ...props }));
});
FormLabel.displayName = "FormLabel";
export const FormControl = React.forwardRef(({ children, ...props }, ref) => {
    const meta = useFormFieldMeta();
    const control = children;
    return (_jsx("div", { ref: ref, ...props, children: React.cloneElement(control, {
            "aria-describedby": meta.describedBy,
            "aria-invalid": Boolean(meta.error) || undefined,
            id: meta.controlId,
            required: meta.required || undefined,
        }) }));
});
FormControl.displayName = "FormControl";
export const FormDescription = React.forwardRef(({ className, children, ...props }, ref) => {
    const meta = useFormFieldMeta();
    const content = children ?? meta.description;
    if (!content) {
        return null;
    }
    return (_jsx("p", { ref: ref, id: meta.descriptionId, className: cn("text-[13px] leading-5 text-[color:var(--sx-color-foreground-muted)]", className), ...props, children: content }));
});
FormDescription.displayName = "FormDescription";
export const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
    const meta = useFormFieldMeta();
    const content = meta.error ?? children;
    if (!content) {
        return null;
    }
    return (_jsx("p", { ref: ref, id: meta.messageId, className: cn("text-[13px] font-medium leading-5 text-[color:var(--sx-color-destructive)]", className), ...props, children: content }));
});
FormMessage.displayName = "FormMessage";
