import * as React from "react";
import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import {
  RadioGroupProvider,
  useRadioGroupContext,
  useRadioGroupController,
  type RadioGroupItemSharedProps,
  type RadioGroupSharedProps,
} from "./radio-group.shared";

export interface RadioGroupProps
  extends Omit<ViewProps, "style">,
    RadioGroupSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export function RadioGroup({
  children,
  defaultValue,
  onValueChange,
  style,
  value,
  ...props
}: RadioGroupProps) {
  const controller = useRadioGroupController({ defaultValue, onValueChange, value });

  return (
    <RadioGroupProvider value={controller}>
      <View
        accessibilityRole="radiogroup"
        style={[{ gap: 12 }, style]}
        {...props}
      >
        {children}
      </View>
    </RadioGroupProvider>
  );
}

export interface RadioGroupItemProps
  extends Omit<PressableProps, "style">,
    RadioGroupItemSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly textStyle?: StyleProp<TextStyle>;
}

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  RadioGroupItemProps
>(({ children, disabled, onPress, style, textStyle, value, ...props }, ref) => {
  const context = useRadioGroupContext();
  const theme = useTheme();
  const isActive = context.value === value;

  return (
      <Pressable
        ref={ref}
        accessibilityRole="radio"
        accessibilityState={{ checked: !!isActive, disabled: !!disabled }}
        disabled={disabled}
      onPress={(event) => {
        context.setValue(value);
        onPress?.(event);
      }}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 4,
          opacity: pressed ? 0.92 : 1,
        },
        disabled && { opacity: 0.45 },
        style,
      ]}
      {...props}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
          borderColor: isActive ? theme.colors.primary : theme.colors.borderStrong,
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            backgroundColor: theme.colors.primary,
            opacity: isActive ? 1 : 0,
            transform: [{ scale: isActive ? 1 : 0.6 }],
          }}
        />
      </View>
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          style={[
            {
              color: theme.colors.foreground,
              fontFamily: theme.typography.family.sans,
              fontSize: theme.typography.size.sm,
              fontWeight: theme.typography.weight.medium,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
});

RadioGroupItem.displayName = "RadioGroupItem";
