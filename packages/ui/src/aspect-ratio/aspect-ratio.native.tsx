import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import type { AspectRatioSharedProps } from "./aspect-ratio.shared";

export interface AspectRatioProps extends Omit<ViewProps, "style">, AspectRatioSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export const AspectRatio = React.forwardRef<React.ElementRef<typeof View>, AspectRatioProps>(
  ({ children, ratio = 16 / 9, style, ...props }, ref) => (
    <View ref={ref} style={[{ width: "100%", aspectRatio: ratio, overflow: "hidden" }, style]} {...props}>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  ),
);

AspectRatio.displayName = "AspectRatio";
