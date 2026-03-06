import { defineVariants, resolveVariants } from "../_shared/variants";
export const checkboxVariants = defineVariants({
    variants: {
        size: ["sm", "md"],
        tone: ["default", "invalid"],
    },
    defaultVariants: {
        size: "md",
        tone: "default",
    },
});
export function resolveCheckboxVariants(props) {
    return resolveVariants(checkboxVariants, {
        size: props?.uiSize,
        tone: props?.invalid ? "invalid" : "default",
    });
}
