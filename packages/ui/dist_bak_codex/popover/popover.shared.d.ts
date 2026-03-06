import * as React from "react";
interface PopoverContextValue {
    readonly open: boolean;
    readonly setOpen: (open: boolean) => void;
}
export interface PopoverSharedProps {
    readonly defaultOpen?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
    readonly open?: boolean;
}
export declare function usePopoverController({ defaultOpen, onOpenChange, open, }: PopoverSharedProps): PopoverContextValue;
export declare function PopoverProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: PopoverContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<PopoverContextValue | null>>;
export declare function usePopoverContext(): PopoverContextValue;
export {};
//# sourceMappingURL=popover.shared.d.ts.map