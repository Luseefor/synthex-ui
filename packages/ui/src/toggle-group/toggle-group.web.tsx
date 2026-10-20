import * as React from "react";
import { cn } from "../_shared/variants";
import { useControllableState } from "../hooks/useControllableState";
import { Toggle } from "../toggle/toggle.web";
import { ToggleGroupProvider, useToggleGroupContext, type ToggleGroupSharedProps } from "./toggle-group.shared";

export interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement>, ToggleGroupSharedProps {
  readonly defaultValue?: string | string[];
}

export function ToggleGroup({
  children,
  className,
  defaultValue,
  disabled = false,
  onValueChange,
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
      <div className={cn("inline-flex flex-wrap items-center gap-2", className)} {...props}>
        {children}
      </div>
    </ToggleGroupProvider>
  );
}

export interface ToggleGroupItemProps extends React.ComponentPropsWithoutRef<typeof Toggle> {
  readonly value: string;
}

export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
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
