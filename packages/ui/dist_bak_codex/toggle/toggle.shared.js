import { defineVariants, resolveVariants } from "../_shared/variants";
export const toggleVariants = defineVariants({
    variants: {
        size: ["sm", "md", "lg"],
        variant: ["default", "outline"],
    },
    defaultVariants: {
        size: "md",
        variant: "outline",
    },
});
export function resolveToggleVariants(props) {
    return resolveVariants(toggleVariants, props);
}
