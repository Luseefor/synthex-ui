import { type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type DatePickerSharedProps } from "./date-picker.shared";
export interface DatePickerProps extends Omit<ViewProps, "style">, DatePickerSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare function DatePicker({ defaultValue, onValueChange, placeholder, style, value, ...props }: DatePickerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=date-picker.native.d.ts.map