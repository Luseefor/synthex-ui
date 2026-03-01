import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cn } from "../_shared/variants";
import { resolveSwitchVariants, type SwitchSharedProps } from "./switch.shared";

export interface SwitchProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "checked" | "defaultChecked" | "onChange"
    >,
    SwitchSharedProps {}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      className,
      defaultChecked = false,
      disabled,
      onCheckedChange,
      onClick,
      uiSize,
      ...props
    },
    ref,
  ) => {
    const [currentChecked, setCurrentChecked] = useControllableState({
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
      value: checked,
    });
    const resolved = resolveSwitchVariants({ uiSize });
    const isSmall = resolved.size === "sm";

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={currentChecked}
        data-state={currentChecked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "inline-flex shrink-0 items-center rounded-full border border-transparent transition-[background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:pointer-events-none disabled:opacity-50",
          isSmall ? "h-6 w-10 p-0.5" : "h-7 w-12 p-0.5",
          currentChecked
            ? "bg-[color:var(--sx-color-primary)] shadow-[0_8px_18px_rgba(29,78,216,0.22)]"
            : "bg-[color:var(--sx-color-secondary)]",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);

          if (event.defaultPrevented || disabled) {
            return;
          }

          setCurrentChecked(!currentChecked);
        }}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "block rounded-full bg-[color:var(--sx-color-surface)] shadow-[0_2px_8px_rgba(15,23,42,0.16)] transition-transform duration-150",
            isSmall ? "h-5 w-5" : "h-6 w-6",
            currentChecked
              ? isSmall
                ? "translate-x-4"
                : "translate-x-5"
              : "translate-x-0",
          )}
        />
      </button>
    );
  },
);

Switch.displayName = "Switch";
