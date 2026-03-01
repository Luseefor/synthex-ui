import * as React from "react";
import { cn } from "../_shared/variants";
import { getFieldControlClassName } from "../_shared/field-control.web";
import { CheckIcon, ChevronDownIcon } from "../icons/index.web";
import {
  SelectProvider,
  useSelectContext,
  useSelectController,
  type SelectItemSharedProps,
  type SelectSharedProps,
} from "./select.shared";

export interface SelectProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "defaultValue" | "onChange" | "value"
    >,
    SelectSharedProps {}

export function Select({
  children,
  className,
  defaultOpen,
  defaultValue,
  onOpenChange,
  onValueChange,
  open,
  placeholder,
  value,
  ...props
}: SelectProps) {
  const controller = useSelectController({
    defaultOpen,
    defaultValue,
    onOpenChange,
    onValueChange,
    open,
    placeholder,
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
    <SelectProvider value={controller}>
      <div ref={rootRef} className={cn("relative w-full", className)} {...props}>
        {children}
      </div>
    </SelectProvider>
  );
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, onClick, type = "button", ...props }, ref) => {
  const context = useSelectContext();

  return (
    <button
      ref={ref}
      type={type}
      aria-expanded={context.open}
      className={getFieldControlClassName({
        className: cn("inline-flex items-center justify-between gap-3 text-left", className),
      })}
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

SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  const context = useSelectContext();
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

SelectValue.displayName = "SelectValue";

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = useSelectContext();

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
        className,
      )}
      {...props}
    />
  );
});

SelectContent.displayName = "SelectContent";

export interface SelectItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">,
    SelectItemSharedProps {}

export const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ children, className, onClick, textValue, value, ...props }, ref) => {
    const context = useSelectContext();
    const label =
      textValue ??
      (typeof children === "string" || typeof children === "number" ? String(children) : value);

    React.useEffect(() => {
      context.registerItem(value, label);
    }, [context, label, value]);

    const active = context.value === value;

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={active}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] transition-colors duration-150 hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--sx-color-surface)]",
          active && "bg-[color:var(--sx-color-primary-muted)] text-[color:var(--sx-color-primary)]",
          className,
        )}
        onClick={(event) => {
          context.setValue(value);
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

SelectItem.displayName = "SelectItem";
