import { defineVariants, resolveVariants } from "../_shared/variants";
export const cardVariants = defineVariants({
    variants: {
        variant: ["default", "elevated", "interactive", "muted", "accent"],
    },
    defaultVariants: {
        variant: "default",
    },
});
export function resolveCardVariants(props) {
    return resolveVariants(cardVariants, props);
}
