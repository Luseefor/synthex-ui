import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { getFieldControlClassName } from "../_shared/field-control.web";
import { CheckIcon, ChevronDownIcon } from "../icons/index.web";
import { SelectProvider, useSelectContext, useSelectController, } from "./select.shared";
export function Select({ children, className, defaultOpen, defaultValue, onOpenChange, onValueChange, open, placeholder, value, ...props }) {
    const controller = useSelectController({
        defaultOpen,
        defaultValue,
        onOpenChange,
        onValueChange,
        open,
        placeholder,
        value,
    });
    const rootRef = React.useRef(null);
    React.useEffect(() => {
        if (!controller.open) {
            return;
        }
        const handlePointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                controller.setOpen(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                controller.setOpen(false);
            }
        };
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [controller]);
    return (_jsx(SelectProvider, { value: controller, children: _jsx("div", { ref: rootRef, className: cn("relative w-full", className), ...props, children: children }) }));
}
export const SelectTrigger = React.forwardRef(({ children, className, onClick, type = "button", ...props }, ref) => {
    const context = useSelectContext();
    return (_jsxs("button", { ref: ref, type: type, "aria-expanded": context.open, className: getFieldControlClassName({
            className: cn("inline-flex items-center justify-between gap-3 text-left", className),
        }), onClick: (event) => {
            context.setOpen(!context.open);
            onClick?.(event);
        }, ...props, children: [_jsx("span", { className: "min-w-0 flex-1 text-left", children: children }), _jsx("span", { className: cn("transition-transform duration-[var(--sx-motion-fast)]", context.open && "rotate-180"), children: _jsx(ChevronDownIcon, { size: 16 }) })] }));
});
SelectTrigger.displayName = "SelectTrigger";
export const SelectValue = React.forwardRef(({ className, children, ...props }, ref) => {
    const context = useSelectContext();
    const selectedLabel = context.getLabel(context.value);
    void context.labelVersion;
    return (_jsx("span", { ref: ref, className: cn("block truncate text-[color:var(--sx-color-foreground)]", !selectedLabel && !children && "text-[color:var(--sx-color-foreground-muted)]", className), ...props, children: children ?? selectedLabel ?? context.placeholder ?? "Select an option" }));
});
SelectValue.displayName = "SelectValue";
export const SelectContent = React.forwardRef(({ className, ...props }, ref) => {
    const context = useSelectContext();
    if (!context.open) {
        return null;
    }
    return (_jsx("div", { ref: ref, className: cn("absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)]", className), ...props }));
});
SelectContent.displayName = "SelectContent";
export const SelectItem = React.forwardRef(({ children, className, onClick, textValue, value, ...props }, ref) => {
    const context = useSelectContext();
    const label = textValue ??
        (typeof children === "string" || typeof children === "number" ? String(children) : value);
    React.useEffect(() => {
        context.registerItem(value, label);
    }, [context, label, value]);
    const active = context.value === value;
    return (_jsxs("button", { ref: ref, type: "button", role: "option", "aria-selected": active, className: cn("flex w-full items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] transition-colors duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--sx-color-surface)]", active &&
            "border border-[color:var(--sx-color-primary)]/40 bg-[color:color-mix(in_srgb,var(--sx-color-primary)_14%,var(--sx-color-surface))] text-[color:var(--sx-color-foreground)]", className), onClick: (event) => {
            context.setValue(value);
            context.setOpen(false);
            onClick?.(event);
        }, ...props, children: [_jsx("span", { children: children }), active ? _jsx(CheckIcon, { size: 14, strokeWidth: 2.4 }) : null] }));
});
SelectItem.displayName = "SelectItem";
