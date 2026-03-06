import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { getFieldControlClassName } from "../_shared/field-control.web";
import { cn } from "../_shared/variants";
import { Label } from "../label/label.web";
export function Spinner({ className, size = "md", ...props }) {
    const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
    return (_jsx("span", { "aria-label": "Loading", role: "status", className: cn("inline-flex animate-spin rounded-full border-2 border-[color:var(--sx-color-border)] border-t-[color:var(--sx-color-primary)]", sizeClass, className), ...props }));
}
export function Kbd({ className, ...props }) {
    return (_jsx("kbd", { className: cn("inline-flex min-h-6 items-center justify-center whitespace-nowrap rounded-[calc(var(--sx-radius-sm)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] px-2 font-mono text-[0.75rem] font-semibold leading-none text-[color:var(--sx-color-foreground-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]", className), ...props }));
}
export function ButtonGroup({ className, ...props }) {
    return (_jsx("div", { className: cn("inline-flex items-center gap-2 rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1", className), ...props }));
}
export function Field({ className, ...props }) {
    return _jsx("div", { className: cn("grid gap-2.5", className), ...props });
}
export function FieldSet({ className, ...props }) {
    return (_jsx("fieldset", { className: cn("grid gap-3 rounded-[var(--sx-radius-lg)] border border-[color:var(--sx-color-border)] p-4", className), ...props }));
}
export function FieldLegend({ className, ...props }) {
    return (_jsx("legend", { className: cn("px-1 text-sm font-semibold text-[color:var(--sx-color-foreground)]", className), ...props }));
}
export function FieldContent({ className, ...props }) {
    return _jsx("div", { className: cn("grid gap-1.5", className), ...props });
}
export function FieldLabel({ className, ...props }) {
    return _jsx(Label, { className: cn("text-[13px] font-semibold", className), ...props });
}
export function FieldDescription({ className, ...props }) {
    return (_jsx("p", { className: cn("text-[13px] leading-5 text-[color:var(--sx-color-foreground-muted)]", className), ...props }));
}
export function FieldError({ className, ...props }) {
    return (_jsx("p", { className: cn("text-[13px] font-medium leading-5 text-[color:var(--sx-color-destructive)]", className), ...props }));
}
export function InputGroup({ className, ...props }) {
    return (_jsx("div", { className: cn("flex items-stretch overflow-hidden rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] shadow-[inset_0_1px_1px_rgba(15,23,42,0.03)]", className), ...props }));
}
export function InputGroupAddon({ className, ...props }) {
    return (_jsx("div", { className: cn("inline-flex items-center border-r border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-muted)] px-3 text-sm text-[color:var(--sx-color-foreground-muted)]", className), ...props }));
}
export function Empty({ className, ...props }) {
    return (_jsx("div", { className: cn("grid min-h-40 place-items-center rounded-[var(--sx-radius-lg)] border border-dashed border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface-muted)] px-6 py-8 text-center", className), ...props }));
}
export function EmptyHeader({ className, ...props }) {
    return _jsx("div", { className: cn("grid gap-2", className), ...props });
}
export function EmptyTitle({ className, ...props }) {
    return _jsx("h4", { className: cn("text-lg font-semibold text-[color:var(--sx-color-foreground)]", className), ...props });
}
export function EmptyDescription({ className, ...props }) {
    return _jsx("p", { className: cn("text-sm text-[color:var(--sx-color-foreground-muted)]", className), ...props });
}
export function Item({ className, ...props }) {
    return (_jsx("div", { className: cn("grid gap-1 rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 py-3", className), ...props }));
}
export function ItemTitle({ className, ...props }) {
    return _jsx("div", { className: cn("text-sm font-medium text-[color:var(--sx-color-foreground)]", className), ...props });
}
export function ItemDescription({ className, ...props }) {
    return _jsx("p", { className: cn("text-sm text-[color:var(--sx-color-foreground-muted)]", className), ...props });
}
export function NativeSelect({ children, className, label, ...props }) {
    return (_jsxs("div", { className: "grid gap-2.5", children: [label ? _jsx(Label, { children: label }) : null, _jsx("select", { className: getFieldControlClassName({ className }), ...props, children: children })] }));
}
