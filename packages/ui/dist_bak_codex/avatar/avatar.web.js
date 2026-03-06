import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn, resolveVariantStyles, } from "../_shared/variants";
import { avatarVariants, AvatarProvider, useAvatarContext, } from "./avatar.shared";
const avatarClassStyles = {
    slots: ["root", "fallback"],
    base: {
        root: "relative inline-flex shrink-0 overflow-hidden rounded-full border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-secondary-muted)]",
        fallback: "absolute inset-0 flex items-center justify-center bg-[color:var(--sx-color-secondary-muted)] font-semibold uppercase tracking-[0.04em] text-[color:var(--sx-color-foreground-muted)]",
    },
    variants: {
        size: {
            sm: {
                root: "h-8 w-8",
                fallback: "text-[11px]",
            },
            md: {
                root: "h-10 w-10",
                fallback: "text-xs",
            },
            lg: {
                root: "h-12 w-12",
                fallback: "text-sm",
            },
            xl: {
                root: "h-16 w-16",
                fallback: "text-base",
            },
        },
    },
};
export const Avatar = React.forwardRef(({ children, className, size, ...props }, ref) => {
    const [imageStatus, setImageStatus] = React.useState("idle");
    const slots = resolveVariantStyles(avatarVariants, avatarClassStyles, { size });
    return (_jsx(AvatarProvider, { value: { imageStatus, setImageStatus }, children: _jsx("div", { ref: ref, className: cn(...slots.root, className), ...props, children: children }) }));
});
Avatar.displayName = "Avatar";
export const AvatarImage = React.forwardRef(({ className, onError, onLoad, ...props }, ref) => {
    const { setImageStatus } = useAvatarContext();
    return (_jsx("img", { ref: ref, className: cn("h-full w-full object-cover", className), onLoad: (event) => {
            setImageStatus("loaded");
            onLoad?.(event);
        }, onError: (event) => {
            setImageStatus("error");
            onError?.(event);
        }, ...props }));
});
AvatarImage.displayName = "AvatarImage";
export const AvatarFallback = React.forwardRef(({ className, size, ...props }, ref) => {
    const { imageStatus } = useAvatarContext();
    const slots = resolveVariantStyles(avatarVariants, avatarClassStyles, { size });
    if (imageStatus === "loaded") {
        return null;
    }
    return _jsx("div", { ref: ref, className: cn(...slots.fallback, className), ...props });
});
AvatarFallback.displayName = "AvatarFallback";
