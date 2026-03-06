import * as React from "react";
const TabsContext = React.createContext(null);
export function useTabsController({ defaultValue, onValueChange, value, }) {
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
export function TabsProvider({ children, value, }) {
    return React.createElement(TabsContext.Provider, { value }, children);
}
export function useTabsContext() {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error("Tabs components must be used within <Tabs>.");
    }
    return context;
}
