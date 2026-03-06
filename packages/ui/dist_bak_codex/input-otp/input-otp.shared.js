import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
const InputOTPContext = React.createContext(null);
export function useInputOTPController(props) {
    const length = props.length ?? 6;
    const [value, setValue] = useControllableState({
        defaultValue: props.defaultValue ?? "",
        onChange: props.onValueChange,
        value: props.value,
    });
    return React.useMemo(() => ({
        length,
        setValueAt(index, next) {
            const chars = Array.from({ length }, (_, currentIndex) => value[currentIndex] ?? "");
            chars[index] = next.slice(-1);
            setValue(chars.join(""));
        },
        value,
    }), [length, setValue, value]);
}
export function InputOTPProvider({ children, value }) {
    return _jsx(InputOTPContext.Provider, { value: value, children: children });
}
export function useInputOTPContext() {
    const context = React.useContext(InputOTPContext);
    if (!context) {
        throw new Error("InputOTP components must be used within <InputOTP>.");
    }
    return context;
}
