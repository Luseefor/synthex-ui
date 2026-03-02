import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cn } from "../_shared/variants";
import { resolveToggleVariants, type ToggleSharedProps } from "./toggle.shared";

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">,
  ToggleSharedProps { }

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
          "inline-flex items-center justify-center gap-2 rounded-[var(--sx-radius-md)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:pointer-events-none disabled:opacity-50",
          resolved.size === "sm"
            ? "h-8 px-3 text-xs"
            : resolved.size === "lg"
              ? "h-10 px-8"
              : "h-9 px-4 text-sm",
          resolved.variant === "default"
            ? currentPressed
              ? "border-transparent bg-[color:var(--sx-color-primary)] text-[color:var(--sx-color-foreground-on-brand)] shadow-[var(--sx-shadow-sm)]"
              : "border-transparent bg-[color:var(--sx-color-secondary)] text-[color:var(--sx-color-foreground)] hover:bg-[color:var(--sx-color-secondary)]/80"
            : currentPressed
              ? "border-transparent bg-[color:var(--sx-color-accent)] text-[color:var(--sx-color-foreground)]"
              : "border-[color:var(--sx-color-border)] bg-transparent text-[color:var(--sx-color-foreground)] hover:bg-[color:var(--sx-color-accent)] hover:text-[color:var(--sx-color-foreground)]",
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
