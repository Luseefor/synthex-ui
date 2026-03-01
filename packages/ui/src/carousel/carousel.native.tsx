import * as React from "react";
import { View, type ViewProps } from "react-native";
import { Button } from "../button/button.native";
import {
  CarouselProvider,
  useCarouselContext,
  type CarouselSharedProps,
} from "./carousel.shared";

export interface CarouselProps extends Omit<ViewProps, "children">, CarouselSharedProps {}
export function Carousel({ children, ...props }: CarouselProps) {
  const [index, setIndex] = React.useState(0);
  const [itemCount, setItemCount] = React.useState(0);

  const value = React.useMemo(
    () => ({
      canScrollNext: index < itemCount - 1,
      canScrollPrevious: index > 0,
      goTo(nextIndex: number) {
        setIndex(Math.max(0, Math.min(nextIndex, itemCount - 1)));
      },
      index,
      itemCount,
      setItemCount,
    }),
    [index, itemCount],
  );

  return (
    <CarouselProvider value={value}>
      <View style={{ gap: 16 }} {...props}>
        {children}
      </View>
    </CarouselProvider>
  );
}

export interface CarouselContentProps extends Omit<ViewProps, "children"> {
  readonly children: React.ReactNode;
}
export function CarouselContent({ children, ...props }: CarouselContentProps) {
  const context = useCarouselContext();
  const items = React.Children.toArray(children).filter(React.isValidElement);

  React.useEffect(() => {
    context.setItemCount(items.length);
  }, [context, items.length]);

  return <View {...props}>{items[context.index] ?? null}</View>;
}

export interface CarouselItemProps extends ViewProps {}
export function CarouselItem(props: CarouselItemProps) {
  return <View {...props} />;
}

export interface CarouselPreviousProps extends React.ComponentPropsWithoutRef<typeof Button> {}
export function CarouselPrevious(props: CarouselPreviousProps) {
  const context = useCarouselContext();
  return <Button size="sm" variant="outline" disabled={!context.canScrollPrevious} onPress={() => context.goTo(context.index - 1)} {...props} />;
}

export interface CarouselNextProps extends React.ComponentPropsWithoutRef<typeof Button> {}
export function CarouselNext(props: CarouselNextProps) {
  const context = useCarouselContext();
  return <Button size="sm" variant="outline" disabled={!context.canScrollNext} onPress={() => context.goTo(context.index + 1)} {...props} />;
}
