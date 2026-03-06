import * as React from "react";
import { View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type TabsContentSharedProps, type TabsSharedProps, type TabsTriggerSharedProps } from "./tabs.shared";
export interface TabsProps extends Omit<ViewProps, "style">, TabsSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare function Tabs({ children, defaultValue, onValueChange, style, value, ...props }: TabsProps): import("react/jsx-runtime").JSX.Element;
export interface TabsListProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const TabsList: React.ForwardRefExoticComponent<TabsListProps & React.RefAttributes<View>>;
export interface TabsTriggerProps extends Omit<PressableProps, "children" | "style">, TabsTriggerSharedProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const TabsTrigger: React.ForwardRefExoticComponent<TabsTriggerProps & React.RefAttributes<View>>;
export interface TabsContentProps extends Omit<ViewProps, "style">, TabsContentSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const TabsContent: React.ForwardRefExoticComponent<TabsContentProps & React.RefAttributes<View>>;
//# sourceMappingURL=tabs.native.d.ts.map