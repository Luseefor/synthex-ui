import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveSkeletonVariants, type SkeletonSharedProps } from "./skeleton.shared";

export interface SkeletonProps extends Omit<ViewProps, "style">, SkeletonSharedProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export const Skeleton: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SkeletonProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, SkeletonProps>(
  ({ style, testID, variant, ...props }, ref) => {
    const theme = useTheme();
    const resolved = resolveSkeletonVariants({ variant });

    return (
      <View
        ref={ref}
        style={[
          {
            borderRadius: theme.radius.md,
            backgroundColor:
              resolved.variant === "soft"
                ? theme.colors.surfaceMuted
                : theme.colors.secondaryMuted,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";
