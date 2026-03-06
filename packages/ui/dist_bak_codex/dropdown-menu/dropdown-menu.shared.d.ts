import * as React from "react";
interface DropdownMenuContextValue {
    readonly open: boolean;
    readonly setOpen: (open: boolean) => void;
}
export interface DropdownMenuSharedProps {
    readonly defaultOpen?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
    readonly open?: boolean;
}
export declare function useDropdownMenuController({ defaultOpen, onOpenChange, open, }: DropdownMenuSharedProps): DropdownMenuContextValue;
export declare function DropdownMenuProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: DropdownMenuContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<DropdownMenuContextValue | null>>;
export declare function useDropdownMenuContext(): DropdownMenuContextValue;
export {};
//# sourceMappingURL=dropdown-menu.shared.d.ts.map