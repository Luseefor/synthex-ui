import * as React from "react";
const PopoverContext = React.createContext(null);
export function usePopoverController({ defaultOpen = false, onOpenChange, open, }) {
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
export function PopoverProvider({ children, value, }) {
    return React.createElement(PopoverContext.Provider, { value }, children);
}
export function usePopoverContext() {
    const context = React.useContext(PopoverContext);
    if (!context) {
        throw new Error("Popover components must be used within <Popover>.");
    }
    return context;
}
