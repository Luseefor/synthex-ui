import * as React from "react";
import { cn } from "../_shared/variants";
import { handleMenuArrowKeys } from "../_shared/a11y.web";
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
>(({ children, className, id, onClick, onKeyDown, type = "button", ...props }, ref) => {
  const context = useSelectContext();

  return (
    <button
      ref={ref}
      type={type}
      id={id ?? context.triggerId}
      aria-expanded={context.open}
      aria-haspopup="listbox"
      aria-controls={context.contentId}
      className={getFieldControlClassName({
        className: cn("inline-flex items-center justify-between gap-3 text-left", className),
      })}
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
>(({ className, id, onKeyDown, ...props }, ref) => {
  const context = useSelectContext();

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={id ?? context.contentId}
      role="listbox"
      aria-labelledby={context.triggerId}
      tabIndex={-1}
      className={cn(
        "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-[calc(var(--sx-radius-lg)+2px)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.14)]",
        className,
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        handleMenuArrowKeys(event);
      }}
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
          "flex w-full items-center justify-between gap-3 rounded-[var(--sx-radius-md)] px-3 py-2.5 text-left text-sm text-[color:var(--sx-color-foreground)] transition-colors duration-[var(--sx-motion-fast)] hover:bg-[color:var(--sx-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--sx-color-surface)]",
          active &&
            "border border-[color:var(--sx-color-primary)]/40 bg-[color:color-mix(in_srgb,var(--sx-color-primary)_14%,var(--sx-color-surface))] text-[color:var(--sx-color-foreground)]",
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

const SelectGroupLabelIdContext = React.createContext<string | null>(null);

export interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ children, className, ...props }, ref) => {
    const rawId = React.useId();
    const generatedId = React.useMemo(
      () => `sx-select-group-${rawId.replace(/:/g, "")}`,
      [rawId],
    );
    const { "aria-labelledby": labelledByProp, ...rest } = props;
    const labelId = labelledByProp ?? generatedId;

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={labelId}
        className={cn(className)}
        {...rest}
      >
        <SelectGroupLabelIdContext.Provider value={labelId}>
          {children}
        </SelectGroupLabelIdContext.Provider>
      </div>
    );
  },
);

SelectGroup.displayName = "SelectGroup";

export const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, id, ...props }, ref) => {
  const contextId = React.useContext(SelectGroupLabelIdContext);
  const rawId = React.useId();
  const generatedId = React.useMemo(
    () => `sx-select-label-${rawId.replace(/:/g, "")}`,
    [rawId],
  );
  const labelId = id ?? contextId ?? generatedId;

  return (
    <div
      ref={ref}
      id={labelId}
      className={cn(
        "px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      {...props}
    />
  );
});

SelectLabel.displayName = "SelectLabel";

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation="horizontal"
    className={cn("-mx-1.5 my-1 h-px bg-[color:var(--sx-color-border)]", className)}
    {...props}
  />
));

SelectSeparator.displayName = "SelectSeparator";

export interface SelectScrollButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly scrollAmount?: number;
}

export const SelectScrollUpButton = React.forwardRef<
  HTMLButtonElement,
  SelectScrollButtonProps
>(({ className, onClick, scrollAmount = 64, ...props }, ref) => {
  const context = useSelectContext();
  const [hasOverflow, setHasOverflow] = React.useState(true);

  React.useEffect(() => {
    const element = document.getElementById(context.contentId);

    if (!element) {
      return;
    }

    const checkOverflow = () => {
      if (element.scrollHeight > 0) {
        setHasOverflow(element.scrollHeight > element.clientHeight);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [context.contentId]);

  if (!hasOverflow) {
    return null;
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Scroll up"
      tabIndex={-1}
      className={cn(
        "flex w-full items-center justify-center py-1 text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      onClick={(event) => {
        document
          .getElementById(context.contentId)
          ?.scrollBy({ top: -scrollAmount });
        onClick?.(event);
      }}
      {...props}
    >
      <span className="rotate-180">
        <ChevronDownIcon size={14} />
      </span>
    </button>
  );
});

SelectScrollUpButton.displayName = "SelectScrollUpButton";

export const SelectScrollDownButton = React.forwardRef<
  HTMLButtonElement,
  SelectScrollButtonProps
>(({ className, onClick, scrollAmount = 64, ...props }, ref) => {
  const context = useSelectContext();
  const [hasOverflow, setHasOverflow] = React.useState(true);

  React.useEffect(() => {
    const element = document.getElementById(context.contentId);

    if (!element) {
      return;
    }

    const checkOverflow = () => {
      if (element.scrollHeight > 0) {
        setHasOverflow(element.scrollHeight > element.clientHeight);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [context.contentId]);

  if (!hasOverflow) {
    return null;
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Scroll down"
      tabIndex={-1}
      className={cn(
        "flex w-full items-center justify-center py-1 text-[color:var(--sx-color-foreground-muted)]",
        className,
      )}
      onClick={(event) => {
        document
          .getElementById(context.contentId)
          ?.scrollBy({ top: scrollAmount });
        onClick?.(event);
      }}
      {...props}
    >
      <ChevronDownIcon size={14} />
    </button>
  );
});

SelectScrollDownButton.displayName = "SelectScrollDownButton";

export const SelectArrow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
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
));

SelectArrow.displayName = "SelectArrow";
