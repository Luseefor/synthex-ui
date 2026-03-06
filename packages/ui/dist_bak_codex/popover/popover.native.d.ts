import * as React from "react";
import { View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type PopoverSharedProps } from "./popover.shared";
export interface PopoverProps extends Omit<ViewProps, "children" | "style">, PopoverSharedProps {
    readonly children: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare function Popover({ children, defaultOpen, onOpenChange, open, style, ...props }: PopoverProps): import("react/jsx-runtime").JSX.Element;
export interface PopoverTriggerProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly asChild?: boolean;
}
export declare const PopoverTrigger: React.ForwardRefExoticComponent<PopoverTriggerProps & React.RefAttributes<View>>;
export interface PopoverContentProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const PopoverContent: React.ForwardRefExoticComponent<PopoverContentProps & React.RefAttributes<View>>;
//# sourceMappingURL=popover.native.d.ts.map