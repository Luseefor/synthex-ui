import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { TabsProvider, useTabsContext, useTabsController, } from "./tabs.shared";
export function Tabs({ children, className, defaultValue, onValueChange, value, ...props }) {
    const controller = useTabsController({ defaultValue, onValueChange, value });
    return (_jsx(TabsProvider, { value: controller, children: _jsx("div", { className: cn("flex flex-col gap-4", className), "data-orientation": "horizontal", ...props, children: children }) }));
}
export const TabsList = React.forwardRef(({ className, onKeyDown, ...props }, ref) => (_jsx("div", { ref: ref, role: "tablist", "aria-orientation": "horizontal", className: cn("inline-flex max-w-full flex-wrap items-center gap-1 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-background-subtle)] p-1", className), onKeyDown: (event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented)
            return;
        const target = event.currentTarget;
        const triggers = Array.from(target.querySelectorAll('[role="tab"]:not([disabled])'));
        const currentIndex = triggers.indexOf(document.activeElement);
        if (currentIndex === -1)
            return;
        let nextIndex;
        switch (event.key) {
            case "ArrowRight":
                nextIndex = (currentIndex + 1) % triggers.length;
                break;
            case "ArrowLeft":
                nextIndex =
                    (currentIndex - 1 + triggers.length) % triggers.length;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = triggers.length - 1;
                break;
            default:
                return;
        }
        event.preventDefault();
        triggers[nextIndex]?.focus();
        triggers[nextIndex]?.click();
    }, ...props })));
TabsList.displayName = "TabsList";
export const TabsTrigger = React.forwardRef(({ children, className, disabled, onClick, value, ...props }, ref) => {
    const context = useTabsContext();
    const isActive = context.value === value;
    return (_jsx("button", { ref: ref, type: "button", role: "tab", "aria-selected": isActive, tabIndex: isActive ? 0 : -1, "data-state": isActive ? "active" : "inactive", disabled: disabled, className: cn("inline-flex min-w-[6.5rem] items-center justify-center select-none rounded-[var(--sx-radius-md)] px-3 py-2 text-sm font-medium tracking-[-0.01em] transition-[background-color,color,box-shadow] duration-[var(--sx-motion-fast)] ease-[var(--sx-easing-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:pointer-events-none disabled:opacity-45", isActive
            ? "bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground)] shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
            : "text-[color:var(--sx-color-foreground-muted)] hover:text-[color:var(--sx-color-foreground)]", className), onClick: (event) => {
            context.setValue(value);
            onClick?.(event);
        }, ...props, children: children }));
});
TabsTrigger.displayName = "TabsTrigger";
export const TabsContent = React.forwardRef(({ children, className, forceMount, value, ...props }, ref) => {
    const context = useTabsContext();
    const isActive = context.value === value;
    if (!isActive && !forceMount) {
        return null;
    }
    return (_jsx("div", { ref: ref, role: "tabpanel", tabIndex: 0, hidden: !isActive, "data-state": isActive ? "active" : "inactive", className: cn("rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)]", className), ...props, children: children }));
});
TabsContent.displayName = "TabsContent";
