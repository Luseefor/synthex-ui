import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { View } from "react-native";
import { Button } from "../button/button.native";
import { CarouselProvider, useCarouselContext, } from "./carousel.shared";
export function Carousel({ children, ...props }) {
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
    return (_jsx(CarouselProvider, { value: value, children: _jsx(View, { style: { gap: 16 }, ...props, children: children }) }));
}
export function CarouselContent({ children, ...props }) {
    const context = useCarouselContext();
    const items = React.Children.toArray(children).filter(React.isValidElement);
    React.useEffect(() => {
        context.setItemCount(items.length);
    }, [context, items.length]);
    return _jsx(View, { ...props, children: items[context.index] ?? null });
}
export function CarouselItem(props) {
    return _jsx(View, { ...props });
}
export function CarouselPrevious(props) {
    const context = useCarouselContext();
    return _jsx(Button, { size: "sm", variant: "outline", disabled: !context.canScrollPrevious, onPress: () => context.goTo(context.index - 1), ...props });
}
export function CarouselNext(props) {
    const context = useCarouselContext();
    return _jsx(Button, { size: "sm", variant: "outline", disabled: !context.canScrollNext, onPress: () => context.goTo(context.index + 1), ...props });
}
