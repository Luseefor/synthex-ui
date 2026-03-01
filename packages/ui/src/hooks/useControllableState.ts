import { useMemo, useState } from "react";

export interface UseControllableStateOptions<TValue> {
  readonly defaultValue: TValue;
  readonly onChange?: (value: TValue) => void;
  readonly value?: TValue;
}

export function useControllableState<TValue>({
  defaultValue,
  onChange,
  value,
}: UseControllableStateOptions<TValue>) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  return useMemo(
    () =>
      [
        currentValue,
        (nextValue: TValue) => {
          if (value === undefined) {
            setInternalValue(nextValue);
          }

          onChange?.(nextValue);
        },
      ] as const,
    [currentValue, onChange, value],
  );
}
