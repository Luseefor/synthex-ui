import * as React from "react";

interface NavigationMenuContextValue {
  readonly value: string;
  readonly setValue: (value: string) => void;
}

interface NavigationMenuItemContextValue {
  readonly value: string;
}

const NavigationMenuContext = React.createContext<NavigationMenuContextValue | null>(null);
const NavigationMenuItemContext = React.createContext<NavigationMenuItemContextValue | null>(null);

export interface NavigationMenuSharedProps {
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly value?: string;
}

export interface NavigationMenuItemSharedProps {
  readonly value: string;
}

export function useNavigationMenuController({
  defaultValue = "",
  onValueChange,
  value,
}: NavigationMenuSharedProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;

  return React.useMemo<NavigationMenuContextValue>(
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

export function NavigationMenuProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: NavigationMenuContextValue }>) {
  return React.createElement(NavigationMenuContext.Provider, { value }, children);
}

export function NavigationMenuItemProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: NavigationMenuItemContextValue }>) {
  return React.createElement(NavigationMenuItemContext.Provider, { value }, children);
}

export function useNavigationMenuContext() {
  const context = React.useContext(NavigationMenuContext);

  if (!context) {
    throw new Error("NavigationMenu components must be used within <NavigationMenu>.");
  }

  return context;
}

export function useNavigationMenuItemContext() {
  const context = React.useContext(NavigationMenuItemContext);

  if (!context) {
    throw new Error("NavigationMenuItem components must be used within <NavigationMenuItem>.");
  }

  return context;
}
