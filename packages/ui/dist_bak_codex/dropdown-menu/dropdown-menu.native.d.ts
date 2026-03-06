import * as React from "react";
import { View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type DropdownMenuSharedProps } from "./dropdown-menu.shared";
export interface DropdownMenuProps extends Omit<ViewProps, "children" | "style">, DropdownMenuSharedProps {
    readonly children: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare function DropdownMenu({ children, defaultOpen, onOpenChange, open, style, ...props }: DropdownMenuProps): import("react/jsx-runtime").JSX.Element;
export interface DropdownMenuTriggerProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly asChild?: boolean;
}
export declare const DropdownMenuTrigger: React.ForwardRefExoticComponent<DropdownMenuTriggerProps & React.RefAttributes<View>>;
export interface DropdownMenuContentProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const DropdownMenuContent: React.ForwardRefExoticComponent<DropdownMenuContentProps & React.RefAttributes<View>>;
export interface DropdownMenuLabelProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const DropdownMenuLabel: React.ForwardRefExoticComponent<DropdownMenuLabelProps & React.RefAttributes<View>>;
export interface DropdownMenuSeparatorProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const DropdownMenuSeparator: React.ForwardRefExoticComponent<DropdownMenuSeparatorProps & React.RefAttributes<View>>;
export interface DropdownMenuItemProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const DropdownMenuItem: React.ForwardRefExoticComponent<DropdownMenuItemProps & React.RefAttributes<View>>;
//# sourceMappingURL=dropdown-menu.native.d.ts.map