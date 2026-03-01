import * as React from "react";

interface DialogContextValue {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

export interface DialogSharedProps {
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

export function useDialogController({
  defaultOpen = false,
  onOpenChange,
  open,
}: DialogSharedProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const currentOpen = open ?? internalOpen;

  return React.useMemo<DialogContextValue>(
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

export function DialogProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: DialogContextValue }>) {
  return React.createElement(DialogContext.Provider, { value }, children);
}

export function useDialogContext() {
  const context = React.useContext(DialogContext);

  if (!context) {
    throw new Error("Dialog components must be used within <Dialog>.");
  }

  return context;
}
