import * as React from "react";
interface TabsContextValue {
    readonly value: string;
    readonly setValue: (value: string) => void;
}
export interface TabsSharedProps {
    readonly defaultValue?: string;
    readonly value?: string;
    readonly onValueChange?: (value: string) => void;
}
export interface TabsTriggerSharedProps {
    readonly value: string;
}
export interface TabsContentSharedProps {
    readonly forceMount?: boolean;
    readonly value: string;
}
export declare function useTabsController({ defaultValue, onValueChange, value, }: Pick<TabsSharedProps, "defaultValue" | "onValueChange" | "value">): TabsContextValue;
export declare function TabsProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: TabsContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<TabsContextValue | null>>;
export declare function useTabsContext(): TabsContextValue;
export {};
//# sourceMappingURL=tabs.shared.d.ts.map