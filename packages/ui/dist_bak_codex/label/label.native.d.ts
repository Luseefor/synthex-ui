import * as React from "react";
import { Text as NativeText, type StyleProp, type TextProps as NativeTextProps, type TextStyle } from "react-native";
export interface LabelProps extends NativeTextProps {
    readonly style?: StyleProp<TextStyle>;
}
export declare const Label: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<NativeText>>;
//# sourceMappingURL=label.native.d.ts.map