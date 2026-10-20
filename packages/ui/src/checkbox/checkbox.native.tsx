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
  type CheckboxCheckedState,
  type CheckboxSharedProps,
} from "./checkbox.shared";

export interface CheckboxProps
  extends Omit<PressableProps, "children" | "style">,
    CheckboxSharedProps {
  readonly name?: string;
  readonly style?: StyleProp<ViewStyle>;
}

export const Checkbox = React.forwardRef<React.ElementRef<typeof Pressable>, CheckboxProps>(
  (
    {
      checked,
      defaultChecked = false,
      disabled,
      invalid,
      // Accepted for web form-parity; no native form element to forward to.
      name: _name,
      onCheckedChange,
      onPress,
      required: _required,
      style,
      uiSize,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const [currentChecked, setCurrentChecked] = useControllableState<CheckboxCheckedState>({
      defaultValue: defaultChecked,
      onChange: (next) => {
        if (next !== "indeterminate") {
          onCheckedChange?.(next);
        }
      },
      value: checked,
    });
    const resolved = resolveCheckboxVariants({ invalid, uiSize });
    const isIndeterminate = currentChecked === "indeterminate";
    const isChecked = currentChecked === true || isIndeterminate;

    const checkboxStyle = React.useMemo<ViewStyle>(() => {
      const dimensions =
        resolved.size === "sm"
          ? { width: 16, height: 16, borderRadius: 6 }
          : { width: 20, height: 20, borderRadius: 7 };

      return {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: isChecked
          ? theme.colors.primary
          : resolved.tone === "invalid"
            ? theme.colors.destructive
            : theme.colors.borderStrong,
        backgroundColor: isChecked ? theme.colors.primary : theme.colors.surface,
        ...dimensions,
      };
    }, [isChecked, resolved.size, resolved.tone, theme]);

    return (
      <Pressable
        ref={ref}
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: isIndeterminate ? "mixed" : isChecked,
          disabled: !!disabled,
        }}
        disabled={disabled}
        onPress={(event) => {
          onPress?.(event);

          if (disabled || event.defaultPrevented) {
            return;
          }

          setCurrentChecked(currentChecked === true ? false : true);
        }}
        style={({ pressed }) => [
          checkboxStyle,
          pressed && { opacity: 0.92 },
          disabled && { opacity: 0.5 },
          style,
        ]}
        {...props}
      >
        <View style={{ opacity: isChecked ? 1 : 0 }}>
          {isIndeterminate ? (
            <View
              style={{
                width: 10,
                height: 2,
                borderRadius: 999,
                backgroundColor: theme.colors.foregroundOnBrand,
              }}
            />
          ) : (
            <CheckIcon
              color={theme.colors.foregroundOnBrand}
              size={resolved.size === "sm" ? 11 : 14}
              strokeWidth={2.6}
            />
          )}
        </View>
      </Pressable>
    );
  },
);

Checkbox.displayName = "Checkbox";
