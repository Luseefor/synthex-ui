import * as React from "react";

interface DialogContextValue {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly contentId: string;
  readonly triggerId: string;
  readonly titleId: string | null;
  readonly descriptionId: string | null;
  readonly setTitleId: (id: string | null) => void;
  readonly setDescriptionId: (id: string | null) => void;
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
  const [titleId, setTitleId] = React.useState<string | null>(null);
  const [descriptionId, setDescriptionId] = React.useState<string | null>(null);
  const currentOpen = open ?? internalOpen;
  const rawContentId = React.useId();
  const rawTriggerId = React.useId();
  const contentId = React.useMemo(
    () => `sx-dialog-${rawContentId.replace(/:/g, "")}`,
    [rawContentId],
  );
  const triggerId = React.useMemo(
    () => `sx-dialog-trigger-${rawTriggerId.replace(/:/g, "")}`,
    [rawTriggerId],
  );

  return React.useMemo<DialogContextValue>(
    () => ({
      open: currentOpen,
      setOpen: (nextOpen) => {
        if (open === undefined) {
          setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
      },
      contentId,
      triggerId,
      titleId,
      descriptionId,
      setTitleId,
      setDescriptionId,
    }),
    [currentOpen, onOpenChange, open, contentId, triggerId, titleId, descriptionId],
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
