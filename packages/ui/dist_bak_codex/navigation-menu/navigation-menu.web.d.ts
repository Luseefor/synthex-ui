import * as React from "react";
import { type NavigationMenuItemSharedProps, type NavigationMenuSharedProps } from "./navigation-menu.shared";
export interface NavigationMenuProps extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue" | "onChange" | "value">, NavigationMenuSharedProps {
}
export declare function NavigationMenu({ children, className, defaultValue, onValueChange, value, ...props }: NavigationMenuProps): import("react/jsx-runtime").JSX.Element;
export interface NavigationMenuListProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare const NavigationMenuList: React.ForwardRefExoticComponent<NavigationMenuListProps & React.RefAttributes<HTMLDivElement>>;
export interface NavigationMenuItemProps extends React.HTMLAttributes<HTMLDivElement>, NavigationMenuItemSharedProps {
}
export declare const NavigationMenuItem: React.ForwardRefExoticComponent<NavigationMenuItemProps & React.RefAttributes<HTMLDivElement>>;
export declare const NavigationMenuTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const NavigationMenuLink: React.ForwardRefExoticComponent<React.AnchorHTMLAttributes<HTMLAnchorElement> & React.RefAttributes<HTMLAnchorElement>>;
export declare const NavigationMenuContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=navigation-menu.web.d.ts.map