import * as React from "react";
import type { SliderSharedProps } from "./slider.shared";
export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "max" | "min" | "onChange" | "step" | "value">, SliderSharedProps {
}
export declare const Slider: React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=slider.web.d.ts.map