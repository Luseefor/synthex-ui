import * as React from "react";
import { View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import type { SliderSharedProps } from "./slider.shared";
export interface SliderProps extends Omit<PressableProps, "style">, SliderSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Slider: React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<View>>;
//# sourceMappingURL=slider.native.d.ts.map