import * as React from "react";
interface DialogContextValue {
    readonly open: boolean;
    readonly setOpen: (open: boolean) => void;
}
export interface DialogSharedProps {
    readonly defaultOpen?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
    readonly open?: boolean;
}
export declare function useDialogController({ defaultOpen, onOpenChange, open, }: DialogSharedProps): DialogContextValue;
export declare function DialogProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: DialogContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<DialogContextValue | null>>;
export declare function useDialogContext(): DialogContextValue;
export {};
//# sourceMappingURL=dialog.shared.d.ts.map