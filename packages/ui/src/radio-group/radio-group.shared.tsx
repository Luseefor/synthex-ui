import * as React from "react";

interface RadioGroupContextValue {
  readonly value: string;
  readonly setValue: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupSharedProps {
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly value?: string;
}

export interface RadioGroupItemSharedProps {
  readonly value: string;
}

export function useRadioGroupController({
  defaultValue,
  onValueChange,
  value,
}: Pick<RadioGroupSharedProps, "defaultValue" | "onValueChange" | "value">) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;

  return React.useMemo<RadioGroupContextValue>(
    () => ({
      value: currentValue,
      setValue: (nextValue) => {
        if (value === undefined) {
          setInternalValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
    }),
    [currentValue, onValueChange, value],
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
