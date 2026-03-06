import * as React from "react";
import { type BoxStyleProps, type DimensionValue, type SpaceValue, type SurfaceStyleProps, type TextStyleProps } from "./shared";
export interface BoxProps extends React.HTMLAttributes<HTMLElement>, BoxStyleProps {
    readonly as?: React.ElementType;
}
export declare const Box: React.ForwardRefExoticComponent<BoxProps & React.RefAttributes<HTMLElement>>;
export interface TextProps extends React.HTMLAttributes<HTMLElement>, TextStyleProps {
    readonly as?: React.ElementType;
}
export declare const Text: React.ForwardRefExoticComponent<TextProps & React.RefAttributes<HTMLElement>>;
export interface StackProps extends Omit<BoxProps, "as" | "direction"> {
}
export declare const Stack: React.ForwardRefExoticComponent<StackProps & React.RefAttributes<HTMLDivElement>>;
export interface InlineProps extends Omit<BoxProps, "as" | "direction"> {
}
export declare const Inline: React.ForwardRefExoticComponent<InlineProps & React.RefAttributes<HTMLDivElement>>;
export interface GridProps extends Omit<BoxProps, "as" | "direction" | "wrap"> {
    readonly columns?: number;
    readonly minItemWidth?: DimensionValue;
}
export declare const Grid: React.ForwardRefExoticComponent<GridProps & React.RefAttributes<HTMLDivElement>>;
export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement>, SurfaceStyleProps {
}
export declare const Surface: React.ForwardRefExoticComponent<SurfaceProps & React.RefAttributes<HTMLDivElement>>;
export interface PressablePrimitiveProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, BoxStyleProps {
}
export declare const PressablePrimitive: React.ForwardRefExoticComponent<PressablePrimitiveProps & React.RefAttributes<HTMLButtonElement>>;
export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement>, Omit<BoxStyleProps, "direction" | "wrap"> {
    readonly scrollbar?: "visible" | "hidden";
    readonly viewportStyle?: React.CSSProperties;
    readonly contentStyle?: React.CSSProperties;
}
export declare const ScrollArea: React.ForwardRefExoticComponent<ScrollAreaProps & React.RefAttributes<HTMLDivElement>>;
export interface SpacedProps {
    readonly gap?: SpaceValue;
}
export declare function useResolvedGap(gap?: SpaceValue): number | undefined;
//# sourceMappingURL=index.web.d.ts.map