import * as React from "react";
import { View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { type SwitchSharedProps } from "./switch.shared";
export interface SwitchProps extends Omit<PressableProps, "children" | "style">, SwitchSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<View>>;
//# sourceMappingURL=switch.native.d.ts.map