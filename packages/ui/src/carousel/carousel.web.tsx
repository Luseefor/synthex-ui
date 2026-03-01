import * as React from "react";
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

export function Carousel({ children, className, ...props }: CarouselProps) {
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
      <div className={cn("grid gap-4", className)} {...props}>
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
    <div className="overflow-hidden">
      <div
        className={cn("flex transition-transform duration-200 ease-out", className)}
        style={{ transform: `translateX(-${context.index * 100}%)` }}
        {...props}
      >
        {items}
      </div>
    </div>
  );
}

export interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {}
export function CarouselItem({ className, ...props }: CarouselItemProps) {
  return <div className={cn("min-w-0 shrink-0 basis-full", className)} {...props} />;
}

export interface CarouselPreviousProps extends React.ComponentPropsWithoutRef<typeof Button> {}
export function CarouselPrevious({ children, onClick, ...props }: CarouselPreviousProps) {
  const context = useCarouselContext();

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label="Previous slide"
      disabled={!context.canScrollPrevious}
      onClick={(event) => {
        context.goTo(context.index - 1);
        onClick?.(event);
      }}
      {...props}
    >
      {children ?? <ChevronLeftIcon size={16} />}
    </Button>
  );
}

export interface CarouselNextProps extends React.ComponentPropsWithoutRef<typeof Button> {}
export function CarouselNext({ children, onClick, ...props }: CarouselNextProps) {
  const context = useCarouselContext();

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label="Next slide"
      disabled={!context.canScrollNext}
      onClick={(event) => {
        context.goTo(context.index + 1);
        onClick?.(event);
      }}
      {...props}
    >
      {children ?? <ChevronRightIcon size={16} />}
    </Button>
  );
}
