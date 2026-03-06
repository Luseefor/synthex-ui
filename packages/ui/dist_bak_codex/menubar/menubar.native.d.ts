import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type DropdownMenuContentProps, type DropdownMenuItemProps, type DropdownMenuLabelProps, type DropdownMenuProps, type DropdownMenuSeparatorProps, type DropdownMenuTriggerProps } from "../dropdown-menu/dropdown-menu.native";
export interface MenubarProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Menubar: React.ForwardRefExoticComponent<MenubarProps & React.RefAttributes<View>>;
export declare function MenubarMenu(props: DropdownMenuProps): import("react/jsx-runtime").JSX.Element;
export declare const MenubarTrigger: React.ForwardRefExoticComponent<DropdownMenuTriggerProps & React.RefAttributes<View>>;
export declare const MenubarContent: React.ForwardRefExoticComponent<DropdownMenuContentProps & React.RefAttributes<View>>;
export declare const MenubarItem: React.ForwardRefExoticComponent<DropdownMenuItemProps & React.RefAttributes<View>>;
export declare const MenubarLabel: React.ForwardRefExoticComponent<DropdownMenuLabelProps & React.RefAttributes<View>>;
export declare const MenubarSeparator: React.ForwardRefExoticComponent<DropdownMenuSeparatorProps & React.RefAttributes<View>>;
//# sourceMappingURL=menubar.native.d.ts.map