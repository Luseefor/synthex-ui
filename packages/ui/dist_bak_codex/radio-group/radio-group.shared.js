import * as React from "react";
const RadioGroupContext = React.createContext(null);
export function useRadioGroupController({ defaultValue, onValueChange, value, }) {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
    const currentValue = value ?? internalValue;
    return React.useMemo(() => ({
        value: currentValue,
        setValue: (nextValue) => {
            if (value === undefined) {
                setInternalValue(nextValue);
            }
            onValueChange?.(nextValue);
        },
    }), [currentValue, onValueChange, value]);
}
export function RadioGroupProvider({ children, value, }) {
    return React.createElement(RadioGroupContext.Provider, { value }, children);
}
export function useRadioGroupContext() {
    const context = React.useContext(RadioGroupContext);
    if (!context) {
        throw new Error("RadioGroup components must be used within <RadioGroup>.");
    }
    return context;
}
