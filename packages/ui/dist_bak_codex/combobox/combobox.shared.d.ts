import * as React from "react";
interface ComboboxContextValue {
    readonly labelVersion: number;
    readonly open: boolean;
    readonly placeholder?: string;
    readonly query: string;
    readonly registerItem: (value: string, label: string) => void;
    readonly setItemVisibility: (id: string, visible: boolean) => void;
    readonly setOpen: (open: boolean) => void;
    readonly setQuery: (query: string) => void;
    readonly setValue: (value: string) => void;
    readonly unregisterItem: (id: string) => void;
    readonly value: string;
    readonly visibleItemCount: number;
    readonly getLabel: (value: string) => string | undefined;
}
export interface ComboboxSharedProps {
    readonly defaultOpen?: boolean;
    readonly defaultQuery?: string;
    readonly defaultValue?: string;
    readonly onOpenChange?: (open: boolean) => void;
    readonly onQueryChange?: (query: string) => void;
    readonly onValueChange?: (value: string) => void;
    readonly open?: boolean;
    readonly placeholder?: string;
    readonly query?: string;
    readonly value?: string;
}
export interface ComboboxItemSharedProps {
    readonly keywords?: readonly string[];
    readonly textValue?: string;
    readonly value: string;
}
export declare function matchesComboboxQuery(query: string, value: string, keywords?: readonly string[]): boolean;
export declare function useComboboxController({ defaultOpen, defaultQuery, defaultValue, onOpenChange, onQueryChange, onValueChange, open, placeholder, query, value, }: ComboboxSharedProps): ComboboxContextValue;
export declare function ComboboxProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: ComboboxContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<ComboboxContextValue | null>>;
export declare function useComboboxContext(): ComboboxContextValue;
export {};
//# sourceMappingURL=combobox.shared.d.ts.map