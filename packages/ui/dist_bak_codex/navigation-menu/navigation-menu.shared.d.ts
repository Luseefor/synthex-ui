import * as React from "react";
interface NavigationMenuContextValue {
    readonly value: string;
    readonly setValue: (value: string) => void;
}
interface NavigationMenuItemContextValue {
    readonly value: string;
}
export interface NavigationMenuSharedProps {
    readonly defaultValue?: string;
    readonly onValueChange?: (value: string) => void;
    readonly value?: string;
}
export interface NavigationMenuItemSharedProps {
    readonly value: string;
}
export declare function useNavigationMenuController({ defaultValue, onValueChange, value, }: NavigationMenuSharedProps): NavigationMenuContextValue;
export declare function NavigationMenuProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: NavigationMenuContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<NavigationMenuContextValue | null>>;
export declare function NavigationMenuItemProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: NavigationMenuItemContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<NavigationMenuItemContextValue | null>>;
export declare function useNavigationMenuContext(): NavigationMenuContextValue;
export declare function useNavigationMenuItemContext(): NavigationMenuItemContextValue;
export {};
//# sourceMappingURL=navigation-menu.shared.d.ts.map