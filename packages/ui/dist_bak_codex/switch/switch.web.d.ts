import * as React from "react";
import { type SwitchSharedProps } from "./switch.shared";
export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "checked" | "defaultChecked" | "onChange">, SwitchSharedProps {
}
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=switch.web.d.ts.map