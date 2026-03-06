import * as React from "react";
interface RadioGroupContextValue {
    readonly value: string;
    readonly setValue: (value: string) => void;
}
export interface RadioGroupSharedProps {
    readonly defaultValue?: string;
    readonly onValueChange?: (value: string) => void;
    readonly value?: string;
}
export interface RadioGroupItemSharedProps {
    readonly value: string;
}
export declare function useRadioGroupController({ defaultValue, onValueChange, value, }: Pick<RadioGroupSharedProps, "defaultValue" | "onValueChange" | "value">): RadioGroupContextValue;
export declare function RadioGroupProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: RadioGroupContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<RadioGroupContextValue | null>>;
export declare function useRadioGroupContext(): RadioGroupContextValue;
export {};
//# sourceMappingURL=radio-group.shared.d.ts.map