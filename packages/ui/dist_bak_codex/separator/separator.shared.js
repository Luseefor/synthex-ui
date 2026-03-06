import { defineVariants, resolveVariants } from "../_shared/variants";
export const separatorVariants = defineVariants({
    variants: {
        orientation: ["horizontal", "vertical"],
    },
    defaultVariants: {
        orientation: "horizontal",
    },
});
export function resolveSeparatorVariants(props) {
    return resolveVariants(separatorVariants, props);
}
