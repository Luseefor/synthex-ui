import * as React from "react";
import { View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { type CheckboxSharedProps } from "./checkbox.shared";
export interface CheckboxProps extends Omit<PressableProps, "children" | "style">, CheckboxSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<View>>;
//# sourceMappingURL=checkbox.native.d.ts.map