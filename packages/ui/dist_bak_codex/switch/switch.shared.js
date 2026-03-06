import { defineVariants, resolveVariants } from "../_shared/variants";
export const switchVariants = defineVariants({
    variants: {
        size: ["sm", "md"],
    },
    defaultVariants: {
        size: "md",
    },
});
export function resolveSwitchVariants(props) {
    return resolveVariants(switchVariants, {
        size: props?.uiSize,
    });
}
