import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const buttonVariants = defineVariants({
  variants: {
    variant: [
      "default",
      "secondary",
      "destructive",
      "ghost",
      "outline",
      "link",
    ] as const,
    size: ["sm", "md", "lg", "icon"] as const,
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonSharedProps extends ButtonVariantProps {}

export function resolveButtonVariants(props?: ButtonVariantProps) {
  return resolveVariants(buttonVariants, props);
}
