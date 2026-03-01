import * as React from "react";

interface DropdownMenuContextValue {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export interface DropdownMenuSharedProps {
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

export function useDropdownMenuController({
  defaultOpen = false,
  onOpenChange,
  open,
}: DropdownMenuSharedProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const currentOpen = open ?? internalOpen;

  return React.useMemo<DropdownMenuContextValue>(
    () => ({
      open: currentOpen,
      setOpen: (nextOpen) => {
        if (open === undefined) {
          setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
      },
    }),
    [currentOpen, onOpenChange, open],
  );
}

export function DropdownMenuProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: DropdownMenuContextValue }>) {
  return React.createElement(DropdownMenuContext.Provider, { value }, children);
}

export function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error("DropdownMenu components must be used within <DropdownMenu>.");
  }

  return context;
}
