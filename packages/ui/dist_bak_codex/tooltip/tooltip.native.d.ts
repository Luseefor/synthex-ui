import * as React from "react";
import { Text, type TextProps, View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type TooltipSharedProps } from "./tooltip.shared";
export interface TooltipProps extends Omit<ViewProps, "children" | "style">, TooltipSharedProps {
    readonly children: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare function Tooltip({ children, defaultOpen, onOpenChange, open, style, ...props }: TooltipProps): import("react/jsx-runtime").JSX.Element;
export interface TooltipTriggerProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly asChild?: boolean;
}
export declare const TooltipTrigger: React.ForwardRefExoticComponent<TooltipTriggerProps & React.RefAttributes<View>>;
export interface TooltipContentProps extends Omit<TextProps, "style"> {
    readonly style?: StyleProp<TextStyle>;
}
export declare const TooltipContent: React.ForwardRefExoticComponent<TooltipContentProps & React.RefAttributes<Text>>;
//# sourceMappingURL=tooltip.native.d.ts.map