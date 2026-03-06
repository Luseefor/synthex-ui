import * as React from "react";
import { Image, Text, View, type ImageProps, type ImageStyle, type StyleProp, type TextProps, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type AvatarSharedProps } from "./avatar.shared";
export interface AvatarProps extends Omit<ViewProps, "style">, AvatarSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<View>>;
export interface AvatarImageProps extends Omit<ImageProps, "source"> {
    readonly source: ImageProps["source"];
    readonly style?: StyleProp<ImageStyle>;
}
export declare const AvatarImage: React.ForwardRefExoticComponent<AvatarImageProps & React.RefAttributes<Image>>;
export interface AvatarFallbackProps extends Omit<TextProps, "style">, AvatarSharedProps {
    readonly style?: StyleProp<TextStyle>;
}
export declare const AvatarFallback: React.ForwardRefExoticComponent<AvatarFallbackProps & React.RefAttributes<Text>>;
//# sourceMappingURL=avatar.native.d.ts.map