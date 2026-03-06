import * as React from "react";
import { type HoverCardSharedProps } from "./hover-card.shared";
export interface HoverCardProps extends React.HTMLAttributes<HTMLDivElement>, HoverCardSharedProps {
    readonly children?: React.ReactNode;
}
export declare function HoverCard({ children, className, closeDelay, defaultOpen, onOpenChange, open, openDelay, ...props }: HoverCardProps): import("react/jsx-runtime").JSX.Element;
export declare const HoverCardTrigger: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & {
    asChild?: boolean;
} & React.RefAttributes<HTMLSpanElement>>;
export declare const HoverCardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=hover-card.web.d.ts.map