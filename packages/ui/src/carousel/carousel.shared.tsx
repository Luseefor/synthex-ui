import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";

export type CarouselApi = NonNullable<ReturnType<typeof useEmblaCarousel>[1]> | undefined;
export type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;
export type CarouselPlugin = NonNullable<Parameters<typeof useEmblaCarousel>[1]>[number];

export interface CarouselSharedProps {
  readonly children: React.ReactNode;
  readonly orientation?: "horizontal" | "vertical";
  readonly opts?: CarouselOptions;
  readonly plugins?: CarouselPlugin[];
  readonly setApi?: (api: CarouselApi) => void;
}

interface CarouselContextValue {
  readonly carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  readonly api: CarouselApi;
  readonly canScrollNext: boolean;
  readonly canScrollPrevious: boolean;
  readonly goTo: (index: number) => void;
  readonly scrollNext: () => void;
  readonly scrollPrevious: () => void;
  readonly index: number;
  readonly itemCount: number;
  readonly setItemCount: (count: number) => void;
  readonly orientation: "horizontal" | "vertical";
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

export function CarouselProvider({
  children,
  value,
}: {
  readonly children: React.ReactNode;
  readonly value: CarouselContextValue;
}) {
  return <CarouselContext.Provider value={value}>{children}</CarouselContext.Provider>;
}

export function useCarouselContext() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("Carousel components must be used within <Carousel>.");
  }

  return context;
}
