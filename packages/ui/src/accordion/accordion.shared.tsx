import * as React from "react";

type AccordionType = "single" | "multiple";

interface AccordionContextValue {
  readonly isItemOpen: (value: string) => boolean;
  readonly toggleItem: (value: string) => void;
}

interface AccordionItemContextValue {
  readonly value: string;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

export interface AccordionSharedProps {
  readonly collapsible?: boolean;
  readonly defaultValue?: string | readonly string[];
  readonly onValueChange?: (value: string | readonly string[]) => void;
  readonly type?: AccordionType;
  readonly value?: string | readonly string[];
}

export interface AccordionItemSharedProps {
  readonly value: string;
}

export function useAccordionController({
  collapsible = true,
  defaultValue,
  onValueChange,
  type = "single",
  value,
}: AccordionSharedProps) {
  const [internalValue, setInternalValue] = React.useState<string | readonly string[]>(
    defaultValue ?? (type === "multiple" ? [] : ""),
  );
  const currentValue = value ?? internalValue;

  return React.useMemo<AccordionContextValue>(
    () => ({
      isItemOpen: (itemValue) =>
        type === "multiple"
          ? Array.isArray(currentValue) && currentValue.includes(itemValue)
          : currentValue === itemValue,
      toggleItem: (itemValue) => {
        const nextValue =
          type === "multiple"
            ? Array.isArray(currentValue)
              ? currentValue.includes(itemValue)
                ? currentValue.filter((entry) => entry !== itemValue)
                : [...currentValue, itemValue]
              : [itemValue]
            : currentValue === itemValue
              ? collapsible
                ? ""
                : itemValue
              : itemValue;

        if (value === undefined) {
          setInternalValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
    }),
    [collapsible, currentValue, onValueChange, type, value],
  );
}

export function AccordionProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: AccordionContextValue }>) {
  return React.createElement(AccordionContext.Provider, { value }, children);
}

export function AccordionItemProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: AccordionItemContextValue }>) {
  return React.createElement(AccordionItemContext.Provider, { value }, children);
}

export function useAccordionContext() {
  const context = React.useContext(AccordionContext);

  if (!context) {
    throw new Error("Accordion components must be used within <Accordion>.");
  }

  return context;
}

export function useAccordionItemContext() {
  const context = React.useContext(AccordionItemContext);

  if (!context) {
    throw new Error("Accordion item components must be used within <AccordionItem>.");
  }

  return context;
}
