import * as React from "react";
const SelectContext = React.createContext(null);
export function useSelectController({ defaultOpen = false, defaultValue = "", onOpenChange, onValueChange, open, placeholder, value, }) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const [labelVersion, setLabelVersion] = React.useState(0);
    const labelsRef = React.useRef(new Map());
    const currentValue = value ?? internalValue;
    const currentOpen = open ?? internalOpen;
    return React.useMemo(() => ({
        labelVersion,
        open: currentOpen,
        placeholder,
        registerItem: (itemValue, label) => {
            const previousLabel = labelsRef.current.get(itemValue);
            if (previousLabel === label) {
                return;
            }
            labelsRef.current.set(itemValue, label);
            setLabelVersion((version) => version + 1);
        },
        setOpen: (nextOpen) => {
            if (open === undefined) {
                setInternalOpen(nextOpen);
            }
            onOpenChange?.(nextOpen);
        },
        setValue: (nextValue) => {
            if (value === undefined) {
                setInternalValue(nextValue);
            }
            onValueChange?.(nextValue);
        },
        value: currentValue,
        getLabel: (itemValue) => labelsRef.current.get(itemValue),
    }), [currentOpen, currentValue, labelVersion, onOpenChange, onValueChange, open, placeholder, value]);
}
export function SelectProvider({ children, value, }) {
    return React.createElement(SelectContext.Provider, { value }, children);
}
export function useSelectContext() {
    const context = React.useContext(SelectContext);
    if (!context) {
        throw new Error("Select components must be used within <Select>.");
    }
    return context;
}
