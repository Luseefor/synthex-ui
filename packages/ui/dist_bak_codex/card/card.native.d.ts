import * as React from "react";
import { Text, View, type StyleProp, type TextProps, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type CardVariantProps } from "./card.shared";
export interface CardProps extends Omit<ViewProps, "style">, CardVariantProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<View>>;
export interface CardSectionProps extends Omit<ViewProps, "style"> {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const CardHeader: React.ForwardRefExoticComponent<CardSectionProps & React.RefAttributes<View>>;
export interface CardTextProps extends Omit<TextProps, "style"> {
    readonly style?: StyleProp<TextStyle>;
}
export declare const CardTitle: React.ForwardRefExoticComponent<CardTextProps & React.RefAttributes<Text>>;
export declare const CardDescription: React.ForwardRefExoticComponent<CardTextProps & React.RefAttributes<Text>>;
export declare const CardContent: React.ForwardRefExoticComponent<CardSectionProps & React.RefAttributes<View>>;
export declare const CardFooter: React.ForwardRefExoticComponent<CardSectionProps & React.RefAttributes<View>>;
//# sourceMappingURL=card.native.d.ts.map