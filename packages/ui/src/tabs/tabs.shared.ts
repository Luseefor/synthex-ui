import * as React from "react";

interface TabsContextValue {
  readonly value: string;
  readonly setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsSharedProps {
  readonly defaultValue?: string;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
}

export interface TabsTriggerSharedProps {
  readonly value: string;
}

export interface TabsContentSharedProps {
  readonly forceMount?: boolean;
  readonly value: string;
}

export function useTabsController({
  defaultValue,
  onValueChange,
  value,
}: Pick<TabsSharedProps, "defaultValue" | "onValueChange" | "value">) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;

  return React.useMemo<TabsContextValue>(
    () => ({
      value: currentValue,
      setValue: (nextValue) => {
        if (value === undefined) {
          setInternalValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
    }),
    [currentValue, onValueChange, value],
  );
}

export function TabsProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: TabsContextValue }>) {
  return React.createElement(TabsContext.Provider, { value }, children);
}

export function useTabsContext() {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used within <Tabs>.");
  }

  return context;
}
