import * as React from "react";
import { defineVariants, resolveVariants } from "../_shared/variants";
const AvatarContext = React.createContext(null);
export const avatarVariants = defineVariants({
    variants: {
        size: ["sm", "md", "lg", "xl"],
    },
    defaultVariants: {
        size: "md",
    },
});
export function resolveAvatarVariants(props) {
    return resolveVariants(avatarVariants, props);
}
export function AvatarProvider({ children, value, }) {
    return React.createElement(AvatarContext.Provider, { value }, children);
}
export function useAvatarContext() {
    const context = React.useContext(AvatarContext);
    if (!context) {
        throw new Error("Avatar components must be used within <Avatar>.");
    }
    return context;
}
