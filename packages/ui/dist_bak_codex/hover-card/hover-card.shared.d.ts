import * as React from "react";
export interface HoverCardSharedProps {
    readonly closeDelay?: number;
    readonly defaultOpen?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
    readonly open?: boolean;
    readonly openDelay?: number;
}
interface HoverCardContextValue {
    readonly open: boolean;
    readonly setOpen: (open: boolean) => void;
    readonly closeDelay: number;
    readonly openDelay: number;
}
export declare function useHoverCardController(props: HoverCardSharedProps): HoverCardContextValue;
export declare function HoverCardProvider({ children, value }: {
    readonly children: React.ReactNode;
    readonly value: HoverCardContextValue;
}): import("react/jsx-runtime").JSX.Element;
export declare function useHoverCardContext(): HoverCardContextValue;
export {};
//# sourceMappingURL=hover-card.shared.d.ts.map