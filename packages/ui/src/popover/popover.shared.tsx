import * as React from "react";

interface PopoverContextValue {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly contentId: string;
  readonly triggerId: string;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

export interface PopoverSharedProps {
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

export function usePopoverController({
  defaultOpen = false,
  onOpenChange,
  open,
}: PopoverSharedProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const currentOpen = open ?? internalOpen;
  const rawContentId = React.useId();
  const rawTriggerId = React.useId();
  const contentId = React.useMemo(() => `sx-popover-${rawContentId.replace(/:/g, "")}`, [rawContentId]);
  const triggerId = React.useMemo(() => `sx-popover-trigger-${rawTriggerId.replace(/:/g, "")}`, [rawTriggerId]);

  return React.useMemo<PopoverContextValue>(
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
    }),
    [currentOpen, onOpenChange, open, contentId, triggerId],
  );
}

export function PopoverProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: PopoverContextValue }>) {
  return React.createElement(PopoverContext.Provider, { value }, children);
}

export function usePopoverContext() {
  const context = React.useContext(PopoverContext);

  if (!context) {
    throw new Error("Popover components must be used within <Popover>.");
  }

  return context;
}
