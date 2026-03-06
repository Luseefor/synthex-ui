import * as React from "react";
import { Button } from "../button/button.web";
import { type CarouselSharedProps } from "./carousel.shared";
export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, CarouselSharedProps {
}
export declare function Carousel({ children, className, ...props }: CarouselProps): import("react/jsx-runtime").JSX.Element;
export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function CarouselContent({ children, className, ...props }: CarouselContentProps): import("react/jsx-runtime").JSX.Element;
export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
}
export declare function CarouselItem({ className, ...props }: CarouselItemProps): import("react/jsx-runtime").JSX.Element;
export interface CarouselPreviousProps extends React.ComponentPropsWithoutRef<typeof Button> {
}
export declare function CarouselPrevious({ children, onClick, ...props }: CarouselPreviousProps): import("react/jsx-runtime").JSX.Element;
export interface CarouselNextProps extends React.ComponentPropsWithoutRef<typeof Button> {
}
export declare function CarouselNext({ children, onClick, ...props }: CarouselNextProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=carousel.web.d.ts.map