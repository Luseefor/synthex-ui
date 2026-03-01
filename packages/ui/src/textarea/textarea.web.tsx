import * as React from "react";
import {
  cn,
  resolveVariantStyles,
  type VariantStyleDefinition,
} from "../_shared/variants";
import {
  resolveTextareaVariants,
  textareaVariants,
  type TextareaSharedProps,
} from "./textarea.shared";

const textareaClassStyles = {
  slots: ["root"] as const,
  base: {
    root:
      "flex w-full rounded-[var(--sx-radius-md)] border bg-[color:var(--sx-color-surface-raised)] px-3.5 py-2.5 text-sm text-[color:var(--sx-color-foreground)] shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[color:var(--sx-color-foreground-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--sx-color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--sx-color-background)] disabled:cursor-not-allowed disabled:opacity-50",
  },
  variants: {
    size: {
      sm: { root: "min-h-[104px] text-[13px]" },
      md: { root: "min-h-[128px] text-sm" },
      lg: { root: "min-h-[164px] text-[15px]" },
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
} satisfies VariantStyleDefinition<typeof textareaVariants.variants, "root", string>;

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    TextareaSharedProps {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, uiSize, ...props }, ref) => {
    const resolved = resolveTextareaVariants({ invalid, uiSize });
    const slots = resolveVariantStyles(textareaVariants, textareaClassStyles, resolved);

    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(...slots.root, className)}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
