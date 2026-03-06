import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { NavigationMenuItemProvider, NavigationMenuProvider, useNavigationMenuContext, useNavigationMenuController, useNavigationMenuItemContext, } from "./navigation-menu.shared";
export function NavigationMenu({ children, className, defaultValue, onValueChange, value, ...props }) {
    const controller = useNavigationMenuController({ defaultValue, onValueChange, value });
    return (_jsx(NavigationMenuProvider, { value: controller, children: _jsx("nav", { className: cn("flex flex-col gap-4", className), ...props, children: children }) }));
}
export const NavigationMenuList = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("flex flex-wrap items-center gap-2 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-background-subtle)] p-2", className), ...props })));
NavigationMenuList.displayName = "NavigationMenuList";
export const NavigationMenuItem = React.forwardRef(({ children, className, value, ...props }, ref) => (_jsx(NavigationMenuItemProvider, { value: { value }, children: _jsx("div", { ref: ref, className: cn("contents", className), ...props, children: children }) })));
NavigationMenuItem.displayName = "NavigationMenuItem";
export const NavigationMenuTrigger = React.forwardRef(({ children, className, onClick, type = "button", ...props }, ref) => {
    const context = useNavigationMenuContext();
    const item = useNavigationMenuItemContext();
    const isActive = context.value === item.value;
    return (_jsx("button", { ref: ref, type: type, "aria-expanded": isActive, className: cn("inline-flex min-w-[7rem] items-center justify-center rounded-[var(--sx-radius-md)] px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-[var(--sx-motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)]", isActive
            ? "bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground)] shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
            : "text-[color:var(--sx-color-foreground-muted)] hover:bg-[color:var(--sx-color-surface)] hover:text-[color:var(--sx-color-foreground)]", className), onClick: (event) => {
            context.setValue(context.value === item.value ? "" : item.value);
            onClick?.(event);
        }, ...props, children: children }));
});
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";
export const NavigationMenuLink = React.forwardRef(({ className, ...props }, ref) => (_jsx("a", { ref: ref, className: cn("inline-flex min-w-[7rem] items-center justify-center rounded-[var(--sx-radius-md)] px-3 py-2 text-sm font-medium text-[color:var(--sx-color-foreground-muted)] transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface)] hover:text-[color:var(--sx-color-foreground)]", className), ...props })));
NavigationMenuLink.displayName = "NavigationMenuLink";
export const NavigationMenuContent = React.forwardRef(({ children, className, ...props }, ref) => {
    const context = useNavigationMenuContext();
    const item = useNavigationMenuItemContext();
    const isActive = context.value === item.value;
    if (!isActive) {
        return null;
    }
    return (_jsx("div", { ref: ref, className: cn("rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]", className), ...props, children: children }));
});
NavigationMenuContent.displayName = "NavigationMenuContent";
