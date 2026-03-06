import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { Toggle } from "../toggle/toggle.native";
import { type ToggleGroupSharedProps } from "./toggle-group.shared";
export interface ToggleGroupProps extends Omit<ViewProps, "style">, ToggleGroupSharedProps {
    readonly children?: React.ReactNode;
    readonly defaultValue?: string | string[];
    readonly style?: StyleProp<ViewStyle>;
}
export declare function ToggleGroup({ children, defaultValue, disabled, onValueChange, style, type, value, ...props }: ToggleGroupProps): import("react/jsx-runtime").JSX.Element;
export interface ToggleGroupItemProps extends React.ComponentPropsWithoutRef<typeof Toggle> {
    readonly value: string;
}
export declare const ToggleGroupItem: React.ForwardRefExoticComponent<ToggleGroupItemProps & React.RefAttributes<View>>;
//# sourceMappingURL=toggle-group.native.d.ts.map