import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "../_shared/variants";
import { Button } from "../button/button.web";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.web";
import { CarouselProvider, useCarouselContext, } from "./carousel.shared";
export function Carousel({ children, className, ...props }) {
    const [index, setIndex] = React.useState(0);
    const [itemCount, setItemCount] = React.useState(0);
    const value = React.useMemo(() => ({
        canScrollNext: index < itemCount - 1,
        canScrollPrevious: index > 0,
        goTo(nextIndex) {
            setIndex(Math.max(0, Math.min(nextIndex, itemCount - 1)));
        },
        index,
        itemCount,
        setItemCount,
    }), [index, itemCount]);
    return (_jsx(CarouselProvider, { value: value, children: _jsx("div", { className: cn("grid gap-4", className), ...props, children: children }) }));
}
export function CarouselContent({ children, className, ...props }) {
    const context = useCarouselContext();
    const items = React.Children.toArray(children).filter(React.isValidElement);
    React.useEffect(() => {
        context.setItemCount(items.length);
    }, [context, items.length]);
    return (_jsx("div", { className: "overflow-hidden", children: _jsx("div", { className: cn("flex transition-transform duration-200 ease-out", className), style: { transform: `translateX(-${context.index * 100}%)` }, ...props, children: items }) }));
}
export function CarouselItem({ className, ...props }) {
    return _jsx("div", { className: cn("min-w-0 shrink-0 basis-full", className), ...props });
}
export function CarouselPrevious({ children, onClick, ...props }) {
    const context = useCarouselContext();
    return (_jsx(Button, { type: "button", size: "icon", variant: "outline", "aria-label": "Previous slide", disabled: !context.canScrollPrevious, onClick: (event) => {
            context.goTo(context.index - 1);
            onClick?.(event);
        }, ...props, children: children ?? _jsx(ChevronLeftIcon, { size: 16 }) }));
}
export function CarouselNext({ children, onClick, ...props }) {
    const context = useCarouselContext();
    return (_jsx(Button, { type: "button", size: "icon", variant: "outline", "aria-label": "Next slide", disabled: !context.canScrollNext, onClick: (event) => {
            context.goTo(context.index + 1);
            onClick?.(event);
        }, ...props, children: children ?? _jsx(ChevronRightIcon, { size: 16 }) }));
}
