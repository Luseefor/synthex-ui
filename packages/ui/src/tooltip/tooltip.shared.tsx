import * as React from "react";

interface TooltipContextValue {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

export interface TooltipSharedProps {
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

export function useTooltipController({
  defaultOpen = false,
  onOpenChange,
  open,
}: TooltipSharedProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const currentOpen = open ?? internalOpen;

  return React.useMemo<TooltipContextValue>(
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

export function TooltipProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: TooltipContextValue }>) {
  return React.createElement(TooltipContext.Provider, { value }, children);
}

export function useTooltipContext() {
  const context = React.useContext(TooltipContext);

  if (!context) {
    throw new Error("Tooltip components must be used within <Tooltip>.");
  }

  return context;
}
