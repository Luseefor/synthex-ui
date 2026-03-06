import * as React from "react";
interface TooltipContextValue {
    readonly open: boolean;
    readonly setOpen: (open: boolean) => void;
}
export interface TooltipSharedProps {
    readonly defaultOpen?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
    readonly open?: boolean;
}
export declare function useTooltipController({ defaultOpen, onOpenChange, open, }: TooltipSharedProps): TooltipContextValue;
export declare function TooltipProvider({ children, value, }: React.PropsWithChildren<{
    readonly value: TooltipContextValue;
}>): React.FunctionComponentElement<React.ProviderProps<TooltipContextValue | null>>;
export declare function useTooltipContext(): TooltipContextValue;
export {};
//# sourceMappingURL=tooltip.shared.d.ts.map