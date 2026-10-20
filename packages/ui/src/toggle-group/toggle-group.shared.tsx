import * as React from "react";
import type { ToggleVariantProps } from "../toggle/toggle.shared";

export interface ToggleGroupSharedProps {
  readonly disabled?: boolean;
  readonly onValueChange?: (value: string | string[]) => void;
  readonly type?: "single" | "multiple";
  readonly value?: string | string[];
}

interface ToggleGroupContextValue {
  readonly disabled: boolean;
  readonly isPressed: (value: string) => boolean;
  readonly size?: ToggleVariantProps["size"];
  readonly toggleValue: (value: string) => void;
  readonly variant?: ToggleVariantProps["variant"];
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

export function useToggleGroupContext() {
  const context = React.useContext(ToggleGroupContext);
  if (!context) {
    throw new Error("ToggleGroupItem must be used within ToggleGroup.");
  }
  return context;
}

export function ToggleGroupProvider({
  children,
  value,
}: {
  readonly children: React.ReactNode;
  readonly value: ToggleGroupContextValue;
}) {
  return <ToggleGroupContext.Provider value={value}>{children}</ToggleGroupContext.Provider>;
}
