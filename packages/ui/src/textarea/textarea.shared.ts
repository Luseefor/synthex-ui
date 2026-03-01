import { defineVariants, resolveVariants, type VariantProps } from "../_shared/variants";

export const textareaVariants = defineVariants({
  variants: {
    size: ["sm", "md", "lg"] as const,
    tone: ["default", "invalid"] as const,
  },
  defaultVariants: {
    size: "md",
    tone: "default",
  },
});

export type TextareaVariantProps = VariantProps<typeof textareaVariants>;

export interface TextareaSharedProps {
  readonly invalid?: boolean;
  readonly uiSize?: TextareaVariantProps["size"];
}

export function resolveTextareaVariants(props?: TextareaSharedProps) {
  return resolveVariants(textareaVariants, {
    size: props?.uiSize,
    tone: props?.invalid ? "invalid" : "default",
  });
}
