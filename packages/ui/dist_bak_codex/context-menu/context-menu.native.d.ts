import * as React from "react";
import { View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type ContextMenuSharedProps } from "./context-menu.shared";
export interface ContextMenuProps extends Omit<ViewProps, "children" | "style">, ContextMenuSharedProps {
    readonly children: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare function ContextMenu({ children, defaultOpen, onOpenChange, open, style, ...props }: ContextMenuProps): import("react/jsx-runtime").JSX.Element;
export interface ContextMenuTriggerProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare const ContextMenuTrigger: React.ForwardRefExoticComponent<ContextMenuTriggerProps & React.RefAttributes<View>>;
export interface ContextMenuContentProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const ContextMenuContent: React.ForwardRefExoticComponent<ContextMenuContentProps & React.RefAttributes<View>>;
export interface ContextMenuLabelProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const ContextMenuLabel: React.ForwardRefExoticComponent<ContextMenuLabelProps & React.RefAttributes<View>>;
export interface ContextMenuSeparatorProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const ContextMenuSeparator: React.ForwardRefExoticComponent<ContextMenuSeparatorProps & React.RefAttributes<View>>;
export interface ContextMenuItemProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const ContextMenuItem: React.ForwardRefExoticComponent<ContextMenuItemProps & React.RefAttributes<View>>;
//# sourceMappingURL=context-menu.native.d.ts.map