import * as React from "react";

interface ContextMenuPosition {
  readonly x: number;
  readonly y: number;
}

interface ContextMenuContextValue {
  readonly open: boolean;
  readonly position: ContextMenuPosition;
  readonly setOpen: (open: boolean) => void;
  readonly setPosition: (position: ContextMenuPosition) => void;
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null);

export interface ContextMenuSharedProps {
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

export function useContextMenuController({
  defaultOpen = false,
  onOpenChange,
  open,
}: ContextMenuSharedProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [position, setPosition] = React.useState<ContextMenuPosition>({ x: 0, y: 0 });
  const currentOpen = open ?? internalOpen;

  return React.useMemo<ContextMenuContextValue>(
    () => ({
      open: currentOpen,
      position,
      setOpen: (nextOpen) => {
        if (open === undefined) {
          setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
      },
      setPosition,
    }),
    [currentOpen, onOpenChange, open, position],
  );
}

export function ContextMenuProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: ContextMenuContextValue }>) {
  return React.createElement(ContextMenuContext.Provider, { value }, children);
}

export function useContextMenuContext() {
  const context = React.useContext(ContextMenuContext);

  if (!context) {
    throw new Error("ContextMenu components must be used within <ContextMenu>.");
  }

  return context;
}
