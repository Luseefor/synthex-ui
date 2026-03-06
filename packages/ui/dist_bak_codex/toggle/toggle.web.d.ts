import * as React from "react";
import { type ToggleSharedProps } from "./toggle.shared";
export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">, ToggleSharedProps {
}
export declare const Toggle: React.ForwardRefExoticComponent<ToggleProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=toggle.web.d.ts.map