import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "../_shared/variants";
import { handleMenuArrowKeys } from "../_shared/a11y.web";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "../icons/index.web";
import {
  ComboboxProvider,
  useComboboxContext,
  useComboboxController,
  type ComboboxItemSharedProps,
  type ComboboxSharedProps,
} from "./combobox.shared";

export interface ComboboxProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "defaultValue" | "onChange" | "value"
    >,
    ComboboxSharedProps {}

export function Combobox({
  children,
  className,
  defaultOpen,
  defaultQuery,
  defaultValue,
  filter,
  label = "Combobox",
  loop,
  onOpenChange,
  onQueryChange,
  onValueChange,
  open,
  placeholder,
  query,
  shouldFilter = true,
  value,
  ...props
}: ComboboxProps) {
  const controller = useComboboxController({
    defaultOpen,
    defaultQuery,
    defaultValue,
    filter,
    label,
    loop,
    onOpenChange,
    onQueryChange,
    onValueChange,
    open,
    placeholder,
    query,
    shouldFilter,
    value,
  });
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!controller.open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        controller.setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        controller.setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [controller]);

  return (
    <ComboboxProvider value={controller}>
      <div ref={rootRef} data-slot="combobox" className={cn("relative w-full", className)} {...props}>
        {children}
      </div>
    </ComboboxProvider>
  );
}

export const ComboboxTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, id, onClick, onKeyDown, type = "button", ...props }, ref) => {
  const context = useComboboxContext();

  return (
    <button
      ref={ref}
      type={type}
      data-slot="combobox-trigger"
      id={id ?? context.triggerId}
      aria-expanded={context.open}
      aria-haspopup="listbox"
      aria-controls={context.contentId}
      className={cn(
        "inline-flex h-10 w-full items-center justify-between gap-3 rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] px-3.5 text-sm text-[color:var(--sx-color-foreground)] shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] duration-[var(--sx-motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-background)]",
        className,
      )}
      onClick={(event) => {
        context.setOpen(!context.open);
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          context.setOpen(true);
        }
      }}
      {...props}
    >
      <span className="min-w-0 flex-1 text-left">{children}</span>
      <span className={cn("transition-transform duration-[var(--sx-motion-fast)]", context.open && "rotate-180")}>
        <ChevronDownIcon size={16} />
      </span>
    </button>
  );
});

ComboboxTrigger.displayName = "ComboboxTrigger";

export const ComboboxValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  const context = useComboboxContext();
  const selectedLabel = context.getLabel(context.value);
  void context.labelVersion;

  return (
    <span
      ref={ref}
      data-slot="combobox-value"
      className={cn(
        "block truncate text-[color:var(--sx-color-foreground)]",
        !selectedLabel && !children && "text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    >
      {children ?? selectedLabel ?? context.placeholder ?? "Select an option"}
    </span>
  );
});

ComboboxValue.displayName = "ComboboxValue";

export const ComboboxContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, id, onKeyDown, style, ...rest }, ref) => {
  const context = useComboboxContext();
  const open = context.open;

  // Keep the content mounted while closed so `ComboboxItem` registration
  // effects still run and `ComboboxValue` can resolve the label for a
  // default or controlled value before the first open. Caller props spread
  // first so the computed hiding below always wins: `hidden` plus an
  // inline `display: none` removes the subtree from layout, the
  // accessibility tree, and tab order while closed, even if a caller
  // passes `hidden={false}`, a display class, or a display style.
  return (
    <div
      {...rest}
      ref={ref}
      id={id ?? context.contentId}
      data-slot="combobox-content"
      role="dialog"
      aria-labelledby={context.triggerId}
      hidden={!open}
      aria-hidden={!open ? true : undefined}
      inert={!open}
      className={cn(
        "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-[0_18px_42px_rgba(15,23,42,0.14)] overflow-hidden",
        !open && "hidden",
        className,
      )}
      style={{ ...style, display: open ? style?.display : "none" }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        handleMenuArrowKeys(event);
      }}
    >
      <CommandPrimitive
        data-slot="combobox-command"
        label={context.label ?? "Combobox"}
        shouldFilter={context.shouldFilter}
        filter={context.filter as React.ComponentPropsWithoutRef<typeof CommandPrimitive>["filter"]}
        loop={context.loop}
      >
        {children}
      </CommandPrimitive>
    </div>
  );
});

