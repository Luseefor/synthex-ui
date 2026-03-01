import * as React from "react";
import {
  Pressable,
  View,
  type LayoutChangeEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { useControllableState } from "../hooks/useControllableState";
import type { SliderSharedProps } from "./slider.shared";

export interface SliderProps extends Omit<PressableProps, "style">, SliderSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Slider = React.forwardRef<React.ElementRef<typeof Pressable>, SliderProps>(
  (
    {
      defaultValue = [50],
      max = 100,
      min = 0,
      onValueChange,
      step = 1,
      style,
      value,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const [currentValue, setCurrentValue] = useControllableState<number[]>({
      defaultValue,
      onChange: onValueChange,
      value,
    });
    const [trackWidth, setTrackWidth] = React.useState(0);
    const numericValue = currentValue[0] ?? min;
    const percentage = ((numericValue - min) / (max - min || 1)) * 100;

    const updateFromOffset = (offsetX: number) => {
      if (trackWidth <= 0) {
        return;
      }

      const ratio = Math.min(1, Math.max(0, offsetX / trackWidth));
      const raw = min + ratio * (max - min);
      const snapped = Math.round(raw / step) * step;
      setCurrentValue([Math.min(max, Math.max(min, snapped))]);
    };

    return (
      <Pressable
        ref={ref}
        accessibilityRole="adjustable"
        onPress={(event) => updateFromOffset(event.nativeEvent.locationX)}
        style={[{ height: 40, justifyContent: "center" }, style]}
        {...props}
      >
        <View
          onLayout={(event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width)}
          style={{ height: 8, borderRadius: 999, backgroundColor: theme.colors.secondaryMuted }}
        >
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${percentage}%`,
              borderRadius: 999,
              backgroundColor: theme.colors.primary,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: -6,
              left: `${percentage}%`,
              width: 20,
              height: 20,
              marginLeft: -10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.colors.borderStrong,
              backgroundColor: theme.colors.surface,
            }}
          />
        </View>
      </Pressable>
    );
  },
);

Slider.displayName = "Slider";
