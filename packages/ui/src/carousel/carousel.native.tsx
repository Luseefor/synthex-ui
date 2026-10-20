import * as React from "react";
import { View, type ViewProps } from "react-native";
import { Button } from "../button/button.native";
import {
  CarouselProvider,
  useCarouselContext,
  type CarouselSharedProps,
} from "./carousel.shared";

export interface CarouselProps extends Omit<ViewProps, "children">, CarouselSharedProps {}
export function Carousel({ children, orientation: _orientation, opts: _opts, plugins: _plugins, setApi: _setApi, testID, ...props }: CarouselProps) {
  void _orientation;
  void _opts;
  void _plugins;
  void _setApi;
  const [index, setIndex] = React.useState(0);
  const [itemCount, setItemCount] = React.useState(0);

  const value = React.useMemo(
    () => ({
      carouselRef: (() => {}) as never,
      api: undefined,
      canScrollNext: index < itemCount - 1,
      canScrollPrevious: index > 0,
      goTo(nextIndex: number) {
        setIndex(Math.max(0, Math.min(nextIndex, itemCount - 1)));
      },
      scrollNext() {
        setIndex((current) => Math.max(0, Math.min(current + 1, itemCount - 1)));
      },
      scrollPrevious() {
        setIndex((current) => Math.max(0, Math.min(current - 1, itemCount - 1)));
      },
      index,
      itemCount,
      setItemCount,
      orientation: "horizontal" as const,
    }),
    [index, itemCount],
  );

  return (
    <CarouselProvider value={value}>
      {/* testID mirrors web `data-slot="carousel"` for parity. */}
      <View testID={testID ?? "carousel"} style={{ gap: 16 }} {...props}>
        {children}
      </View>
    </CarouselProvider>
  );
}

export interface CarouselContentProps extends Omit<ViewProps, "children"> {
  readonly children: React.ReactNode;
}
export function CarouselContent({ children, testID, ...props }: CarouselContentProps) {
  const context = useCarouselContext();
  const items = React.Children.toArray(children).filter(React.isValidElement);

  React.useEffect(() => {
    context.setItemCount(items.length);
  }, [context, items.length]);

  // testID mirrors web `data-slot="carousel-content"`.
  return <View testID={testID ?? "carousel-content"} {...props}>{items[context.index] ?? null}</View>;
}

export interface CarouselItemProps extends ViewProps {}
export function CarouselItem({ testID, ...props }: CarouselItemProps) {
  // testID mirrors web `data-slot="carousel-item"`.
  return <View testID={testID ?? "carousel-item"} {...props} />;
}

export interface CarouselPreviousProps extends React.ComponentPropsWithoutRef<typeof Button> {}
export function CarouselPrevious({ testID, ...props }: CarouselPreviousProps) {
  const context = useCarouselContext();
  // testID mirrors web `data-slot="carousel-previous"`.
  return <Button size="sm" variant="outline" testID={testID ?? "carousel-previous"} disabled={!context.canScrollPrevious} onPress={() => context.goTo(context.index - 1)} {...props} />;
}

export interface CarouselNextProps extends React.ComponentPropsWithoutRef<typeof Button> {}
export function CarouselNext({ testID, ...props }: CarouselNextProps) {
  const context = useCarouselContext();
  // testID mirrors web `data-slot="carousel-next"`.
  return <Button size="sm" variant="outline" testID={testID ?? "carousel-next"} disabled={!context.canScrollNext} onPress={() => context.goTo(context.index + 1)} {...props} />;
}
