import * as React from "react";
import { type ViewProps } from "react-native";
import { Button } from "../button/button.native";
import { type CarouselSharedProps } from "./carousel.shared";
export interface CarouselProps extends Omit<ViewProps, "children">, CarouselSharedProps {
}
export declare function Carousel({ children, ...props }: CarouselProps): import("react/jsx-runtime").JSX.Element;
export interface CarouselContentProps extends Omit<ViewProps, "children"> {
    readonly children: React.ReactNode;
}
export declare function CarouselContent({ children, ...props }: CarouselContentProps): import("react/jsx-runtime").JSX.Element;
export interface CarouselItemProps extends ViewProps {
}
export declare function CarouselItem(props: CarouselItemProps): import("react/jsx-runtime").JSX.Element;
export interface CarouselPreviousProps extends React.ComponentPropsWithoutRef<typeof Button> {
}
export declare function CarouselPrevious(props: CarouselPreviousProps): import("react/jsx-runtime").JSX.Element;
export interface CarouselNextProps extends React.ComponentPropsWithoutRef<typeof Button> {
}
export declare function CarouselNext(props: CarouselNextProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=carousel.native.d.ts.map