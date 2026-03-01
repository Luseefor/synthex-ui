import { useMemo, useState } from "react";

export interface UseDisclosureOptions {
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (isOpen: boolean) => void;
}

export function useDisclosure(options: UseDisclosureOptions = {}) {
  const [isOpen, setIsOpen] = useState(options.defaultOpen ?? false);

  return useMemo(
    () => ({
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
      setIsOpen: (nextValue: boolean) => {
        setIsOpen(nextValue);
        options.onOpenChange?.(nextValue);
      },
    }),
    [isOpen, options],
  );
}
