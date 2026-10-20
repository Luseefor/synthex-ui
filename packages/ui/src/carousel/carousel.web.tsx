import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "../_shared/variants";
import { Button } from "../button/button.web";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.web";
import {
  CarouselProvider,
  useCarouselContext,
  type CarouselSharedProps,
} from "./carousel.shared";

export interface CarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    CarouselSharedProps {}

export function Carousel({
  children,
  className,
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  ...props
}: CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
    plugins,
  );
  const [canScrollPrevious, setCanScrollPrevious] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [itemCount, setItemCount] = React.useState(0);

  const handleSelect = React.useCallback(() => {
    if (!api) return;
    setCanScrollPrevious(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setIndex(api.selectedScrollSnap());
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    handleSelect();
    api.on("reInit", handleSelect);
    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api, handleSelect]);

  React.useEffect(() => {
    setApi?.(api);
  }, [api, setApi]);

  const scrollPrevious = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const goTo = React.useCallback(
    (nextIndex: number) => {
      if (api) {
        api.scrollTo(Math.max(0, Math.min(nextIndex, (api.scrollSnapList().length || 1) - 1)));
        return;
      }
      setIndex(Math.max(0, Math.min(nextIndex, itemCount - 1)));
    },
    [api, itemCount],
  );

  const value = React.useMemo(
    () => ({
      carouselRef,
      api,
      canScrollNext: api ? canScrollNext : index < itemCount - 1,
      canScrollPrevious: api ? canScrollPrevious : index > 0,
      goTo,
      scrollNext,
      scrollPrevious,
      index,
      itemCount,
      setItemCount,
      orientation,
    }),
    [carouselRef, api, canScrollNext, canScrollPrevious, goTo, scrollNext, scrollPrevious, index, itemCount, orientation],
  );

  return (
    <CarouselProvider value={value}>
      <div data-slot="carousel" role="region" aria-roledescription="carousel" className={cn("relative", className)} {...props}>
        {children}
      </div>
    </CarouselProvider>
  );
}

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CarouselContent({ children, className, ...props }: CarouselContentProps) {
  const context = useCarouselContext();
  const items = React.Children.toArray(children).filter(React.isValidElement);

  React.useEffect(() => {
    context.setItemCount(items.length);
  }, [context, items.length]);

  return (
    <div data-slot="carousel-content" ref={context.carouselRef} className="overflow-hidden">
      <div
        data-slot="carousel-track"
        className={cn(
          "flex",
          context.orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CarouselItem({ className, ...props }: CarouselItemProps) {
  const context = useCarouselContext();
  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        context.orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

export interface CarouselPreviousProps extends React.ComponentPropsWithoutRef<typeof Button> {}
export function CarouselPrevious({ children, className, onClick, ...props }: CarouselPreviousProps) {
  const context = useCarouselContext();

  return (
    <Button
      type="button"
      data-slot="carousel-previous"
      size="icon"
      variant="outline"
      aria-label="Previous slide"
      disabled={!context.canScrollPrevious}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        context.orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      onClick={(event) => {
        if (context.api) {
          context.scrollPrevious();
        } else {
          context.goTo(context.index - 1);
        }
        onClick?.(event);
      }}
      {...props}
    >
      {children ?? <ChevronLeftIcon size={16} />}
    </Button>
  );
}

export interface CarouselNextProps extends React.ComponentPropsWithoutRef<typeof Button> {}
export function CarouselNext({ children, className, onClick, ...props }: CarouselNextProps) {
  const context = useCarouselContext();

  return (
    <Button
      type="button"
      data-slot="carousel-next"
      size="icon"
      variant="outline"
      aria-label="Next slide"
      disabled={!context.canScrollNext}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        context.orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      onClick={(event) => {
        if (context.api) {
          context.scrollNext();
        } else {
          context.goTo(context.index + 1);
        }
        onClick?.(event);
      }}
      {...props}
    >
      {children ?? <ChevronRightIcon size={16} />}
    </Button>
  );
}
