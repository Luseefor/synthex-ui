import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type ProgressSharedProps } from "./progress.shared";
export interface ProgressProps extends Omit<ViewProps, "style">, ProgressSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<View>>;
//# sourceMappingURL=progress.native.d.ts.map