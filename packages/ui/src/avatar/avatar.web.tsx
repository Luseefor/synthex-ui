import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../_shared/variants";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "size-8",
        md: "size-10",
        lg: "size-12",
        xl: "size-16",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  readonly size?: "sm" | "md" | "lg" | "xl";
}

function Avatar({ className, size = "md", ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

export interface AvatarFallbackProps
  extends React.ComponentProps<typeof AvatarPrimitive.Fallback>,
    VariantProps<typeof avatarVariants> {
  readonly size?: "sm" | "md" | "lg" | "xl";
}

function AvatarFallback({ className, size = "md", ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      data-size={size}
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };
