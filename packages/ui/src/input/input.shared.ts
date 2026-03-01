import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const inputVariants = defineVariants({
  variants: {
    size: ["sm", "md", "lg"] as const,
    tone: ["default", "invalid"] as const,
  },
  defaultVariants: {
    size: "md",
    tone: "default",
  },
});

export type InputVariantProps = VariantProps<typeof inputVariants>;

export interface InputSharedProps {
  readonly uiSize?: InputVariantProps["size"];
  readonly invalid?: boolean;
}

export function resolveInputVariants(props?: InputSharedProps) {
  return resolveVariants(inputVariants, {
    size: props?.uiSize,
    tone: props?.invalid ? "invalid" : "default",
  });
}
