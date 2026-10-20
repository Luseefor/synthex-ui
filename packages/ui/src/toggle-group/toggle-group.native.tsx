import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { useControllableState } from "../hooks/useControllableState";
import { Toggle } from "../toggle/toggle.native";
import { ToggleGroupProvider, useToggleGroupContext, type ToggleGroupSharedProps } from "./toggle-group.shared";

export interface ToggleGroupProps extends Omit<ViewProps, "style">, ToggleGroupSharedProps {
  readonly children?: React.ReactNode;
  readonly defaultValue?: string | string[];
  readonly style?: StyleProp<ViewStyle>;
}

export function ToggleGroup({
  children,
  defaultValue,
  disabled = false,
  onValueChange,
  style,
  type = "single",
  value,
  ...props
}: ToggleGroupProps) {
  const [currentValue, setCurrentValue] = useControllableState<string | string[]>({
    defaultValue: defaultValue ?? (type === "multiple" ? [] : ""),
    onChange: onValueChange,
    value,
  });

  const context = React.useMemo(() => ({
    disabled,
    isPressed: (itemValue: string) =>
      type === "multiple"
        ? Array.isArray(currentValue) && currentValue.includes(itemValue)
        : currentValue === itemValue,
    toggleValue: (itemValue: string) => {
      if (type === "multiple") {
        const currentValues = Array.isArray(currentValue) ? currentValue : [];
        setCurrentValue(
          currentValues.includes(itemValue)
            ? currentValues.filter((value) => value !== itemValue)
            : [...currentValues, itemValue],
        );
        return;
      }

      setCurrentValue(currentValue === itemValue ? "" : itemValue);
    },
  }), [currentValue, disabled, setCurrentValue, type]);

  return (
    <ToggleGroupProvider value={context}>
      <View style={[{ flexDirection: "row", flexWrap: "wrap", gap: 8 }, style]} {...props}>{children}</View>
    </ToggleGroupProvider>
  );
}

export interface ToggleGroupItemProps extends React.ComponentPropsWithoutRef<typeof Toggle> {
  readonly value: string;
}

export const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof Toggle>, ToggleGroupItemProps>(
  ({ disabled: itemDisabled, onPressedChange, pressed, value, ...props }, ref) => {
    const context = useToggleGroupContext();
    const isPressed = pressed ?? context.isPressed(value);
    return (
      <Toggle
        ref={ref}
        {...props}
        disabled={context.disabled || itemDisabled}
        pressed={isPressed}
        onPressedChange={(next) => {
          context.toggleValue(value);
          onPressedChange?.(next);
        }}
      />
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroupItem";
