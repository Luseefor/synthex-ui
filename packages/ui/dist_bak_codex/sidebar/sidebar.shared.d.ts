import type { ButtonHTMLAttributes, ReactNode } from "react";
export interface SidebarProviderSharedProps {
    readonly children: ReactNode;
    readonly defaultOpen?: boolean;
}
export interface SidebarSharedProps {
    readonly children: ReactNode;
}
export interface SidebarMenuButtonSharedProps {
    readonly active?: boolean;
    readonly children: ReactNode;
}
export interface SidebarContextValue {
    readonly open: boolean;
    readonly setOpen: (value: boolean) => void;
    readonly toggle: () => void;
}
export interface SidebarTriggerSharedProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    readonly children?: ReactNode;
}
//# sourceMappingURL=sidebar.shared.d.ts.map