import * as React from "react";
import type { SidebarContextValue, SidebarMenuButtonSharedProps, SidebarProviderSharedProps, SidebarSharedProps } from "./sidebar.shared";
export interface SidebarProviderProps extends SidebarProviderSharedProps {
}
export interface SidebarProps extends SidebarSharedProps {
}
export interface SidebarInsetProps extends SidebarSharedProps {
}
export interface SidebarMenuButtonProps extends SidebarMenuButtonSharedProps {
    readonly onPress?: () => void;
}
export interface SidebarTriggerProps {
    readonly children?: React.ReactNode;
}
export declare function SidebarProvider({ children, defaultOpen }: SidebarProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useSidebar(): SidebarContextValue;
export declare function Sidebar({ children }: SidebarProps): import("react/jsx-runtime").JSX.Element;
export declare function SidebarHeader({ children }: SidebarSharedProps): import("react/jsx-runtime").JSX.Element;
export declare function SidebarFooter({ children }: SidebarSharedProps): import("react/jsx-runtime").JSX.Element;
export declare function SidebarContent({ children }: SidebarSharedProps): import("react/jsx-runtime").JSX.Element;
export declare function SidebarGroup({ children }: SidebarSharedProps): import("react/jsx-runtime").JSX.Element;
export declare function SidebarGroupLabel({ children }: SidebarSharedProps): import("react/jsx-runtime").JSX.Element;
export declare function SidebarGroupContent({ children }: SidebarSharedProps): import("react/jsx-runtime").JSX.Element;
export declare function SidebarMenu({ children }: SidebarSharedProps): import("react/jsx-runtime").JSX.Element;
export declare function SidebarMenuItem({ children }: SidebarSharedProps): import("react/jsx-runtime").JSX.Element;
export declare function SidebarMenuButton({ active, children, onPress }: SidebarMenuButtonProps): import("react/jsx-runtime").JSX.Element;
export declare function SidebarInset({ children }: SidebarInsetProps): import("react/jsx-runtime").JSX.Element;
export declare function SidebarRail(): import("react/jsx-runtime").JSX.Element;
export declare function SidebarTrigger({ children }: SidebarTriggerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=sidebar.native.d.ts.map