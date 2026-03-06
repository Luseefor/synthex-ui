import * as React from "react";
import { type CalendarSharedProps } from "./calendar.shared";
export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">, CalendarSharedProps {
}
export declare const Calendar: React.ForwardRefExoticComponent<CalendarProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=calendar.web.d.ts.map