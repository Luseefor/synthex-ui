import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";
import {
  resolveSeparatorVariants,
  type SeparatorVariantProps,
} from "./separator.shared";

export interface SeparatorProps extends Omit<ViewProps, "style">, SeparatorVariantProps {
  readonly style?: StyleProp<ViewStyle>;
}

export function Separator({ orientation, style, ...props }: SeparatorProps) {
  const theme = useTheme();
  const resolved = resolveSeparatorVariants({ orientation });

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.border,
        },
        resolved.orientation === "horizontal"
          ? {
              height: 1,
              width: "100%",
            }
          : {
              height: "100%",
              width: 1,
            },
        style,
      ]}
      {...props}
    />
  );
}
