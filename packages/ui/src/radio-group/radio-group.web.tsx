import * as React from "react";
import { cn } from "../_shared/variants";
import {
  RadioGroupProvider,
  useRadioGroupContext,
  useRadioGroupController,
  type RadioGroupItemSharedProps,
  type RadioGroupSharedProps,
} from "./radio-group.shared";

export interface RadioGroupProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "defaultValue" | "onChange" | "value"
    >,
    RadioGroupSharedProps {}

export function RadioGroup({
  children,
  className,
  defaultValue,
  onValueChange,
  value,
  ...props
}: RadioGroupProps) {
  const controller = useRadioGroupController({ defaultValue, onValueChange, value });

  return (
    <RadioGroupProvider value={controller}>
      <div role="radiogroup" className={cn("grid gap-3", className)} {...props}>
        {children}
      </div>
    </RadioGroupProvider>
  );
}

export interface RadioGroupItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">,
    RadioGroupItemSharedProps {}

export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ children, className, disabled, onClick, value, ...props }, ref) => {
    const context = useRadioGroupContext();
    const isActive = context.value === value;

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isActive}
        data-state={isActive ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-3 rounded-[var(--sx-radius-md)] px-1 py-1 text-left text-sm font-medium text-[color:var(--sx-color-foreground)] transition-colors duration-[var(--sx-motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:pointer-events-none disabled:opacity-45",
          className,
        )}
        onClick={(event) => {
          context.setValue(value);
          onClick?.(event);
        }}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-[border-color,box-shadow] duration-[var(--sx-motion-fast)]",
            isActive
              ? "border-[color:var(--sx-color-primary)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--sx-color-primary)_12%,transparent)]"
              : "border-[color:var(--sx-color-border-strong)]",
          )}
        >
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full bg-[color:var(--sx-color-primary)] transition-[transform,opacity] duration-[var(--sx-motion-fast)]",
              isActive ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
          />
        </span>
        <span>{children}</span>
      </button>
    );
  },
);

RadioGroupItem.displayName = "RadioGroupItem";
