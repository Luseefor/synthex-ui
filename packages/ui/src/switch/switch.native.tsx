import * as React from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useControllableState } from "../hooks/useControllableState";
import { useTheme } from "../_shared/theme/context";
import { resolveSwitchVariants, type SwitchSharedProps } from "./switch.shared";

export interface SwitchProps
  extends Omit<PressableProps, "children" | "style">,
    SwitchSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Switch = React.forwardRef<React.ElementRef<typeof Pressable>, SwitchProps>(
  (
    {
      checked,
      defaultChecked = false,
      disabled,
      onCheckedChange,
      onPress,
      style,
      uiSize,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const [currentChecked, setCurrentChecked] = useControllableState({
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
      value: checked,
    });
    const resolved = resolveSwitchVariants({ uiSize });
    const isSmall = resolved.size === "sm";

    return (
      <Pressable
        ref={ref}
        accessibilityRole="switch"
        accessibilityState={{ checked: !!currentChecked, disabled: !!disabled }}
        disabled={disabled}
        onPress={(event) => {
          onPress?.(event);

          if (disabled || event.defaultPrevented) {
            return;
          }

          setCurrentChecked(!currentChecked);
        }}
        style={({ pressed }) => [
          {
            width: isSmall ? 40 : 48,
            height: isSmall ? 24 : 28,
            padding: 2,
            borderRadius: 999,
            backgroundColor: currentChecked ? theme.colors.primary : theme.colors.secondary,
            justifyContent: "center",
            opacity: pressed ? 0.94 : 1,
          },
          disabled && { opacity: 0.5 },
          style,
        ]}
        {...props}
      >
        <View
          style={{
            width: isSmall ? 20 : 24,
            height: isSmall ? 20 : 24,
            borderRadius: 999,
            backgroundColor: theme.colors.surface,
            transform: [{ translateX: currentChecked ? (isSmall ? 16 : 20) : 0 }],
          }}
        />
      </Pressable>
    );
  },
);

Switch.displayName = "Switch";
