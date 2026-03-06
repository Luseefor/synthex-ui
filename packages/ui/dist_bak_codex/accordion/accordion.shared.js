import * as React from "react";
const AccordionContext = React.createContext(null);
const AccordionItemContext = React.createContext(null);
export function useAccordionController({ collapsible = true, defaultValue, onValueChange, type = "single", value, }) {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? (type === "multiple" ? [] : ""));
    const currentValue = value ?? internalValue;
    return React.useMemo(() => ({
        isItemOpen: (itemValue) => type === "multiple"
            ? Array.isArray(currentValue) && currentValue.includes(itemValue)
            : currentValue === itemValue,
        toggleItem: (itemValue) => {
            const nextValue = type === "multiple"
                ? Array.isArray(currentValue)
                    ? currentValue.includes(itemValue)
                        ? currentValue.filter((entry) => entry !== itemValue)
                        : [...currentValue, itemValue]
                    : [itemValue]
                : currentValue === itemValue
                    ? collapsible
                        ? ""
                        : itemValue
                    : itemValue;
            if (value === undefined) {
                setInternalValue(nextValue);
            }
            onValueChange?.(nextValue);
        },
    }), [collapsible, currentValue, onValueChange, type, value]);
}
export function AccordionProvider({ children, value, }) {
    return React.createElement(AccordionContext.Provider, { value }, children);
}
export function AccordionItemProvider({ children, value, }) {
    return React.createElement(AccordionItemContext.Provider, { value }, children);
}
export function useAccordionContext() {
    const context = React.useContext(AccordionContext);
    if (!context) {
        throw new Error("Accordion components must be used within <Accordion>.");
    }
    return context;
}
export function useAccordionItemContext() {
    const context = React.useContext(AccordionItemContext);
    if (!context) {
        throw new Error("Accordion item components must be used within <AccordionItem>.");
    }
    return context;
}
