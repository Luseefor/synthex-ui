import { useMemo, useState } from "react";
export function useControllableState({ defaultValue, onChange, value, }) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = value ?? internalValue;
    return useMemo(() => [
        currentValue,
        (nextValue) => {
            if (value === undefined) {
                setInternalValue(nextValue);
            }
            onChange?.(nextValue);
        },
    ], [currentValue, onChange, value]);
}
