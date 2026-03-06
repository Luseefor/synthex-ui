import { defineVariants, resolveVariants } from "../_shared/variants";
export const progressVariants = defineVariants({
    variants: {
        size: ["sm", "md", "lg"],
    },
    defaultVariants: {
        size: "md",
    },
});
export function resolveProgressVariants(props) {
    return resolveVariants(progressVariants, props);
}
