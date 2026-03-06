import * as React from "react";
export interface CarouselSharedProps {
    readonly children: React.ReactNode;
}
interface CarouselContextValue {
    readonly canScrollNext: boolean;
    readonly canScrollPrevious: boolean;
    readonly goTo: (index: number) => void;
    readonly index: number;
    readonly itemCount: number;
    readonly setItemCount: (count: number) => void;
}
export declare function CarouselProvider({ children, value, }: {
    readonly children: React.ReactNode;
    readonly value: CarouselContextValue;
}): import("react/jsx-runtime").JSX.Element;
export declare function useCarouselContext(): CarouselContextValue;
export {};
//# sourceMappingURL=carousel.shared.d.ts.map