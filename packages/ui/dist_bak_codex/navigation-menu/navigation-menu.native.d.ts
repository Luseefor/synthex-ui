import * as React from "react";
import { View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type NavigationMenuItemSharedProps, type NavigationMenuSharedProps } from "./navigation-menu.shared";
export interface NavigationMenuProps extends Omit<ViewProps, "style">, NavigationMenuSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare function NavigationMenu({ children, defaultValue, onValueChange, style, value, ...props }: NavigationMenuProps): import("react/jsx-runtime").JSX.Element;
export interface NavigationMenuListProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const NavigationMenuList: React.ForwardRefExoticComponent<NavigationMenuListProps & React.RefAttributes<View>>;
export interface NavigationMenuItemProps extends Omit<ViewProps, "style">, NavigationMenuItemSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const NavigationMenuItem: React.ForwardRefExoticComponent<NavigationMenuItemProps & React.RefAttributes<View>>;
export interface NavigationMenuTriggerProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const NavigationMenuTrigger: React.ForwardRefExoticComponent<NavigationMenuTriggerProps & React.RefAttributes<View>>;
export interface NavigationMenuLinkProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const NavigationMenuLink: React.ForwardRefExoticComponent<NavigationMenuLinkProps & React.RefAttributes<View>>;
export interface NavigationMenuContentProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const NavigationMenuContent: React.ForwardRefExoticComponent<NavigationMenuContentProps & React.RefAttributes<View>>;
//# sourceMappingURL=navigation-menu.native.d.ts.map