import * as React from "react";
import {
  Image,
  Text,
  View,
  type ImageProps,
  type ImageStyle,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import {
  resolveAvatarVariants,
  AvatarProvider,
  useAvatarContext,
  type AvatarSharedProps,
} from "./avatar.shared";

export interface AvatarProps extends Omit<ViewProps, "style">, AvatarSharedProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const Avatar = React.forwardRef<React.ElementRef<typeof View>, AvatarProps>(
  ({ children, size, style, ...props }, ref) => {
    const theme = useTheme();
    const [imageStatus, setImageStatus] = React.useState<"idle" | "loading" | "loaded" | "error">(
      "idle",
    );
    const resolved = resolveAvatarVariants({ size });

    const sizeStyles: Record<typeof resolved.size, ViewStyle> = {
      sm: { width: 32, height: 32 },
      md: { width: 40, height: 40 },
      lg: { width: 48, height: 48 },
      xl: { width: 64, height: 64 },
    };

    return (
      <AvatarProvider value={{ imageStatus, setImageStatus }}>
        <View
          ref={ref}
          style={[
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
          ]}
          {...props}
        >
          {children}
        </View>
      </AvatarProvider>
    );
  },
);

Avatar.displayName = "Avatar";

export interface AvatarImageProps extends Omit<ImageProps, "source"> {
  readonly source: ImageProps["source"];
  readonly style?: StyleProp<ImageStyle>;
}

export const AvatarImage = React.forwardRef<React.ElementRef<typeof Image>, AvatarImageProps>(
  ({ onError, onLoad, style, ...props }, ref) => {
    const { setImageStatus } = useAvatarContext();

    return (
      <Image
        ref={ref}
        style={[{ width: "100%", height: "100%" }, style]}
        onLoad={(event) => {
          setImageStatus("loaded");
          onLoad?.(event);
        }}
        onError={(event) => {
          setImageStatus("error");
          onError?.(event);
        }}
        {...props}
      />
    );
  },
);

AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps
  extends Omit<TextProps, "style">,
    AvatarSharedProps {
  readonly style?: StyleProp<TextStyle>;
}

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof Text>,
  AvatarFallbackProps
>(({ size, style, ...props }, ref) => {
  const theme = useTheme();
  const { imageStatus } = useAvatarContext();
  const resolved = resolveAvatarVariants({ size });

  if (imageStatus === "loaded") {
    return null;
  }

  const fontSizes: Record<typeof resolved.size, number> = {
    sm: 11,
    md: 12,
    lg: 14,
    xl: 16,
  };

  return (
    <View
      style={{
        position: "absolute",
        inset: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.secondaryMuted,
      }}
    >
      <Text
        ref={ref}
        style={[
          {
            color: theme.colors.foregroundMuted,
            fontFamily: theme.typography.family.sans,
            fontSize: fontSizes[resolved.size],
            fontWeight: theme.typography.weight.semibold,
            textTransform: "uppercase",
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
});

AvatarFallback.displayName = "AvatarFallback";