ComboboxContent.displayName = "ComboboxContent";

type ComboboxInputRootProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>;

export interface ComboboxInputProps extends Omit<ComboboxInputRootProps, "value" | "onValueChange"> {
  readonly value?: string;
  readonly onValueChange?: (search: string) => void;
}

export const ComboboxInput = React.forwardRef<HTMLInputElement, ComboboxInputProps>(
  ({ className, onValueChange, placeholder = "Search options", value, ...props }, ref) => {
    const context = useComboboxContext();
    const currentValue = value ?? context.query;

    return (
      <div
        data-slot="combobox-input-wrapper"
        className="flex items-center gap-3 border-b border-[color:var(--sx-color-border)] px-3.5 py-3"
      >
        <SearchIcon size={15} color="var(--sx-color-foreground-muted)" />
        <CommandPrimitive.Input
          ref={ref as React.Ref<HTMLInputElement>}
          data-slot="combobox-input"
          value={currentValue}
          onValueChange={(next: string) => {
            context.setQuery(next);
            onValueChange?.(next);
          }}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent text-sm text-[color:var(--sx-color-foreground)] placeholder:text-[color:var(--sx-color-foreground-muted)] focus:outline-none",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

ComboboxInput.displayName = "ComboboxInput";

export interface ComboboxListProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> {}

export const ComboboxList = React.forwardRef<HTMLDivElement, ComboboxListProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.List
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="combobox-list"
      className={cn("max-h-64 overflow-y-auto p-2", className)}
      {...props}
    />
  ),
);

ComboboxList.displayName = "ComboboxList";

export interface ComboboxEmptyProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> {}

export const ComboboxEmpty = React.forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  ({ children = "No results found.", className, ...props }, ref) => (
    <CommandPrimitive.Empty
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="combobox-empty"
      className={cn(
        "px-3 py-8 text-center text-sm text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    >
      {children}
    </CommandPrimitive.Empty>
  ),
);

ComboboxEmpty.displayName = "ComboboxEmpty";

type ComboboxItemRootProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>;

export interface ComboboxItemProps
  extends Omit<ComboboxItemRootProps, "value" | "keywords">,
    ComboboxItemSharedProps {
  readonly onSelect?: (value: string) => void;
}

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  ({ children, className, keywords, onSelect, textValue, value, ...props }, ref) => {
    const context = useComboboxContext();
    const label =
      textValue ??
      (typeof children === "string" || typeof children === "number" ? String(children) : value);
    const searchValue = label ?? value;
    const active = context.value === value;

    // `registerItem` keeps the value->label map for `ComboboxValue` parity
    // with native; labels are derived from `textValue`/children.
    React.useEffect(() => {
      context.registerItem(value, label ?? value);
    }, [context, label, value]);

    return (
      <CommandPrimitive.Item
        ref={ref as React.Ref<HTMLDivElement>}
        data-slot="combobox-item"
        value={searchValue}
        keywords={keywords as string[] | undefined}
        onSelect={() => {
          context.setValue(value);
          context.setQuery("");
          context.setOpen(false);
          onSelect?.(value);
        }}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] transition-colors duration-[var(--sx-motion-fast)] aria-selected:bg-[color:var(--sx-color-surface-muted)]",
          active &&
            "border border-[color:var(--sx-color-primary)]/40 bg-[color:color-mix(in_srgb,var(--sx-color-primary)_14%,var(--sx-color-surface))] text-[color:var(--sx-color-foreground)]",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        {active ? <CheckIcon size={14} strokeWidth={2.4} /> : null}
      </CommandPrimitive.Item>
    );
  },
);

ComboboxItem.displayName = "ComboboxItem";
