import * as React from "react";
import { cn } from "../_shared/variants";
import {
  resolveTextareaVariants,
  type TextareaSharedProps,
} from "./textarea.shared";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    TextareaSharedProps {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, uiSize, ...props }, ref) => {
    const resolved = resolveTextareaVariants({ invalid, uiSize });

    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        data-size={resolved.size}
        data-invalid={resolved.tone === "invalid" || undefined}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          resolved.size === "sm" && "min-h-[52px] text-xs md:text-xs",
          resolved.size === "lg" && "min-h-[72px] text-sm md:text-sm",
          resolved.tone === "invalid" && "border-destructive focus-visible:ring-destructive/30",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
