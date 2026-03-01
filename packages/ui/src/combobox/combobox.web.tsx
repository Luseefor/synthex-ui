import * as React from "react";
import { cn } from "../_shared/variants";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "../icons/index.web";
import {
  ComboboxProvider,
  matchesComboboxQuery,
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
  onOpenChange,
  onQueryChange,
  onValueChange,
  open,
  placeholder,
  query,
  value,
  ...props
}: ComboboxProps) {
  const controller = useComboboxController({
    defaultOpen,
    defaultQuery,
    defaultValue,
    onOpenChange,
    onQueryChange,
    onValueChange,
    open,
    placeholder,
    query,
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
      <div ref={rootRef} className={cn("relative w-full", className)} {...props}>
        {children}
      </div>
    </ComboboxProvider>
  );
}

export const ComboboxTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, onClick, type = "button", ...props }, ref) => {
  const context = useComboboxContext();

  return (
    <button
      ref={ref}
      type={type}
      aria-expanded={context.open}
      aria-haspopup="listbox"
      className={cn(
        "inline-flex h-10 w-full items-center justify-between gap-3 rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface-raised)] px-3.5 text-sm text-[color:var(--sx-color-foreground)] shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)]",
        className,
      )}
      onClick={(event) => {
        context.setOpen(!context.open);
        onClick?.(event);
      }}
      {...props}
    >
      <span className="min-w-0 flex-1 text-left">{children}</span>
      <span className={cn("transition-transform duration-150", context.open && "rotate-180")}>
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
>(({ className, ...props }, ref) => {
  const context = useComboboxContext();

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
        className,
      )}
      {...props}
    />
  );
});

ComboboxContent.displayName = "ComboboxContent";

export interface ComboboxInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "value"> {}

export const ComboboxInput = React.forwardRef<HTMLInputElement, ComboboxInputProps>(
  ({ className, onChange, placeholder = "Search options", type = "text", ...props }, ref) => {
    const context = useComboboxContext();

    return (
      <div className="flex items-center gap-3 border-b border-[color:var(--sx-color-border)] px-3.5 py-3">
        <SearchIcon size={15} color="var(--sx-color-foreground-muted)" />
        <input
          ref={ref}
          type={type}
          value={context.query}
          className={cn(
            "w-full bg-transparent text-sm text-[color:var(--sx-color-foreground)] placeholder:text-[color:var(--sx-color-foreground-muted)] focus:outline-none",
            className,
          )}
          onChange={(event) => {
            context.setQuery(event.target.value);
            onChange?.(event);
          }}
          placeholder={placeholder}
          {...props}
        />
      </div>
    );
  },
);

ComboboxInput.displayName = "ComboboxInput";

export interface ComboboxListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ComboboxList = React.forwardRef<HTMLDivElement, ComboboxListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="listbox"
      className={cn("max-h-64 overflow-y-auto p-2", className)}
      {...props}
    />
  ),
);

ComboboxList.displayName = "ComboboxList";

export interface ComboboxEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ComboboxEmpty = React.forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  ({ children = "No results found.", className, ...props }, ref) => {
    const context = useComboboxContext();

    if (context.visibleItemCount > 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "px-3 py-8 text-center text-sm text-[color:var(--sx-color-foreground-muted)]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ComboboxEmpty.displayName = "ComboboxEmpty";

export interface ComboboxItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">,
    ComboboxItemSharedProps {}

export const ComboboxItem = React.forwardRef<HTMLButtonElement, ComboboxItemProps>(
  ({ children, className, keywords, onClick, textValue, value, ...props }, ref) => {
    const context = useComboboxContext();
    const itemId = React.useId();
    const label =
      textValue ??
      (typeof children === "string" || typeof children === "number" ? String(children) : value);
    const visible = matchesComboboxQuery(context.query, label, keywords);
    const active = context.value === value;

    React.useEffect(() => {
      context.registerItem(value, label);
    }, [context, label, value]);

    React.useEffect(() => {
      context.setItemVisibility(itemId, visible);
      return () => context.unregisterItem(itemId);
    }, [context, itemId, visible]);

    if (!visible) {
      return null;
    }

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={active}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] transition-colors duration-150 hover:bg-[color:var(--sx-color-surface-muted)]",
          active && "bg-[color:var(--sx-color-primary-muted)] text-[color:var(--sx-color-primary)]",
          className,
        )}
        onClick={(event) => {
          context.setValue(value);
          context.setQuery("");
          context.setOpen(false);
          onClick?.(event);
        }}
        {...props}
      >
        <span>{children}</span>
        {active ? <CheckIcon size={14} strokeWidth={2.4} /> : null}
      </button>
    );
  },
);

ComboboxItem.displayName = "ComboboxItem";
