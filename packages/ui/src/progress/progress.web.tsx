import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../_shared/variants";

const progressVariants = cva("bg-primary/20 relative w-full overflow-hidden rounded-full", {
  variants: {
    size: {
      sm: "h-2",
      md: "h-3",
      lg: "h-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  readonly size?: "sm" | "md" | "lg";
}

function Progress({ className, max = 100, size = "md", value = 0, ...props }: ProgressProps) {
  const clamped = Math.min(Math.max(value ?? 0, 0), max);
  const percentage = max <= 0 ? 0 : (clamped / max) * 100;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-size={size}
      data-value={clamped}
      data-max={max}
      max={max}
      value={clamped}
      className={cn(progressVariants({ size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress, progressVariants };
