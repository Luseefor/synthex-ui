import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cn, resolveVariantStyles, } from "../_shared/variants";
import { CheckIcon } from "../icons/index.web";
import { checkboxVariants, resolveCheckboxVariants, } from "./checkbox.shared";
const checkboxClassStyles = {
    slots: ["root", "indicator"],
    base: {
        root: "inline-flex shrink-0 items-center justify-center rounded-[calc(var(--sx-radius-sm)-1px)] border transition-[border-color,background-color,box-shadow,transform] duration-[var(--sx-motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:pointer-events-none disabled:opacity-45",
        indicator: "scale-0 text-[color:var(--sx-color-foreground-on-brand)] opacity-0 transition-[transform,opacity] duration-[var(--sx-motion-fast)]",
    },
    variants: {
        size: {
            sm: {
                root: "h-4 w-4",
            },
            md: {
                root: "h-5 w-5",
            },
        },
        tone: {
            default: {
                root: "border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] hover:border-[color:var(--sx-color-primary)]",
            },
            invalid: {
                root: "border-[color:var(--sx-color-destructive)] bg-[color:var(--sx-color-surface)] focus-visible:ring-[color:color-mix(in_srgb,var(--sx-color-destructive)_28%,transparent)]",
            },
        },
    },
};
export const Checkbox = React.forwardRef(({ checked, className, defaultChecked = false, disabled, invalid, onCheckedChange, onClick, uiSize, ...props }, ref) => {
    const [currentChecked, setCurrentChecked] = useControllableState({
        defaultValue: defaultChecked,
        onChange: onCheckedChange,
        value: checked,
    });
    const resolved = resolveCheckboxVariants({ invalid, uiSize });
    const slots = resolveVariantStyles(checkboxVariants, checkboxClassStyles, resolved);
    return (_jsx("button", { ref: ref, type: "button", role: "checkbox", "aria-checked": currentChecked, "aria-invalid": invalid || undefined, "data-state": currentChecked ? "checked" : "unchecked", disabled: disabled, className: cn(...slots.root, currentChecked &&
            "border-[color:var(--sx-color-primary)] bg-[color:var(--sx-color-primary)] shadow-[0_6px_14px_rgba(29,78,216,0.2)]", className), onClick: (event) => {
            onClick?.(event);
            if (event.defaultPrevented || disabled) {
                return;
            }
            setCurrentChecked(!currentChecked);
        }, ...props, children: _jsx("span", { "aria-hidden": "true", className: cn(...slots.indicator, currentChecked && "scale-100 opacity-100"), children: _jsx(CheckIcon, { size: resolved.size === "sm" ? 12 : 14, strokeWidth: 2.6 }) }) }));
});
Checkbox.displayName = "Checkbox";
