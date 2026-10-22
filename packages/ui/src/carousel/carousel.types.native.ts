import type * as React from "react";

export interface NativeCarouselOptions {
  readonly startIndex?: number;
  readonly loop?: false;
}

export type NativeCarouselEvent = "select" | "reInit";
export type NativeCarouselListener = (api: NativeCarouselApi, event: NativeCarouselEvent) => void;

/** The native pager API. Embla's DOM engine and plugins are web-only. */
export interface NativeCarouselApi {
  scrollTo(index: number, jump?: boolean): void;
  scrollNext(jump?: boolean): void;
  scrollPrev(jump?: boolean): void;
  selectedScrollSnap(): number;
  scrollSnapList(): number[];
  canScrollNext(): boolean;
  canScrollPrev(): boolean;
  on(event: NativeCarouselEvent, listener: NativeCarouselListener): NativeCarouselApi;
  off(event: NativeCarouselEvent, listener: NativeCarouselListener): NativeCarouselApi;
}

export type CarouselApi = NativeCarouselApi | undefined;
export type CarouselOptions = NativeCarouselOptions;
export type CarouselPlugin = never;

export interface CarouselSharedProps {
  readonly children: React.ReactNode;
  readonly orientation?: "horizontal" | "vertical";
  readonly opts?: NativeCarouselOptions;
  readonly plugins?: readonly never[];
  readonly setApi?: (api: CarouselApi) => void;
  readonly dir?: "ltr" | "rtl";
  readonly disabled?: boolean;
  readonly index?: number;
  readonly defaultIndex?: number;
  readonly onIndexChange?: (index: number) => void;
  readonly animated?: boolean;
}
