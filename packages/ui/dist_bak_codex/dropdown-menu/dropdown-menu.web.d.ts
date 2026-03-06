import * as React from "react";
import { type DropdownMenuSharedProps } from "./dropdown-menu.shared";
export interface DropdownMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, DropdownMenuSharedProps {
    readonly children: React.ReactNode;
}
export declare function DropdownMenu({ children, className, defaultOpen, onOpenChange, open, ...props }: DropdownMenuProps): import("react/jsx-runtime").JSX.Element;
export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    readonly asChild?: boolean;
}
export declare const DropdownMenuTrigger: React.ForwardRefExoticComponent<DropdownMenuTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const DropdownMenuContent: React.ForwardRefExoticComponent<DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>>;
export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const DropdownMenuLabel: React.ForwardRefExoticComponent<DropdownMenuLabelProps & React.RefAttributes<HTMLDivElement>>;
export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const DropdownMenuSeparator: React.ForwardRefExoticComponent<DropdownMenuSeparatorProps & React.RefAttributes<HTMLDivElement>>;
export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}
export declare const DropdownMenuItem: React.ForwardRefExoticComponent<DropdownMenuItemProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=dropdown-menu.web.d.ts.map