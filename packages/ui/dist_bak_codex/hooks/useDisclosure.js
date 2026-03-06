import { useMemo, useState } from "react";
export function useDisclosure(options = {}) {
    const [isOpen, setIsOpen] = useState(options.defaultOpen ?? false);
    return useMemo(() => ({
        isOpen,
        onClose: () => {
            setIsOpen(false);
            options.onOpenChange?.(false);
        },
        onOpen: () => {
            setIsOpen(true);
            options.onOpenChange?.(true);
        },
        onToggle: () => {
            setIsOpen((currentValue) => {
                const nextValue = !currentValue;
                options.onOpenChange?.(nextValue);
                return nextValue;
            });
        },
        setIsOpen: (nextValue) => {
            setIsOpen(nextValue);
            options.onOpenChange?.(nextValue);
        },
    }), [isOpen, options]);
}
