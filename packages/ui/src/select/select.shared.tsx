import * as React from "react";

interface SelectContextValue {
  readonly labelVersion: number;
  readonly open: boolean;
  readonly placeholder?: string;
  readonly registerItem: (value: string, label: string) => void;
  readonly setOpen: (open: boolean) => void;
  readonly setValue: (value: string) => void;
  readonly value: string;
  readonly getLabel: (value: string) => string | undefined;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

export interface SelectSharedProps {
  readonly defaultOpen?: boolean;
  readonly defaultValue?: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onValueChange?: (value: string) => void;
  readonly open?: boolean;
  readonly placeholder?: string;
  readonly value?: string;
}

export interface SelectItemSharedProps {
  readonly textValue?: string;
  readonly value: string;
}

export function useSelectController({
  defaultOpen = false,
  defaultValue = "",
  onOpenChange,
  onValueChange,
  open,
  placeholder,
  value,
}: SelectSharedProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [labelVersion, setLabelVersion] = React.useState(0);
  const labelsRef = React.useRef<Map<string, string>>(new Map());
  const currentValue = value ?? internalValue;
  const currentOpen = open ?? internalOpen;

  return React.useMemo<SelectContextValue>(
    () => ({
      labelVersion,
      open: currentOpen,
      placeholder,
      registerItem: (itemValue, label) => {
        const previousLabel = labelsRef.current.get(itemValue);

        if (previousLabel === label) {
          return;
        }

        labelsRef.current.set(itemValue, label);
        setLabelVersion((version) => version + 1);
      },
      setOpen: (nextOpen) => {
        if (open === undefined) {
          setInternalOpen(nextOpen);
        }

        onOpenChange?.(nextOpen);
      },
      setValue: (nextValue) => {
        if (value === undefined) {
          setInternalValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
      value: currentValue,
      getLabel: (itemValue) => labelsRef.current.get(itemValue),
    }),
    [currentOpen, currentValue, labelVersion, onOpenChange, onValueChange, open, placeholder, value],
  );
}

export function SelectProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: SelectContextValue }>) {
  return React.createElement(SelectContext.Provider, { value }, children);
}

export function useSelectContext() {
  const context = React.useContext(SelectContext);

  if (!context) {
    throw new Error("Select components must be used within <Select>.");
  }

  return context;
}
