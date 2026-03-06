import { type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type SeparatorVariantProps } from "./separator.shared";
export interface SeparatorProps extends Omit<ViewProps, "style">, SeparatorVariantProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare function Separator({ orientation, style, ...props }: SeparatorProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=separator.native.d.ts.map