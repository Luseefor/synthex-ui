import * as React from "react";
import { Toggle } from "../toggle/toggle.web";
import { type ToggleGroupSharedProps } from "./toggle-group.shared";
export interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement>, ToggleGroupSharedProps {
    readonly defaultValue?: string | string[];
}
export declare function ToggleGroup({ children, className, defaultValue, disabled, onValueChange, type, value, ...props }: ToggleGroupProps): import("react/jsx-runtime").JSX.Element;
export interface ToggleGroupItemProps extends React.ComponentPropsWithoutRef<typeof Toggle> {
    readonly value: string;
}
export declare const ToggleGroupItem: React.ForwardRefExoticComponent<ToggleGroupItemProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=toggle-group.web.d.ts.map