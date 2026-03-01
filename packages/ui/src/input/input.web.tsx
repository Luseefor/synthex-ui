import * as React from "react";
import {
  cn,
  resolveVariantStyles,
  type VariantStyleDefinition,
} from "../_shared/variants";
import { inputVariants, resolveInputVariants, type InputSharedProps } from "./input.shared";

const inputClassStyles = {
  slots: ["root"] as const,
  base: {
    root:
      "w-full rounded-[var(--sx-radius-md)] border bg-[color:var(--sx-color-surface-raised)] text-[color:var(--sx-color-foreground)] shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[color:var(--sx-color-foreground-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:cursor-not-allowed disabled:opacity-50",
  },
  variants: {
    size: {
      sm: {
        root: "h-9 px-3 text-[13px]",
      },
      md: {
        root: "h-10 px-3.5 text-sm",
      },
      lg: {
        root: "h-11 px-4 text-[15px]",
      },
    },
    tone: {
      default: {
        root:
          "border-[color:var(--sx-color-border)] hover:border-[color:var(--sx-color-border-strong)] focus-visible:border-[color:var(--sx-color-primary)]",
      },
      invalid: {
        root:
          "border-[color:var(--sx-color-destructive)] focus-visible:ring-[color:color-mix(in_srgb,var(--sx-color-destructive)_28%,transparent)]",
      },
    },
  },
} satisfies VariantStyleDefinition<typeof inputVariants.variants, "root", string>;

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    InputSharedProps {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = "text", uiSize, ...props }, ref) => {
    const resolved = resolveInputVariants({ invalid, uiSize });
    const slots = resolveVariantStyles(inputVariants, inputClassStyles, resolved);

    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(...slots.root, className)}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
