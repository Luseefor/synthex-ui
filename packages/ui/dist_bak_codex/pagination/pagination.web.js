import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.web";
export const Pagination = React.forwardRef(({ className, ...props }, ref) => (_jsx("nav", { ref: ref, "aria-label": "Pagination", className: cn("flex w-full justify-center", className), ...props })));
Pagination.displayName = "Pagination";
export const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (_jsx("ul", { ref: ref, className: cn("flex flex-row flex-wrap items-center justify-center gap-2", className), ...props })));
PaginationContent.displayName = "PaginationContent";
export const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (_jsx("li", { ref: ref, className: cn("list-none", className), ...props })));
PaginationItem.displayName = "PaginationItem";
export const PaginationLink = React.forwardRef(({ className, isActive, type = "button", ...props }, ref) => (_jsx("button", { ref: ref, type: type, "aria-current": isActive ? "page" : undefined, className: cn("inline-flex h-10 min-w-10 items-center justify-center rounded-[var(--sx-radius-md)] border px-3 text-sm font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow] duration-[var(--sx-motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)]", isActive
        ? "border-[color:var(--sx-color-primary)] bg-[color:var(--sx-color-primary)] text-[color:var(--sx-color-foreground-on-brand)] shadow-[0_8px_20px_rgba(29,78,216,0.18)]"
        : "border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground)] hover:border-[color:var(--sx-color-border-strong)] hover:bg-[color:var(--sx-color-surface-muted)]", className), ...props })));
PaginationLink.displayName = "PaginationLink";
export const PaginationPrevious = React.forwardRef(({ children = "Previous", className, ...props }, ref) => (_jsxs(PaginationLink, { ref: ref, className: cn("gap-2 pl-3.5 pr-4", className), ...props, children: [_jsx(ChevronLeftIcon, { size: 16 }), children] })));
PaginationPrevious.displayName = "PaginationPrevious";
export const PaginationNext = React.forwardRef(({ children = "Next", className, ...props }, ref) => (_jsxs(PaginationLink, { ref: ref, className: cn("gap-2 pl-4 pr-3.5", className), ...props, children: [children, _jsx(ChevronRightIcon, { size: 16 })] })));
PaginationNext.displayName = "PaginationNext";
export function PaginationEllipsis({ className, ...props }) {
    return (_jsx("span", { "aria-hidden": "true", className: cn("inline-flex h-10 min-w-10 items-center justify-center text-sm text-[color:var(--sx-color-foreground-muted)]", className), ...props, children: "..." }));
}
