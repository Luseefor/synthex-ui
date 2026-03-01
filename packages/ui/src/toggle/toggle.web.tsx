import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cn } from "../_shared/variants";
import { resolveToggleVariants, type ToggleSharedProps } from "./toggle.shared";

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">,
    ToggleSharedProps {}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      defaultPressed = false,
      onClick,
      onPressedChange,
      pressed,
      size,
      variant,
      ...props
    },
    ref,
  ) => {
    const [currentPressed, setCurrentPressed] = useControllableState({
      defaultValue: defaultPressed,
      onChange: onPressedChange,
      value: pressed,
    });
    const resolved = resolveToggleVariants({ size, variant });

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={currentPressed}
        data-state={currentPressed ? "on" : "off"}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[var(--sx-radius-md)] border font-medium tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow] duration-[var(--sx-motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:pointer-events-none disabled:opacity-45",
          resolved.size === "sm"
            ? "h-9 px-3.5 text-[13px]"
            : resolved.size === "lg"
              ? "h-11 px-5 text-[15px]"
              : "h-10 px-4 text-sm",
          resolved.variant === "default"
            ? currentPressed
              ? "border-[color:var(--sx-color-primary)] bg-[color:var(--sx-color-primary)] text-[color:var(--sx-color-foreground-on-brand)] shadow-[0_8px_20px_rgba(29,78,216,0.18)]"
              : "border-transparent bg-[color:var(--sx-color-secondary-muted)] text-[color:var(--sx-color-foreground)] hover:bg-[color:var(--sx-color-secondary)]"
            : currentPressed
              ? "border-[color:var(--sx-color-primary)] bg-[color:var(--sx-color-primary-muted)] text-[color:var(--sx-color-primary)]"
              : "border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] text-[color:var(--sx-color-foreground)] hover:bg-[color:var(--sx-color-surface-muted)]",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);

          if (event.defaultPrevented) {
            return;
          }

          setCurrentPressed(!currentPressed);
        }}
        {...props}
      />
    );
  },
);

Toggle.displayName = "Toggle";
