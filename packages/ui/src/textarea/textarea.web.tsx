import * as React from "react";
import {
  cn,
  resolveVariantStyles,
  type VariantStyleDefinition,
} from "../_shared/variants";
import { getFieldControlClassName } from "../_shared/field-control.web";
import {
  resolveTextareaVariants,
  textareaVariants,
  type TextareaSharedProps,
} from "./textarea.shared";

const textareaClassStyles = {
  slots: ["root"] as const,
  base: {
    root: "flex w-full",
  },
  variants: {
    size: {
      sm: { root: "" },
      md: { root: "" },
      lg: { root: "" },
    },
    tone: {
      default: { root: "" },
      invalid: { root: "" },
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
        className={getFieldControlClassName({
          className: cn(...slots.root, className),
          multiline: true,
          size: resolved.size,
          tone: resolved.tone,
        })}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
