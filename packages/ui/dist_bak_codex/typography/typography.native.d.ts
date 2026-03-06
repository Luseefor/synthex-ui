import * as React from "react";
import { Text, type StyleProp, type TextProps, type TextStyle } from "react-native";
interface NativeTypographyProps extends Omit<TextProps, "style"> {
    readonly style?: StyleProp<TextStyle>;
}
export declare const H1: React.ForwardRefExoticComponent<NativeTypographyProps & React.RefAttributes<Text>>;
export declare const H2: React.ForwardRefExoticComponent<NativeTypographyProps & React.RefAttributes<Text>>;
export declare const H3: React.ForwardRefExoticComponent<NativeTypographyProps & React.RefAttributes<Text>>;
export declare const Lead: React.ForwardRefExoticComponent<NativeTypographyProps & React.RefAttributes<Text>>;
export declare const Muted: React.ForwardRefExoticComponent<NativeTypographyProps & React.RefAttributes<Text>>;
export declare const Small: React.ForwardRefExoticComponent<NativeTypographyProps & React.RefAttributes<Text>>;
export {};
//# sourceMappingURL=typography.native.d.ts.map