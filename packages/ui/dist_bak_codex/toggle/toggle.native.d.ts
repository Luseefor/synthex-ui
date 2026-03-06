import * as React from "react";
import { type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { type ToggleSharedProps } from "./toggle.shared";
export interface ToggleProps extends Omit<PressableProps, "children" | "style">, ToggleSharedProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare const Toggle: React.ForwardRefExoticComponent<ToggleProps & React.RefAttributes<import("react-native").View>>;
//# sourceMappingURL=toggle.native.d.ts.map