import { defineVariants, resolveVariants } from "../_shared/variants";
export const alertVariants = defineVariants({
    variants: {
        variant: ["default", "destructive", "success", "warning"],
    },
    defaultVariants: {
        variant: "default",
    },
});
export function resolveAlertVariants(props) {
    return resolveVariants(alertVariants, props);
}
