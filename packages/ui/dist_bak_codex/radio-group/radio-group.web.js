import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { RadioGroupProvider, useRadioGroupContext, useRadioGroupController, } from "./radio-group.shared";
export function RadioGroup({ children, className, defaultValue, onValueChange, value, ...props }) {
    const controller = useRadioGroupController({ defaultValue, onValueChange, value });
    return (_jsx(RadioGroupProvider, { value: controller, children: _jsx("div", { role: "radiogroup", className: cn("grid gap-3", className), ...props, children: children }) }));
}
export const RadioGroupItem = React.forwardRef(({ children, className, disabled, onClick, value, ...props }, ref) => {
    const context = useRadioGroupContext();
    const isActive = context.value === value;
    return (_jsxs("button", { ref: ref, type: "button", role: "radio", "aria-checked": isActive, "data-state": isActive ? "checked" : "unchecked", disabled: disabled, className: cn("inline-flex items-center gap-3 rounded-[var(--sx-radius-md)] px-1 py-1 text-left text-sm font-medium text-[color:var(--sx-color-foreground)] transition-colors duration-[var(--sx-motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:pointer-events-none disabled:opacity-45", className), onClick: (event) => {
            context.setValue(value);
            onClick?.(event);
        }, ...props, children: [_jsx("span", { "aria-hidden": "true", className: cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-[border-color,box-shadow] duration-[var(--sx-motion-fast)]", isActive
                    ? "border-[color:var(--sx-color-primary)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--sx-color-primary)_12%,transparent)]"
                    : "border-[color:var(--sx-color-border-strong)]"), children: _jsx("span", { className: cn("h-2.5 w-2.5 rounded-full bg-[color:var(--sx-color-primary)] transition-[transform,opacity] duration-[var(--sx-motion-fast)]", isActive ? "scale-100 opacity-100" : "scale-50 opacity-0") }) }), _jsx("span", { children: children })] }));
});
RadioGroupItem.displayName = "RadioGroupItem";
