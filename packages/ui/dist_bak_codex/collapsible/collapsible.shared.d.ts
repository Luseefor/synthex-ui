import * as React from "react";
export interface CollapsibleSharedProps {
    readonly defaultOpen?: boolean;
    readonly disabled?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
    readonly open?: boolean;
}
interface CollapsibleContextValue {
    readonly disabled: boolean;
    readonly open: boolean;
    readonly setOpen: (open: boolean) => void;
}
export declare function useCollapsibleController(props: CollapsibleSharedProps): CollapsibleContextValue;
export declare function CollapsibleProvider({ children, value, }: {
    readonly children: React.ReactNode;
    readonly value: CollapsibleContextValue;
}): import("react/jsx-runtime").JSX.Element;
export declare function useCollapsibleContext(): CollapsibleContextValue;
export {};
//# sourceMappingURL=collapsible.shared.d.ts.map