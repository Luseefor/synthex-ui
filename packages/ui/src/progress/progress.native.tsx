import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveProgressVariants, type ProgressSharedProps } from "./progress.shared";

export interface ProgressProps extends Omit<ViewProps, "style">, ProgressSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Progress = React.forwardRef<React.ElementRef<typeof View>, ProgressProps>(
  ({ max = 100, size, style, value = 0, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveProgressVariants({ size });
    const clampedValue = Math.min(Math.max(value, 0), max);
    const percentage = max <= 0 ? 0 : clampedValue / max;

    const heights: Record<typeof resolved.size, number> = {
      sm: 8,
      md: 12,
      lg: 16,
    };

    return (
      <View
        ref={ref}
        accessibilityRole="progressbar"
        style={[
          {
            overflow: "hidden",
            borderRadius: 999,
            height: heights[resolved.size],
            backgroundColor: theme.colors.secondaryMuted,
          },
          style,
        ]}
        {...props}
      >
        <View
          style={{
            width: `${percentage * 100}%`,
            height: "100%",
            backgroundColor: theme.colors.primary,
            borderRadius: 999,
          }}
        />
      </View>
    );
  },
);

Progress.displayName = "Progress";
