import * as React from "react";

interface DropdownMenuContextValue {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly contentId: string;
  readonly triggerId: string;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export interface DropdownMenuSharedProps {
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

export function useDropdownMenuController({
  defaultOpen = false,
  onOpenChange,
  open,
}: DropdownMenuSharedProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const currentOpen = open ?? internalOpen;
  const rawContentId = React.useId();
  const rawTriggerId = React.useId();
  const contentId = React.useMemo(() => `sx-menu-${rawContentId.replace(/:/g, "")}`, [rawContentId]);
  const triggerId = React.useMemo(() => `sx-menu-trigger-${rawTriggerId.replace(/:/g, "")}`, [rawTriggerId]);

  return React.useMemo<DropdownMenuContextValue>(
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

export function DropdownMenuProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: DropdownMenuContextValue }>) {
  return React.createElement(DropdownMenuContext.Provider, { value }, children);
}

export function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error("DropdownMenu components must be used within <DropdownMenu>.");
  }

  return context;
}

export interface DropdownMenuSubSharedProps {
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
}

interface DropdownMenuSubContextValue {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly contentId: string;
  readonly triggerId: string;
}

const DropdownMenuSubContext = React.createContext<DropdownMenuSubContextValue | null>(null);

export function useDropdownMenuSubController({
  defaultOpen = false,
  onOpenChange,
  open,
}: DropdownMenuSubSharedProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const currentOpen = open ?? internalOpen;
  const rawContentId = React.useId();
  const rawTriggerId = React.useId();
  const contentId = React.useMemo(() => `sx-menu-sub-${rawContentId.replace(/:/g, "")}`, [rawContentId]);
  const triggerId = React.useMemo(
    () => `sx-menu-sub-trigger-${rawTriggerId.replace(/:/g, "")}`,
    [rawTriggerId],
  );

  return React.useMemo<DropdownMenuSubContextValue>(
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

export function DropdownMenuSubProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: DropdownMenuSubContextValue }>) {
  return React.createElement(DropdownMenuSubContext.Provider, { value }, children);
}

export function useDropdownMenuSubContext() {
  const context = React.useContext(DropdownMenuSubContext);

  if (!context) {
    throw new Error("DropdownMenuSubTrigger and DropdownMenuSubContent must be used within <DropdownMenuSub>.");
  }

  return context;
}

export function useOptionalDropdownMenuSubContext() {
  return React.useContext(DropdownMenuSubContext);
}

export interface DropdownMenuCheckboxItemSharedProps {
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
}

export interface DropdownMenuRadioGroupSharedProps {
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly value?: string;
}

export interface DropdownMenuRadioItemSharedProps {
  readonly value: string;
}

interface DropdownMenuRadioGroupContextValue {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
}

const DropdownMenuRadioGroupContext =
  React.createContext<DropdownMenuRadioGroupContextValue | null>(null);

export function useDropdownMenuRadioGroupController({
  defaultValue = "",
  onValueChange,
  value,
}: DropdownMenuRadioGroupSharedProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;

  return React.useMemo<DropdownMenuRadioGroupContextValue>(
    () => ({
      value: currentValue,
      onValueChange: (nextValue) => {
        if (value === undefined) {
          setInternalValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
    }),
    [currentValue, onValueChange, value],
  );
}

export function DropdownMenuRadioGroupProvider({
  children,
  value,
}: React.PropsWithChildren<{ readonly value: DropdownMenuRadioGroupContextValue }>) {
  return React.createElement(DropdownMenuRadioGroupContext.Provider, { value }, children);
}

export function useDropdownMenuRadioGroupContext() {
  const context = React.useContext(DropdownMenuRadioGroupContext);

  if (!context) {
    throw new Error("DropdownMenuRadioItem must be used within <DropdownMenuRadioGroup>.");
  }

  return context;
}

export function useOptionalDropdownMenuRadioGroupContext() {
  return React.useContext(DropdownMenuRadioGroupContext);
}
