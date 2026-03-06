import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
const ToggleGroupContext = React.createContext(null);
export function useToggleGroupContext() {
    const context = React.useContext(ToggleGroupContext);
    if (!context) {
        throw new Error("ToggleGroupItem must be used within ToggleGroup.");
    }
    return context;
}
export function ToggleGroupProvider({ children, value, }) {
    return _jsx(ToggleGroupContext.Provider, { value: value, children: children });
}
