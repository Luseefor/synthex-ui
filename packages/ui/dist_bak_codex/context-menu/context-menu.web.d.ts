import * as React from "react";
import { type ContextMenuSharedProps } from "./context-menu.shared";
export interface ContextMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, ContextMenuSharedProps {
    readonly children: React.ReactNode;
}
export declare function ContextMenu({ children, className, defaultOpen, onOpenChange, open, ...props }: ContextMenuProps): import("react/jsx-runtime").JSX.Element;
export declare const ContextMenuTrigger: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ContextMenuContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ContextMenuLabel: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ContextMenuSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ContextMenuItem: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=context-menu.web.d.ts.map