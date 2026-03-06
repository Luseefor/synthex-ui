import * as React from "react";
import type { SidebarContextValue, SidebarMenuButtonSharedProps, SidebarProviderSharedProps, SidebarSharedProps, SidebarTriggerSharedProps } from "./sidebar.shared";
export interface SidebarProviderProps extends SidebarProviderSharedProps {
}
export interface SidebarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, SidebarSharedProps {
}
export interface SidebarInsetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, SidebarSharedProps {
}
export interface SidebarMenuButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">, SidebarMenuButtonSharedProps {
}
export interface SidebarTriggerProps extends SidebarTriggerSharedProps {
}
export declare function SidebarProvider({ children, defaultOpen }: SidebarProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useSidebar(): SidebarContextValue;
export declare const Sidebar: React.ForwardRefExoticComponent<SidebarProps & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarGroupLabel: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarGroupContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarMenu: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLUListElement> & React.RefAttributes<HTMLUListElement>>;
export declare const SidebarMenuItem: React.ForwardRefExoticComponent<React.LiHTMLAttributes<HTMLLIElement> & React.RefAttributes<HTMLLIElement>>;
export declare const SidebarMenuButton: React.ForwardRefExoticComponent<SidebarMenuButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare const SidebarInset: React.ForwardRefExoticComponent<SidebarInsetProps & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarRail: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const SidebarTrigger: React.ForwardRefExoticComponent<SidebarTriggerProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=sidebar.web.d.ts.map