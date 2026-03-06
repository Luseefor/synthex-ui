import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { View } from "react-native";
import { useControllableState } from "../hooks/useControllableState";
import { Toggle } from "../toggle/toggle.native";
import { ToggleGroupProvider, useToggleGroupContext } from "./toggle-group.shared";
export function ToggleGroup({ children, defaultValue, disabled = false, onValueChange, style, type = "single", value, ...props }) {
    const [currentValue, setCurrentValue] = useControllableState({
        defaultValue: defaultValue ?? (type === "multiple" ? [] : ""),
        onChange: onValueChange,
        value,
    });
    const context = React.useMemo(() => ({
        disabled,
        isPressed: (itemValue) => type === "multiple"
            ? Array.isArray(currentValue) && currentValue.includes(itemValue)
            : currentValue === itemValue,
        toggleValue: (itemValue) => {
            if (type === "multiple") {
                const currentValues = Array.isArray(currentValue) ? currentValue : [];
                setCurrentValue(currentValues.includes(itemValue)
                    ? currentValues.filter((value) => value !== itemValue)
                    : [...currentValues, itemValue]);
                return;
            }
            setCurrentValue(currentValue === itemValue ? "" : itemValue);
        },
    }), [currentValue, disabled, setCurrentValue, type]);
    return (_jsx(ToggleGroupProvider, { value: context, children: _jsx(View, { style: [{ flexDirection: "row", flexWrap: "wrap", gap: 8 }, style], ...props, children: children }) }));
}
export const ToggleGroupItem = React.forwardRef(({ onPressedChange, pressed: _pressed, value, ...props }, ref) => {
    const context = useToggleGroupContext();
    return (_jsx(Toggle, { ref: ref, pressed: context.isPressed(value), onPressedChange: () => {
            context.toggleValue(value);
            onPressedChange?.(context.isPressed(value));
        }, disabled: context.disabled || props.disabled, ...props }));
});
ToggleGroupItem.displayName = "ToggleGroupItem";
