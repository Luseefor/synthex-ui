import * as React from "react";
const DropdownMenuContext = React.createContext(null);
export function useDropdownMenuController({ defaultOpen = false, onOpenChange, open, }) {
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
export function DropdownMenuProvider({ children, value, }) {
    return React.createElement(DropdownMenuContext.Provider, { value }, children);
}
export function useDropdownMenuContext() {
    const context = React.useContext(DropdownMenuContext);
    if (!context) {
        throw new Error("DropdownMenu components must be used within <DropdownMenu>.");
    }
    return context;
}
