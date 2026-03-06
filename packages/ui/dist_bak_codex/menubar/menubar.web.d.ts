import * as React from "react";
import { type DropdownMenuContentProps, type DropdownMenuItemProps, type DropdownMenuLabelProps, type DropdownMenuProps, type DropdownMenuSeparatorProps, type DropdownMenuTriggerProps } from "../dropdown-menu/dropdown-menu.web";
export interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const Menubar: React.ForwardRefExoticComponent<MenubarProps & React.RefAttributes<HTMLDivElement>>;
export declare function MenubarMenu(props: DropdownMenuProps): import("react/jsx-runtime").JSX.Element;
export declare const MenubarTrigger: React.ForwardRefExoticComponent<DropdownMenuTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export declare const MenubarContent: React.ForwardRefExoticComponent<DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const MenubarItem: React.ForwardRefExoticComponent<DropdownMenuItemProps & React.RefAttributes<HTMLButtonElement>>;
export declare const MenubarLabel: React.ForwardRefExoticComponent<DropdownMenuLabelProps & React.RefAttributes<HTMLDivElement>>;
export declare const MenubarSeparator: React.ForwardRefExoticComponent<DropdownMenuSeparatorProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=menubar.web.d.ts.map