import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type SkeletonSharedProps } from "./skeleton.shared";
export interface SkeletonProps extends Omit<ViewProps, "style">, SkeletonSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Skeleton: React.ForwardRefExoticComponent<SkeletonProps & React.RefAttributes<View>>;
//# sourceMappingURL=skeleton.native.d.ts.map