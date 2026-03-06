import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import { type CalendarSharedProps } from "./calendar.shared";
export interface CalendarProps extends Omit<ViewProps, "style">, CalendarSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Calendar: React.ForwardRefExoticComponent<CalendarProps & React.RefAttributes<View>>;
//# sourceMappingURL=calendar.native.d.ts.map