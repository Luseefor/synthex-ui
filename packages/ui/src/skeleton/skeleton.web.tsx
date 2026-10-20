import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../_shared/variants";

const skeletonVariants = cva("animate-pulse rounded-md bg-muted", {
  variants: {
    variant: {
      default: "",
      soft: "opacity-70",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      data-variant={variant ?? "default"}
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Skeleton, skeletonVariants };
