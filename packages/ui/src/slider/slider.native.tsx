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

export interface SliderProps extends Omit<PressableProps, "disabled" | "style">, SliderSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Slider = React.forwardRef<React.ElementRef<typeof Pressable>, SliderProps>(
  (
    {
      defaultValue = [50],
      disabled = false,
      max = 100,
      min = 0,
      onValueChange,
      onValueCommit,
      orientation = "horizontal",
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
    const [trackSize, setTrackSize] = React.useState(0);
    const numericValue = currentValue[0] ?? min;
    const percentage = ((numericValue - min) / (max - min || 1)) * 100;
    const isVertical = orientation === "vertical";

    const commitValue = (next: number[]) => {
      setCurrentValue(next);
      onValueCommit?.(next);
    };

    const updateFromOffset = (offsetX: number, offsetY: number) => {
      if (trackSize <= 0 || disabled) {
        return;
      }

      const ratio = isVertical
        ? Math.min(1, Math.max(0, 1 - offsetY / trackSize))
        : Math.min(1, Math.max(0, offsetX / trackSize));
      const raw = min + ratio * (max - min);
      const snapped = Math.round(raw / step) * step;
      const next = [Math.min(max, Math.max(min, snapped))];
      commitValue(next);
    };

    return (
      <Pressable
        ref={ref}
        accessibilityRole="adjustable"
        accessibilityState={{ disabled: disabled || undefined }}
        accessibilityValue={{ min, max, now: numericValue }}
        disabled={disabled}
        onPress={(event) => updateFromOffset(event.nativeEvent.locationX, event.nativeEvent.locationY)}
        style={[
          isVertical
            ? { width: 40, height: 160, alignItems: "center", justifyContent: "center" }
            : { height: 40, justifyContent: "center" },
          disabled && { opacity: 0.45 },
          style,
        ]}
        {...props}
      >
        <View
          onLayout={(event: LayoutChangeEvent) =>
            setTrackSize(
              isVertical
                ? event.nativeEvent.layout.height
                : event.nativeEvent.layout.width,
            )
          }
          style={
            isVertical
              ? { width: 8, height: "100%", borderRadius: 999, backgroundColor: theme.colors.secondaryMuted }
              : { height: 8, borderRadius: 999, backgroundColor: theme.colors.secondaryMuted }
          }
        >
          <View
            style={
              isVertical
                ? {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: `${percentage}%`,
                    borderRadius: 999,
                    backgroundColor: theme.colors.primary,
                  }
                : {
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${percentage}%`,
                    borderRadius: 999,
                    backgroundColor: theme.colors.primary,
                  }
            }
          />
          <View
            style={
              isVertical
                ? {
                    position: "absolute",
                    left: -6,
                    bottom: `${percentage}%`,
                    width: 20,
                    height: 20,
                    marginBottom: -10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.borderStrong,
                    backgroundColor: theme.colors.surface,
                  }
                : {
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
                  }
            }
          />
        </View>
      </Pressable>
    );
  },
);

Slider.displayName = "Slider";
