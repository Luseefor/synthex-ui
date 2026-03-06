import { defineVariants, resolveVariants } from "../_shared/variants";
export const badgeVariants = defineVariants({
    variants: {
        variant: ["default", "secondary", "destructive", "outline"],
    },
    defaultVariants: {
        variant: "default",
    },
});
export function resolveBadgeVariants(props) {
    return resolveVariants(badgeVariants, props);
}
