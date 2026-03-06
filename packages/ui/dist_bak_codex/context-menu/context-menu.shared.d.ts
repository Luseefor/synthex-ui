import * as React from "react";
interface ContextMenuPosition {
    readonly x: number;
    readonly y: number;
}
interface ContextMenuContextValue {
    readonly open: boolean;
    readonly position: ContextMenuPosition;
    readonly setOpen: (open: boolean) => void;
    readonly setPosition: (position: ContextMenuPosition) => void;
}
export interface ContextMenuSharedProps {
    readonly defaultOpen?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
    readonly open?: boolean;
}
export declare function useContextMenuController({ defaultOpen, onOpenChange, open, }: ContextMenuSharedProps): ContextMenuContextValue;
export declare function ContextMenuProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: ContextMenuContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<ContextMenuContextValue | null>>;
export declare function useContextMenuContext(): ContextMenuContextValue;
export {};
//# sourceMappingURL=context-menu.shared.d.ts.map