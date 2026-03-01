import * as React from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useControllableState } from "../hooks/useControllableState";
import { CheckIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import {
  resolveCheckboxVariants,
  type CheckboxSharedProps,
} from "./checkbox.shared";

export interface CheckboxProps
  extends Omit<PressableProps, "children" | "style">,
    CheckboxSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Checkbox = React.forwardRef<React.ElementRef<typeof Pressable>, CheckboxProps>(
  (
    {
      checked,
      defaultChecked = false,
      disabled,
      invalid,
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
    const resolved = resolveCheckboxVariants({ invalid, uiSize });

    const checkboxStyle = React.useMemo<ViewStyle>(() => {
      const dimensions =
        resolved.size === "sm"
          ? { width: 16, height: 16, borderRadius: 6 }
          : { width: 20, height: 20, borderRadius: 7 };

      return {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: currentChecked
          ? theme.colors.primary
          : resolved.tone === "invalid"
            ? theme.colors.destructive
            : theme.colors.borderStrong,
        backgroundColor: currentChecked ? theme.colors.primary : theme.colors.surface,
        ...dimensions,
      };
    }, [currentChecked, resolved.size, resolved.tone, theme]);

    return (
      <Pressable
        ref={ref}
        accessibilityRole="checkbox"
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
          checkboxStyle,
          pressed && { opacity: 0.92 },
          disabled && { opacity: 0.5 },
          style,
        ]}
        {...props}
      >
        <View style={{ opacity: currentChecked ? 1 : 0 }}>
          <CheckIcon
            color={theme.colors.foregroundOnBrand}
            size={resolved.size === "sm" ? 11 : 14}
            strokeWidth={2.6}
          />
        </View>
      </Pressable>
    );
  },
);

Checkbox.displayName = "Checkbox";
