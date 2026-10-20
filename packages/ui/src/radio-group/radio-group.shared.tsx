import * as React from "react";

interface RadioGroupContextValue {
  readonly value: string;
  readonly setValue: (value: string) => void;
  readonly disabled: boolean;
  readonly items: readonly { readonly value: string; readonly disabled: boolean }[];
  readonly registerItem: (value: string, disabled: boolean) => void;
  readonly unregisterItem: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupSharedProps {
  readonly defaultValue?: string;
  readonly disabled?: boolean;
  readonly onValueChange?: (value: string) => void;
  readonly value?: string;
}

export interface RadioGroupItemSharedProps {
  readonly value: string;
  readonly disabled?: boolean;
}

export function useRadioGroupController({
  defaultValue,
  disabled = false,
  onValueChange,
  value,
}: Pick<RadioGroupSharedProps, "defaultValue" | "disabled" | "onValueChange" | "value">) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;
  const [items, setItems] = React.useState<{ readonly value: string; readonly disabled: boolean }[]>(
    [],
  );

  const registerItem = React.useCallback((itemValue: string, itemDisabled: boolean) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.value === itemValue);
      if (existing && existing.disabled === itemDisabled) {
        return prev;
      }
      if (existing) {
        return prev.map((entry) =>
          entry.value === itemValue ? { value: itemValue, disabled: itemDisabled } : entry,
        );
      }
      return [...prev, { value: itemValue, disabled: itemDisabled }];
    });
  }, []);

  const unregisterItem = React.useCallback((itemValue: string) => {
    setItems((prev) => prev.filter((entry) => entry.value !== itemValue));
  }, []);

  return React.useMemo<RadioGroupContextValue>(
    () => ({
      value: currentValue,
      setValue: (nextValue) => {
        if (value === undefined) {
          setInternalValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
      disabled,
      items,
      registerItem,
      unregisterItem,
    }),
    [currentValue, disabled, items, onValueChange, registerItem, unregisterItem, value],
  );
}

export function RadioGroupProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: RadioGroupContextValue }>) {
  return React.createElement(RadioGroupContext.Provider, { value }, children);
}

export function useRadioGroupContext() {
  const context = React.useContext(RadioGroupContext);

  if (!context) {
    throw new Error("RadioGroup components must be used within <RadioGroup>.");
  }

  return context;
}
