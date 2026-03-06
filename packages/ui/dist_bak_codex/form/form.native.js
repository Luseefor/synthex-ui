import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Text as NativeText, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { Label } from "../label/label.native";
import { FormFieldProvider, FormItemProvider, useFormFieldMeta, } from "./form.shared";
export const Form = React.forwardRef(({ children, style, ...props }, ref) => (_jsx(View, { ref: ref, style: [{ gap: 24 }, style], ...props, children: children })));
Form.displayName = "Form";
export function FormField(props) {
    return _jsx(FormFieldProvider, { ...props });
}
export const FormItem = React.forwardRef(({ children, style, ...props }, ref) => {
    const id = React.useId();
    return (_jsx(FormItemProvider, { id: id, children: _jsx(View, { ref: ref, style: [{ gap: 10 }, style], ...props, children: children }) }));
});
FormItem.displayName = "FormItem";
export const FormLabel = React.forwardRef(({ style, ...props }, ref) => {
    const theme = useTheme();
    const meta = useFormFieldMeta();
    return (_jsx(Label, { ref: ref, style: [meta.error ? { color: theme.colors.destructive } : null, style], ...props }));
});
FormLabel.displayName = "FormLabel";
export const FormControl = React.forwardRef(({ children, style, ...props }, ref) => {
    const meta = useFormFieldMeta();
    const control = children;
    return (_jsx(View, { ref: ref, style: style, ...props, children: React.cloneElement(control, {
            accessibilityState: {
                ...control.props.accessibilityState,
                invalid: Boolean(meta.error),
            },
            nativeID: meta.controlId,
        }) }));
});
FormControl.displayName = "FormControl";
function FormText({ children, color, nativeID, style, }) {
    const theme = useTheme();
    if (!children) {
        return null;
    }
    return (_jsx(NativeText, { nativeID: nativeID, style: [
            {
                color,
                fontFamily: theme.typography.family.sans,
                fontSize: 13,
                lineHeight: 20,
            },
            style,
        ], children: children }));
}
export function FormDescription({ children, style }) {
    const meta = useFormFieldMeta();
    const theme = useTheme();
    return (_jsx(FormText, { nativeID: meta.descriptionId, color: theme.colors.foregroundMuted, style: style, children: children ?? meta.description }));
}
export function FormMessage({ children, style }) {
    const meta = useFormFieldMeta();
    const theme = useTheme();
    return (_jsx(FormText, { nativeID: meta.messageId, color: theme.colors.destructive, style: [{ fontWeight: "600" }, style], children: meta.error ?? children }));
}
