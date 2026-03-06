import { defineVariants, resolveVariants } from "../_shared/variants";
export const inputVariants = defineVariants({
    variants: {
        size: ["sm", "md", "lg"],
        tone: ["default", "invalid"],
    },
    defaultVariants: {
        size: "md",
        tone: "default",
    },
});
export function resolveInputVariants(props) {
    return resolveVariants(inputVariants, {
        size: props?.uiSize,
        tone: props?.invalid ? "invalid" : "default",
    });
}
