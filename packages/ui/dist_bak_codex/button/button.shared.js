import { defineVariants, resolveVariants } from "../_shared/variants";
export const buttonVariants = defineVariants({
    variants: {
        variant: [
            "default",
            "secondary",
            "destructive",
            "ghost",
            "outline",
            "link",
        ],
        size: ["sm", "md", "lg", "icon"],
    },
    defaultVariants: {
        variant: "default",
        size: "md",
    },
});
export function resolveButtonVariants(props) {
    return resolveVariants(buttonVariants, props);
}
