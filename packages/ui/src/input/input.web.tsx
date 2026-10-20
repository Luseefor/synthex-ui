import * as React from "react";
import { cn } from "../_shared/variants";
import { resolveInputVariants, type InputSharedProps } from "./input.shared";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    InputSharedProps {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = "text", uiSize, ...props }, ref) => {
    const resolved = resolveInputVariants({ invalid, uiSize });

    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        data-size={resolved.size}
        data-invalid={resolved.tone === "invalid" || undefined}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          resolved.size === "sm" && "h-8 px-3 text-xs md:text-xs",
          resolved.size === "lg" && "h-10 px-4 text-sm md:text-sm",
          resolved.tone === "invalid" && "border-destructive focus-visible:ring-destructive/30",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
