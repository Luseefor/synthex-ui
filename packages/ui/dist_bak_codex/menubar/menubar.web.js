import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "../dropdown-menu/dropdown-menu.web";
export const Menubar = React.forwardRef(({ className, ...props }, ref) => (_jsx("div", { ref: ref, role: "menubar", className: cn("inline-flex max-w-full flex-wrap items-center gap-1 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-background-subtle)] p-1", className), ...props })));
Menubar.displayName = "Menubar";
export function MenubarMenu(props) {
    return _jsx(DropdownMenu, { ...props });
}
export const MenubarTrigger = React.forwardRef(({ className, ...props }, ref) => (_jsx(DropdownMenuTrigger, { ref: ref, className: cn("inline-flex min-w-[6rem] items-center justify-center rounded-[var(--sx-radius-md)] px-3 py-2 text-sm font-medium text-[color:var(--sx-color-foreground-muted)] transition-[background-color,color,box-shadow] duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface)] hover:text-[color:var(--sx-color-foreground)]", className), ...props })));
MenubarTrigger.displayName = "MenubarTrigger";
export const MenubarContent = React.forwardRef(({ className, ...props }, ref) => (_jsx(DropdownMenuContent, { ref: ref, className: cn("min-w-52", className), ...props })));
MenubarContent.displayName = "MenubarContent";
export const MenubarItem = React.forwardRef(({ className, ...props }, ref) => _jsx(DropdownMenuItem, { ref: ref, className: className, ...props }));
MenubarItem.displayName = "MenubarItem";
export const MenubarLabel = React.forwardRef(({ className, ...props }, ref) => _jsx(DropdownMenuLabel, { ref: ref, className: className, ...props }));
MenubarLabel.displayName = "MenubarLabel";
export const MenubarSeparator = React.forwardRef(({ className, ...props }, ref) => (_jsx(DropdownMenuSeparator, { ref: ref, className: className, ...props })));
MenubarSeparator.displayName = "MenubarSeparator";
