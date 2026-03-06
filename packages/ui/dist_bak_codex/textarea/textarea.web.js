import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn, resolveVariantStyles, } from "../_shared/variants";
import { getFieldControlClassName } from "../_shared/field-control.web";
import { resolveTextareaVariants, textareaVariants, } from "./textarea.shared";
const textareaClassStyles = {
    slots: ["root"],
    base: {
        root: "flex w-full",
    },
    variants: {
        size: {
            sm: { root: "" },
            md: { root: "" },
            lg: { root: "" },
        },
        tone: {
            default: { root: "" },
            invalid: { root: "" },
        },
    },
};
export const Textarea = React.forwardRef(({ className, invalid, uiSize, ...props }, ref) => {
    const resolved = resolveTextareaVariants({ invalid, uiSize });
    const slots = resolveVariantStyles(textareaVariants, textareaClassStyles, resolved);
    return (_jsx("textarea", { ref: ref, "aria-invalid": invalid || undefined, className: getFieldControlClassName({
            className: cn(...slots.root, className),
            multiline: true,
            size: resolved.size,
            tone: resolved.tone,
        }), ...props }));
});
Textarea.displayName = "Textarea";
