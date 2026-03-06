import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
const CollapsibleContext = React.createContext(null);
export function useCollapsibleController(props) {
    const [open, setOpen] = useControllableState({
        defaultValue: props.defaultOpen ?? false,
        onChange: props.onOpenChange,
        value: props.open,
    });
    return React.useMemo(() => ({
        disabled: props.disabled ?? false,
        open,
        setOpen,
    }), [open, props.disabled, setOpen]);
}
export function CollapsibleProvider({ children, value, }) {
    return _jsx(CollapsibleContext.Provider, { value: value, children: children });
}
export function useCollapsibleContext() {
    const context = React.useContext(CollapsibleContext);
    if (!context) {
        throw new Error("Collapsible components must be used within <Collapsible>.");
    }
    return context;
}
