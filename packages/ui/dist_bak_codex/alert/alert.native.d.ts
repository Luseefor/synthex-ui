import * as React from "react";
import { Text, View, type StyleProp, type TextProps, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type AlertSharedProps } from "./alert.shared";
export interface AlertProps extends Omit<ViewProps, "style">, AlertSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<View>>;
export interface AlertTextProps extends Omit<TextProps, "style">, AlertSharedProps {
    readonly style?: StyleProp<TextStyle>;
}
export declare const AlertTitle: React.ForwardRefExoticComponent<AlertTextProps & React.RefAttributes<Text>>;
export declare const AlertDescription: React.ForwardRefExoticComponent<AlertTextProps & React.RefAttributes<Text>>;
//# sourceMappingURL=alert.native.d.ts.map