import * as React from "react";
interface SelectContextValue {
    readonly labelVersion: number;
    readonly open: boolean;
    readonly placeholder?: string;
    readonly registerItem: (value: string, label: string) => void;
    readonly setOpen: (open: boolean) => void;
    readonly setValue: (value: string) => void;
    readonly value: string;
    readonly getLabel: (value: string) => string | undefined;
}
export interface SelectSharedProps {
    readonly defaultOpen?: boolean;
    readonly defaultValue?: string;
    readonly onOpenChange?: (open: boolean) => void;
    readonly onValueChange?: (value: string) => void;
    readonly open?: boolean;
    readonly placeholder?: string;
    readonly value?: string;
}
export interface SelectItemSharedProps {
    readonly textValue?: string;
    readonly value: string;
}
export declare function useSelectController({ defaultOpen, defaultValue, onOpenChange, onValueChange, open, placeholder, value, }: SelectSharedProps): SelectContextValue;
export declare function SelectProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: SelectContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<SelectContextValue | null>>;
export declare function useSelectContext(): SelectContextValue;
export {};
//# sourceMappingURL=select.shared.d.ts.map