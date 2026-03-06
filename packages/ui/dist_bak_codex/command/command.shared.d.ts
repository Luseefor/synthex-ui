import * as React from "react";
interface CommandContextValue {
    readonly query: string;
    readonly setQuery: (query: string) => void;
    readonly setItemVisibility: (id: string, visible: boolean) => void;
    readonly unregisterItem: (id: string) => void;
    readonly visibleItemCount: number;
}
export interface CommandSharedProps {
    readonly defaultQuery?: string;
    readonly onQueryChange?: (query: string) => void;
    readonly query?: string;
    readonly shouldFilter?: boolean;
}
export interface CommandItemSharedProps {
    readonly keywords?: readonly string[];
    readonly textValue?: string;
    readonly value?: string;
}
export declare function normalizeSearchValue(value: string): string;
export declare function matchesCommandQuery(query: string, value: string, keywords?: readonly string[]): boolean;
export declare function useCommandController({ defaultQuery, onQueryChange, query, shouldFilter, }: CommandSharedProps): CommandContextValue;
export declare function CommandProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: CommandContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<CommandContextValue | null>>;
export declare function useCommandContext(): CommandContextValue;
export {};
//# sourceMappingURL=command.shared.d.ts.map