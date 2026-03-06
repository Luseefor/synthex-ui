import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn, resolveVariantStyles, } from "../_shared/variants";
import { getFieldControlClassName } from "../_shared/field-control.web";
import { inputVariants, resolveInputVariants } from "./input.shared";
const inputClassStyles = {
    slots: ["root"],
    base: {
        root: "",
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
export const Input = React.forwardRef(({ className, invalid, type = "text", uiSize, ...props }, ref) => {
    const resolved = resolveInputVariants({ invalid, uiSize });
    const slots = resolveVariantStyles(inputVariants, inputClassStyles, resolved);
    return (_jsx("input", { ref: ref, type: type, "aria-invalid": invalid || undefined, className: getFieldControlClassName({
            className: cn(...slots.root, className),
            size: resolved.size,
            tone: resolved.tone,
        }), ...props }));
});
Input.displayName = "Input";
