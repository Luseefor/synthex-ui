import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "../_shared/variants";
import { getFieldControlClassName } from "../_shared/field-control.web";
import { CheckIcon, ChevronDownIcon } from "../icons/index.web";
import type {
  SelectSharedProps,
} from "./select.shared";

const SelectPlaceholderContext = React.createContext<string | undefined>(undefined);

export interface SelectProps extends SelectSharedProps {
  readonly children: React.ReactNode;
  readonly dir?: "ltr" | "rtl";
  readonly disabled?: boolean;
  readonly name?: string;
  readonly required?: boolean;
}

export function Select({
  children,
  defaultOpen,
  defaultValue,
  dir,
  disabled,
  name,
  onOpenChange,
  onValueChange,
  open,
  placeholder,
  required,
  value,
}: SelectProps) {
  return (
    <SelectPlaceholderContext.Provider value={placeholder}>
      <SelectPrimitive.Root
        data-slot="select"
        defaultOpen={defaultOpen}
        defaultValue={defaultValue}
        dir={dir}
        disabled={disabled}
        name={name}
        onOpenChange={onOpenChange}
        onValueChange={onValueChange}
        open={open}
        required={required}
        value={value}
      >
        {children}
      </SelectPrimitive.Root>
    </SelectPlaceholderContext.Provider>
  );
}

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  readonly asChild?: boolean;
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      className={getFieldControlClassName({
        className: cn("inline-flex items-center justify-between gap-3 text-left", className),
      })}
      {...props}
    >
      <span className="min-w-0 flex-1 text-left">{children}</span>
      <SelectPrimitive.Icon asChild>
        <span className="transition-transform duration-[var(--sx-motion-fast)] data-[state=open]:rotate-180">
          <ChevronDownIcon size={16} />
        </span>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  ),
);

SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> {}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder: valuePlaceholder, ...props }, ref) => {
    const contextPlaceholder = React.useContext(SelectPlaceholderContext);
    return (
      <SelectPrimitive.Value
        ref={ref}
        data-slot="select-value"
        placeholder={valuePlaceholder ?? contextPlaceholder ?? "Select an option"}
        className={cn(
          "block truncate text-[color:var(--sx-color-foreground)] data-[placeholder]:text-[color:var(--sx-color-foreground-muted)]",
        )}
        {...props}
      />
    );
  },
);

SelectValue.displayName = "SelectValue";

export interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className, position = "popper", sideOffset = 8, ...props }, ref) => (
    <SelectPrimitive.Portal data-slot="select-portal">
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-[0_18px_42px_rgba(15,23,42,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport
          data-slot="select-viewport"
          className="p-1.5"
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);

SelectContent.displayName = "SelectContent";

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-sm text-[color:var(--sx-color-foreground)] outline-none transition-colors duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--sx-color-surface)] data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[state=checked]:border data-[state=checked]:border-[color:var(--sx-color-primary)]/40 data-[state=checked]:bg-[color:color-mix(in_srgb,var(--sx-color-primary)_14%,var(--sx-color-surface))]",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText asChild>
        <span>{children}</span>
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator asChild>
        <span className="flex shrink-0 items-center justify-center">
          <CheckIcon size={14} strokeWidth={2.4} />
        </span>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  ),
);

SelectItem.displayName = "SelectItem";

const SelectGroupLabelIdContext = React.createContext<string | null>(null);

export interface SelectGroupProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group> {}

export const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ children, ...props }, ref) => {
    const rawId = React.useId();
    const generatedId = React.useMemo(
      () => `sx-select-group-${rawId.replace(/:/g, "")}`,
      [rawId],
    );
    const { "aria-labelledby": labelledByProp, ...rest } = props;
    const labelId = labelledByProp ?? generatedId;

    return (
      <SelectPrimitive.Group
        ref={ref}
        data-slot="select-group"
        aria-labelledby={labelId}
        {...rest}
      >
        <SelectGroupLabelIdContext.Provider value={labelId}>
          {children}
        </SelectGroupLabelIdContext.Provider>
      </SelectPrimitive.Group>
    );
  },
);

SelectGroup.displayName = "SelectGroup";

export interface SelectLabelProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {}

export const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, ...props }, ref) => {
    const contextId = React.useContext(SelectGroupLabelIdContext);
    const rawId = React.useId();
    const generatedId = React.useMemo(
      () => `sx-select-label-${rawId.replace(/:/g, "")}`,
      [rawId],
    );
    return (
      <SelectPrimitive.Label
        ref={ref}
        data-slot="select-label"
        id={props.id ?? contextId ?? generatedId}
        className={cn(
          "px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground-muted)]",
          className,
        )}
        {...props}
      />
    );
  },
);

SelectLabel.displayName = "SelectLabel";

export interface SelectSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {}

export const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
      ref={ref}
      data-slot="select-separator"
      className={cn("-mx-1.5 my-1 h-px bg-[color:var(--sx-color-border)]", className)}
      {...props}
    />
  ),
);

SelectSeparator.displayName = "SelectSeparator";

export interface SelectScrollButtonProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> {
  readonly scrollAmount?: number;
}

export const SelectScrollUpButton = React.forwardRef<
  HTMLDivElement,
  SelectScrollButtonProps
>(({ className, scrollAmount: _scrollAmount, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="select-scroll-up-button"
    className={cn(
      "flex w-full cursor-default items-center justify-center py-1 text-[color:var(--sx-color-foreground-muted)]",
      className,
    )}
    {...props}
  >
    <span className="rotate-180">
      <ChevronDownIcon size={14} />
    </span>
  </SelectPrimitive.ScrollUpButton>
));

SelectScrollUpButton.displayName = "SelectScrollUpButton";

export const SelectScrollDownButton = React.forwardRef<
  HTMLDivElement,
  SelectScrollButtonProps
>(({ className, scrollAmount: _scrollAmount, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    data-slot="select-scroll-down-button"
    className={cn(
      "flex w-full cursor-default items-center justify-center py-1 text-[color:var(--sx-color-foreground-muted)]",
      className,
    )}
    {...props}
  >
    <ChevronDownIcon size={14} />
  </SelectPrimitive.ScrollDownButton>
));

SelectScrollDownButton.displayName = "SelectScrollDownButton";

export interface SelectArrowProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectArrow = React.forwardRef<HTMLDivElement, SelectArrowProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      data-slot="select-arrow"
      className={cn(
        "mx-auto h-2 w-2 rotate-45 border-b border-r border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)]",
        className,
      )}
      {...props}
    />
  ),
);

SelectArrow.displayName = "SelectArrow";
