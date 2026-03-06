import * as React from "react";
import { View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type CollapsibleSharedProps } from "./collapsible.shared";
export interface CollapsibleProps extends Omit<ViewProps, "style">, CollapsibleSharedProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare function Collapsible({ children, defaultOpen, disabled, onOpenChange, open, style, ...props }: CollapsibleProps): import("react/jsx-runtime").JSX.Element;
export interface CollapsibleTriggerProps extends Omit<PressableProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare const CollapsibleTrigger: React.ForwardRefExoticComponent<CollapsibleTriggerProps & React.RefAttributes<View>>;
export interface CollapsibleContentProps extends Omit<ViewProps, "style"> {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare const CollapsibleContent: React.ForwardRefExoticComponent<CollapsibleContentProps & React.RefAttributes<View>>;
//# sourceMappingURL=collapsible.native.d.ts.map