import { defineVariants, resolveVariants } from "../_shared/variants";
export const skeletonVariants = defineVariants({
    variants: {
        variant: ["default", "soft"],
    },
    defaultVariants: {
        variant: "default",
    },
});
export function resolveSkeletonVariants(props) {
    return resolveVariants(skeletonVariants, props);
}
