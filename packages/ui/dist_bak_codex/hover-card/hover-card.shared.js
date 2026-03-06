import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
const HoverCardContext = React.createContext(null);
export function useHoverCardController(props) {
    const [open, setOpen] = useControllableState({
        defaultValue: props.defaultOpen ?? false,
        onChange: props.onOpenChange,
        value: props.open,
    });
    return React.useMemo(() => ({
        closeDelay: props.closeDelay ?? 120,
        open,
        openDelay: props.openDelay ?? 100,
        setOpen,
    }), [open, props.closeDelay, props.openDelay, setOpen]);
}
export function HoverCardProvider({ children, value }) {
    return _jsx(HoverCardContext.Provider, { value: value, children: children });
}
export function useHoverCardContext() {
    const context = React.useContext(HoverCardContext);
    if (!context) {
        throw new Error("HoverCard components must be used within <HoverCard>.");
    }
    return context;
}
