import * as React from "react";
import {
  cn,
  resolveVariantStyles,
  type VariantStyleDefinition,
} from "../_shared/variants";
import { getFieldControlClassName } from "../_shared/field-control.web";
import { inputVariants, resolveInputVariants, type InputSharedProps } from "./input.shared";

const inputClassStyles = {
  slots: ["root"] as const,
  base: {
    root: "",
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
        className={getFieldControlClassName({
          className: cn(...slots.root, className),
          size: resolved.size,
          tone: resolved.tone,
        })}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
