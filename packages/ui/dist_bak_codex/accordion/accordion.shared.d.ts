import * as React from "react";
type AccordionType = "single" | "multiple";
interface AccordionContextValue {
    readonly isItemOpen: (value: string) => boolean;
    readonly toggleItem: (value: string) => void;
}
interface AccordionItemContextValue {
    readonly value: string;
}
export interface AccordionSharedProps {
    readonly collapsible?: boolean;
    readonly defaultValue?: string | readonly string[];
    readonly onValueChange?: (value: string | readonly string[]) => void;
    readonly type?: AccordionType;
    readonly value?: string | readonly string[];
}
export interface AccordionItemSharedProps {
    readonly value: string;
}
export declare function useAccordionController({ collapsible, defaultValue, onValueChange, type, value, }: AccordionSharedProps): AccordionContextValue;
export declare function AccordionProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: AccordionContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<AccordionContextValue | null>>;
export declare function AccordionItemProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: AccordionItemContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<AccordionItemContextValue | null>>;
export declare function useAccordionContext(): AccordionContextValue;
export declare function useAccordionItemContext(): AccordionItemContextValue;
export {};
//# sourceMappingURL=accordion.shared.d.ts.map