import * as React from "react";
const TooltipContext = React.createContext(null);
export function useTooltipController({ defaultOpen = false, onOpenChange, open, }) {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const currentOpen = open ?? internalOpen;
    return React.useMemo(() => ({
        open: currentOpen,
        setOpen: (nextOpen) => {
            if (open === undefined) {
                setInternalOpen(nextOpen);
            }
            onOpenChange?.(nextOpen);
        },
    }), [currentOpen, onOpenChange, open]);
}
export function TooltipProvider({ children, value, }) {
    return React.createElement(TooltipContext.Provider, { value }, children);
}
export function useTooltipContext() {
    const context = React.useContext(TooltipContext);
    if (!context) {
        throw new Error("Tooltip components must be used within <Tooltip>.");
    }
    return context;
}
