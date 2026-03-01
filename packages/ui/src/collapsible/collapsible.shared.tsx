import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";

export interface CollapsibleSharedProps {
  readonly defaultOpen?: boolean;
  readonly disabled?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

interface CollapsibleContextValue {
  readonly disabled: boolean;
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

export function useCollapsibleController(props: CollapsibleSharedProps): CollapsibleContextValue {
  const [open, setOpen] = useControllableState({
    defaultValue: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
    value: props.open,
  });

  return React.useMemo(
    () => ({
      disabled: props.disabled ?? false,
      open,
      setOpen,
    }),
    [open, props.disabled, setOpen],
  );
}

export function CollapsibleProvider({
  children,
  value,
}: {
  readonly children: React.ReactNode;
  readonly value: CollapsibleContextValue;
}) {
  return <CollapsibleContext.Provider value={value}>{children}</CollapsibleContext.Provider>;
}

export function useCollapsibleContext(): CollapsibleContextValue {
  const context = React.useContext(CollapsibleContext);

  if (!context) {
    throw new Error("Collapsible components must be used within <Collapsible>.");
  }

  return context;
}
