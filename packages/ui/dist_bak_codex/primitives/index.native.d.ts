import * as React from "react";
import { ScrollView, Text as NativeText, View, type PressableProps, type ScrollViewProps, type StyleProp, type TextProps as NativeTextProps, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type BoxStyleProps, type DimensionValue, type SurfaceStyleProps, type TextStyleProps } from "./shared";
export interface BoxProps extends Omit<ViewProps, "style">, BoxStyleProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Box: React.ForwardRefExoticComponent<BoxProps & React.RefAttributes<View>>;
export interface TextProps extends Omit<NativeTextProps, "style">, TextStyleProps {
    readonly style?: StyleProp<TextStyle>;
}
export declare const Text: React.ForwardRefExoticComponent<TextProps & React.RefAttributes<NativeText>>;
export interface StackProps extends Omit<BoxProps, "direction"> {
}
export declare const Stack: React.ForwardRefExoticComponent<StackProps & React.RefAttributes<View>>;
export interface InlineProps extends Omit<BoxProps, "direction"> {
}
export declare const Inline: React.ForwardRefExoticComponent<InlineProps & React.RefAttributes<View>>;
export interface GridProps extends Omit<BoxProps, "direction" | "wrap"> {
    readonly columns?: number;
    readonly minItemWidth?: DimensionValue;
}
export declare const Grid: React.ForwardRefExoticComponent<GridProps & React.RefAttributes<View>>;
export interface SurfaceProps extends Omit<ViewProps, "style">, SurfaceStyleProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Surface: React.ForwardRefExoticComponent<SurfaceProps & React.RefAttributes<View>>;
export interface PressablePrimitiveProps extends Omit<PressableProps, "style">, BoxStyleProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const PressablePrimitive: React.ForwardRefExoticComponent<PressablePrimitiveProps & React.RefAttributes<View>>;
export interface ScrollAreaProps extends Omit<ScrollViewProps, "style">, Omit<BoxStyleProps, "direction" | "wrap"> {
    readonly contentContainerStyle?: StyleProp<ViewStyle>;
    readonly style?: StyleProp<ViewStyle>;
}
export declare const ScrollArea: React.ForwardRefExoticComponent<ScrollAreaProps & React.RefAttributes<ScrollView>>;
//# sourceMappingURL=index.native.d.ts.map