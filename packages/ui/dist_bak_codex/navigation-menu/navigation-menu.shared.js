import * as React from "react";
const NavigationMenuContext = React.createContext(null);
const NavigationMenuItemContext = React.createContext(null);
export function useNavigationMenuController({ defaultValue = "", onValueChange, value, }) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
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
export function NavigationMenuProvider({ children, value, }) {
    return React.createElement(NavigationMenuContext.Provider, { value }, children);
}
export function NavigationMenuItemProvider({ children, value, }) {
    return React.createElement(NavigationMenuItemContext.Provider, { value }, children);
}
export function useNavigationMenuContext() {
    const context = React.useContext(NavigationMenuContext);
    if (!context) {
        throw new Error("NavigationMenu components must be used within <NavigationMenu>.");
    }
    return context;
}
export function useNavigationMenuItemContext() {
    const context = React.useContext(NavigationMenuItemContext);
    if (!context) {
        throw new Error("NavigationMenuItem components must be used within <NavigationMenuItem>.");
    }
    return context;
}
