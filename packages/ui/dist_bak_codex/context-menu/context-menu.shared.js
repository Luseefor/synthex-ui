import * as React from "react";
const ContextMenuContext = React.createContext(null);
export function useContextMenuController({ defaultOpen = false, onOpenChange, open, }) {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const currentOpen = open ?? internalOpen;
    return React.useMemo(() => ({
        open: currentOpen,
        position,
        setOpen: (nextOpen) => {
            if (open === undefined) {
                setInternalOpen(nextOpen);
            }
            onOpenChange?.(nextOpen);
        },
        setPosition,
    }), [currentOpen, onOpenChange, open, position]);
}
export function ContextMenuProvider({ children, value, }) {
    return React.createElement(ContextMenuContext.Provider, { value }, children);
}
export function useContextMenuContext() {
    const context = React.useContext(ContextMenuContext);
    if (!context) {
        throw new Error("ContextMenu components must be used within <ContextMenu>.");
    }
    return context;
}
