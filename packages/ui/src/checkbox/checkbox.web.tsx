import * as React from "react";
import { useControllableState } from "../hooks/useControllableState";
import {
  cn,
  resolveVariantStyles,
  type VariantStyleDefinition,
} from "../_shared/variants";
import { CheckIcon } from "../icons/index.web";
import {
  checkboxVariants,
  resolveCheckboxVariants,
  type CheckboxSharedProps,
} from "./checkbox.shared";

const checkboxClassStyles = {
  slots: ["root", "indicator"] as const,
  base: {
    root:
      "inline-flex shrink-0 items-center justify-center rounded-[calc(var(--sx-radius-sm)-1px)] border transition-[border-color,background-color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:pointer-events-none disabled:opacity-50",
    indicator:
      "scale-0 text-[color:var(--sx-color-foreground-on-brand)] opacity-0 transition-[transform,opacity] duration-150",
  },
  variants: {
    size: {
      sm: {
        root: "h-4 w-4",
      },
      md: {
        root: "h-5 w-5",
      },
    },
    tone: {
      default: {
        root:
          "border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] hover:border-[color:var(--sx-color-primary)]",
      },
      invalid: {
        root:
          "border-[color:var(--sx-color-destructive)] bg-[color:var(--sx-color-surface)] focus-visible:ring-[color:color-mix(in_srgb,var(--sx-color-destructive)_28%,transparent)]",
      },
    },
  },
} satisfies VariantStyleDefinition<typeof checkboxVariants.variants, "root" | "indicator", string>;

export interface CheckboxProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "checked" | "defaultChecked" | "onChange"
    >,
    CheckboxSharedProps {}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      checked,
      className,
      defaultChecked = false,
      disabled,
      invalid,
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
    const resolved = resolveCheckboxVariants({ invalid, uiSize });
    const slots = resolveVariantStyles(checkboxVariants, checkboxClassStyles, resolved);

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={currentChecked}
        aria-invalid={invalid || undefined}
        data-state={currentChecked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          ...slots.root,
          currentChecked &&
            "border-[color:var(--sx-color-primary)] bg-[color:var(--sx-color-primary)] shadow-[0_6px_14px_rgba(29,78,216,0.2)]",
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
          className={cn(...slots.indicator, currentChecked && "scale-100 opacity-100")}
        >
          <CheckIcon size={resolved.size === "sm" ? 12 : 14} strokeWidth={2.6} />
        </span>
      </button>
    );
  },
);

Checkbox.displayName = "Checkbox";
