import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Image, Text, View, } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveAvatarVariants, AvatarProvider, useAvatarContext, } from "./avatar.shared";
export const Avatar = React.forwardRef(({ children, size, style, ...props }, ref) => {
    const theme = useTheme();
    const [imageStatus, setImageStatus] = React.useState("idle");
    const resolved = resolveAvatarVariants({ size });
    const sizeStyles = {
        sm: { width: 32, height: 32 },
        md: { width: 40, height: 40 },
        lg: { width: 48, height: 48 },
        xl: { width: 64, height: 64 },
    };
    return (_jsx(AvatarProvider, { value: { imageStatus, setImageStatus }, children: _jsx(View, { ref: ref, style: [
                {
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.secondaryMuted,
                },
                sizeStyles[resolved.size],
                style,
            ], ...props, children: children }) }));
});
Avatar.displayName = "Avatar";
export const AvatarImage = React.forwardRef(({ onError, onLoad, style, ...props }, ref) => {
    const { setImageStatus } = useAvatarContext();
    return (_jsx(Image, { ref: ref, style: [{ width: "100%", height: "100%" }, style], onLoad: (event) => {
            setImageStatus("loaded");
            onLoad?.(event);
        }, onError: (event) => {
            setImageStatus("error");
            onError?.(event);
        }, ...props }));
});
AvatarImage.displayName = "AvatarImage";
export const AvatarFallback = React.forwardRef(({ size, style, ...props }, ref) => {
    const theme = useTheme();
    const { imageStatus } = useAvatarContext();
    const resolved = resolveAvatarVariants({ size });
    if (imageStatus === "loaded") {
        return null;
    }
    const fontSizes = {
        sm: 11,
        md: 12,
        lg: 14,
        xl: 16,
    };
    return (_jsx(View, { style: {
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.secondaryMuted,
        }, children: _jsx(Text, { ref: ref, style: [
                {
                    color: theme.colors.foregroundMuted,
                    fontFamily: theme.typography.family.sans,
                    fontSize: fontSizes[resolved.size],
                    fontWeight: theme.typography.weight.semibold,
                    textTransform: "uppercase",
                },
                style,
            ], ...props }) }));
});
AvatarFallback.displayName = "AvatarFallback";
