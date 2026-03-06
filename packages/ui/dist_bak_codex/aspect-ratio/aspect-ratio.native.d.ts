import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import type { AspectRatioSharedProps } from "./aspect-ratio.shared";
export interface AspectRatioProps extends Omit<ViewProps, "style">, AspectRatioSharedProps {
    readonly children?: React.ReactNode;
    readonly style?: StyleProp<ViewStyle>;
}
export declare const AspectRatio: React.ForwardRefExoticComponent<AspectRatioProps & React.RefAttributes<View>>;
//# sourceMappingURL=aspect-ratio.native.d.ts.map