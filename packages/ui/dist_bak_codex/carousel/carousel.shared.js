import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
const CarouselContext = React.createContext(null);
export function CarouselProvider({ children, value, }) {
    return _jsx(CarouselContext.Provider, { value: value, children: children });
}
export function useCarouselContext() {
    const context = React.useContext(CarouselContext);
    if (!context) {
        throw new Error("Carousel components must be used within <Carousel>.");
    }
    return context;
}
