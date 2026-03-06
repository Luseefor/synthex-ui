import { defineVariants, resolveVariants } from "../_shared/variants";
export const textareaVariants = defineVariants({
    variants: {
        size: ["sm", "md", "lg"],
        tone: ["default", "invalid"],
    },
    defaultVariants: {
        size: "md",
        tone: "default",
    },
});
export function resolveTextareaVariants(props) {
    return resolveVariants(textareaVariants, {
        size: props?.uiSize,
        tone: props?.invalid ? "invalid" : "default",
    });
}
