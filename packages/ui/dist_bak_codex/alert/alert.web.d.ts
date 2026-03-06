import * as React from "react";
import { type AlertSharedProps } from "./alert.shared";
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, AlertSharedProps {
}
export declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
export declare const AlertTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & AlertSharedProps & React.RefAttributes<HTMLHeadingElement>>;
export declare const AlertDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & AlertSharedProps & React.RefAttributes<HTMLParagraphElement>>;
//# sourceMappingURL=alert.web.d.ts.map