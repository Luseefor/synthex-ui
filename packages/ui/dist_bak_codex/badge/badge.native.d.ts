import { type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native";
import { type BadgeSharedProps } from "./badge.shared";
export interface BadgeProps extends Omit<ViewProps, "style">, BadgeSharedProps {
    readonly style?: StyleProp<ViewStyle>;
    readonly textStyle?: StyleProp<TextStyle>;
}
export declare function Badge({ children, style, textStyle, variant, ...props }: BadgeProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=badge.native.d.ts.map