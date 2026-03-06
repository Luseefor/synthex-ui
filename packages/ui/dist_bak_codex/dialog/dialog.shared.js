import * as React from "react";
const DialogContext = React.createContext(null);
export function useDialogController({ defaultOpen = false, onOpenChange, open, }) {
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
export function DialogProvider({ children, value, }) {
    return React.createElement(DialogContext.Provider, { value }, children);
}
export function useDialogContext() {
    const context = React.useContext(DialogContext);
    if (!context) {
        throw new Error("Dialog components must be used within <Dialog>.");
    }
    return context;
}
