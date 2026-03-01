import * as React from "react";
import { cn } from "../_shared/variants";
import type { AspectRatioSharedProps } from "./aspect-ratio.shared";

export interface AspectRatioProps
  extends React.HTMLAttributes<HTMLDivElement>,
    AspectRatioSharedProps {
  readonly children?: React.ReactNode;
}

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ children, className, ratio = 16 / 9, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: String(ratio), ...style }}
      {...props}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  ),
);

AspectRatio.displayName = "AspectRatio";
