import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { SearchIcon } from "../icons/index.web";
import { CommandProvider, matchesCommandQuery, useCommandContext, useCommandController, } from "./command.shared";
export function Command({ children, className, defaultQuery, onQueryChange, query, shouldFilter, ...props }) {
    const controller = useCommandController({
        defaultQuery,
        onQueryChange,
        query,
        shouldFilter,
    });
    return (_jsx(CommandProvider, { value: controller, children: _jsx("div", { className: cn("rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-[0_12px_28px_rgba(15,23,42,0.06)]", className), ...props, children: children }) }));
}
export const CommandInput = React.forwardRef(({ className, onChange, placeholder = "Search commands", type = "text", ...props }, ref) => {
    const context = useCommandContext();
    return (_jsxs("div", { className: "flex items-center gap-3 border-b border-[color:var(--sx-color-border)] px-3.5 py-3", children: [_jsx(SearchIcon, { size: 15, color: "var(--sx-color-foreground-muted)" }), _jsx("input", { ref: ref, type: type, value: context.query, className: cn("w-full bg-transparent text-sm text-[color:var(--sx-color-foreground)] placeholder:text-[color:var(--sx-color-foreground-muted)] focus:outline-none", className), onChange: (event) => {
                    context.setQuery(event.target.value);
                    onChange?.(event);
                }, placeholder: placeholder, ...props })] }));
});
CommandInput.displayName = "CommandInput";
export const CommandList = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, role: "listbox", className: cn("max-h-72 overflow-y-auto p-2", className), ...props })));
CommandList.displayName = "CommandList";
export const CommandEmpty = React.forwardRef(({ children = "No results found.", className, ...props }, ref) => {
    const context = useCommandContext();
    if (context.visibleItemCount > 0) {
        return null;
    }
    return (_jsx("div", { ref: ref, className: cn("px-3 py-8 text-center text-sm text-[color:var(--sx-color-foreground-muted)]", className), ...props, children: children }));
});
CommandEmpty.displayName = "CommandEmpty";
export const CommandGroup = React.forwardRef(({ children, className, heading, ...props }, ref) => (_jsxs("div", { ref: ref, className: cn("space-y-1 py-1", className), ...props, children: [heading ? (_jsx("div", { className: "px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground-muted)]", children: heading })) : null, _jsx("div", { className: "space-y-1", children: children })] })));
CommandGroup.displayName = "CommandGroup";
export const CommandItem = React.forwardRef(({ children, className, keywords, onClick, onCommandSelect, textValue, value, ...props }, ref) => {
    const context = useCommandContext();
    const itemId = React.useId();
    const searchValue = textValue ??
        (typeof children === "string" || typeof children === "number" ? String(children) : value) ??
        "";
    const itemValue = value ?? searchValue;
    const visible = matchesCommandQuery(context.query, searchValue, keywords);
    React.useEffect(() => {
        context.setItemVisibility(itemId, visible);
        return () => context.unregisterItem(itemId);
    }, [context, itemId, visible]);
    if (!visible) {
        return null;
    }
    return (_jsx("button", { ref: ref, type: "button", role: "option", className: cn("flex w-full items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] transition-[background-color,color] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-surface)] disabled:pointer-events-none disabled:opacity-45", className), onClick: (event) => {
            onCommandSelect?.(itemValue);
            onClick?.(event);
        }, ...props, children: children }));
});
CommandItem.displayName = "CommandItem";
