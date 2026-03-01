import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";

export interface HoverCardSharedProps {
  readonly closeDelay?: number;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
  readonly openDelay?: number;
}

interface HoverCardContextValue {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly closeDelay: number;
  readonly openDelay: number;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

export function useHoverCardController(props: HoverCardSharedProps): HoverCardContextValue {
  const [open, setOpen] = useControllableState({
    defaultValue: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
    value: props.open,
  });

  return React.useMemo(
    () => ({
      closeDelay: props.closeDelay ?? 120,
      open,
      openDelay: props.openDelay ?? 100,
      setOpen,
    }),
    [open, props.closeDelay, props.openDelay, setOpen],
  );
}

export function HoverCardProvider({ children, value }: { readonly children: React.ReactNode; readonly value: HoverCardContextValue }) {
  return <HoverCardContext.Provider value={value}>{children}</HoverCardContext.Provider>;
}

export function useHoverCardContext(): HoverCardContextValue {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error("HoverCard components must be used within <HoverCard>.");
  }
  return context;
}
