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
