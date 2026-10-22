import * as React from "react";
import {
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type ViewProps,
} from "react-native";
import { Button, type ButtonProps } from "../button/button.native";
import { NativeDirectionContext } from "../_shared/direction-context.native";
import { useReducedMotion } from "../hooks/useReducedMotion.native";
import type {
  CarouselSharedProps,
  NativeCarouselApi,
  NativeCarouselEvent,
  NativeCarouselListener,
} from "./carousel.types.native";
import {
  carouselIndexForOffset,
  carouselOffsetForIndex,
  normalizeCarouselIndex,
} from "./carousel.math";

export interface CarouselProps
  extends Omit<ViewProps, "children">,
    CarouselSharedProps {}

export interface CarouselContentProps extends ScrollViewProps {}

export interface CarouselItemProps extends ViewProps {}

export interface CarouselPreviousProps extends ButtonProps {}
export interface CarouselNextProps extends ButtonProps {}

function setHostRef<T>(
  ref: React.Ref<T> | undefined,
  node: T | null,
): void | (() => void) {
  if (typeof ref === "function") {
    const cleanup = ref(node);
    if (typeof cleanup === "function") {
      return cleanup;
    }
    return () => {
      (ref as (value: T | null) => void)(null);
    };
  }
  if (ref !== null && ref !== undefined && typeof ref === "object" && "current" in ref) {
    const objectRef = ref as { current: T | null };
    objectRef.current = node;
    return () => {
      objectRef.current = null;
    };
  }
  return undefined;
}

function validateNativeCarouselProps(
  opts: CarouselSharedProps["opts"],
  plugins: CarouselSharedProps["plugins"],
): void {
  if (opts !== undefined && opts !== null) {
    const allowed = new Set(["startIndex", "loop"]);
    for (const key of Object.keys(opts as Record<string, unknown>)) {
      if (!allowed.has(key)) {
        throw new Error(
          `Carousel (native): unsupported opts key "${key}". Only startIndex and loop:false are supported.`,
        );
      }
    }
    const loop = (opts as { loop?: unknown }).loop;
    if (loop !== undefined && loop !== false) {
      throw new Error(
        "Carousel (native): loop is not supported on native; only loop:false is allowed.",
      );
    }
  }
  if (plugins !== undefined && plugins !== null && plugins.length > 0) {
    throw new Error(
      "Carousel (native): plugins are not supported on native (Embla plugins are web-only).",
    );
  }
}

function flattenCarouselItems(children: React.ReactNode): React.ReactElement[] {
  const out: React.ReactElement[] = [];
  const walk = (nodes: React.ReactNode, prefix: string): void => {
    // toArray scopes nested array keys; include Fragment ancestors as well.
    React.Children.toArray(nodes).forEach((child) => {
      if (!React.isValidElement(child)) return;
      const key = `${prefix}/${child.key}`;
      if (child.type === React.Fragment) {
        walk((child.props as { children?: React.ReactNode }).children, key);
      } else {
        out.push(React.cloneElement(child, { key }));
      }
    });
  };
  walk(children, "");
  return out;
}

interface NativeCarouselContextValue {
  readonly orientation: "horizontal" | "vertical";
  readonly effectiveDir: "ltr" | "rtl";
  readonly reversed: boolean;
  readonly disabled: boolean;
  readonly index: number;
  readonly itemCount: number;
  readonly extent: number | null;
  readonly canScrollNext: boolean;
  readonly canScrollPrev: boolean;
  readonly requestApiSelect: (next: number, jump?: boolean) => void;
  readonly registerItems: (keys: readonly string[]) => void;
  readonly scrollNodeRef: React.MutableRefObject<React.ElementRef<typeof ScrollView> | null>;
  readonly onViewportLayout: (event: LayoutChangeEvent) => void;
  readonly onContentSize: (width: number, height: number) => void;
  readonly onGestureBegin: () => void;
  readonly onGestureEndDrag: (offset: number, velocity?: number, target?: number) => void;
  readonly onGestureMomentumEnd: (offset: number) => void;
}

const NativeCarouselContext = React.createContext<NativeCarouselContextValue | null>(null);

function useNativeCarouselContext(): NativeCarouselContextValue {
  const context = React.useContext(NativeCarouselContext);
  if (!context) {
    throw new Error("Carousel components must be used within <Carousel>.");
  }
  return context;
}

export const Carousel: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CarouselProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, CarouselProps>(
  (
    {
      children,
      orientation = "horizontal",
      opts,
      plugins,
      setApi,
      dir: dirProp,
      disabled = false,
      index: indexProp,
      defaultIndex,
      onIndexChange,
      animated = true,
      testID,
      style,
      onLayout: callerOnLayout,
      ...viewProps
    },
    ref,
  ) => {
    validateNativeCarouselProps(opts, plugins);

    const inherited = React.useContext(NativeDirectionContext);
    const effectiveDir = (dirProp ?? inherited?.dir ?? "ltr") === "rtl" ? "rtl" : "ltr";
    const isVertical = orientation === "vertical";
    const reversed = !isVertical && effectiveDir === "rtl";
    const reducedMotion = useReducedMotion();
    const shouldAnimate = animated && !reducedMotion;

    const isControlled = indexProp !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState<number>(() => {
      if (defaultIndex !== undefined) {
        return defaultIndex;
      }
      if (opts?.startIndex !== undefined) {
        return opts.startIndex;
      }
      return 0;
    });
    const [itemKeys, setItemKeys] = React.useState<readonly string[]>([]);
    const itemCount = itemKeys.length;
    const [extent, setExtent] = React.useState<number | null>(null);
    const [contentReady, setContentReady] = React.useState(false);
    const viewportRef = React.useRef<{ width: number; height: number } | null>(null);

    const rawIndex = isControlled ? (indexProp as number) : uncontrolled;
    const resolvedIndex = normalizeCarouselIndex(rawIndex, itemCount);
    const canScrollNext = itemCount > 1 && resolvedIndex < itemCount - 1;
    const canScrollPrev = itemCount > 1 && resolvedIndex > 0;

    type ViewHost = React.ElementRef<typeof View>;
    const setRootRef = React.useCallback(
      (node: ViewHost | null) => setHostRef(ref, node),
      [ref],
    );

    const indexRef = React.useRef(resolvedIndex);
    const countRef = React.useRef(itemCount);
    const extentRef = React.useRef<number | null>(extent);
    const contentReadyRef = React.useRef(contentReady);
    const disabledRef = React.useRef(disabled);
    const orientationRef = React.useRef(orientation);
    const reversedRef = React.useRef(reversed);
    const shouldAnimateRef = React.useRef(shouldAnimate);
    const isControlledRef = React.useRef(isControlled);
    const onIndexChangeRef = React.useRef(onIndexChange);
    indexRef.current = resolvedIndex;
    countRef.current = itemCount;
    disabledRef.current = disabled;
    orientationRef.current = orientation;
    reversedRef.current = reversed;
    shouldAnimateRef.current = shouldAnimate;
    isControlledRef.current = isControlled;
    onIndexChangeRef.current = onIndexChange;

    const gestureActiveRef = React.useRef(false);
    const pendingSelectionRef = React.useRef<{ index: number; jump: boolean } | null>(null);
    const mountedRef = React.useRef(true);
    const listenersRef = React.useRef(new Map<NativeCarouselEvent, Set<NativeCarouselListener>>());
    const scrollNodeRef = React.useRef<React.ElementRef<typeof ScrollView> | null>(null);
    const apiRef = React.useRef<NativeCarouselApi | null>(null);
    const prevCountRef = React.useRef(itemCount);
    const prevOrientationRef = React.useRef(orientation);
    const prevDirRef = React.useRef(effectiveDir);
    const prevKeysRef = React.useRef(itemKeys);
    const prevExtentRef = React.useRef(extent);
    const prevControlledRef = React.useRef(isControlled);
    const prevResolvedRef = React.useRef(resolvedIndex);
    const firstEffectRef = React.useRef(true);

    const emitEvent = React.useCallback((event: NativeCarouselEvent): void => {
      if (!mountedRef.current) {
        return;
      }
      const api = apiRef.current;
      if (!api) {
        return;
      }
      const listeners = listenersRef.current.get(event);
      if (!listeners || listeners.size === 0) {
        return;
      }
      for (const listener of Array.from(listeners)) {
        listener(api, event);
      }
    }, []);
    const emitEventRef = React.useRef(emitEvent);
    emitEventRef.current = emitEvent;

    const scrollToLogical = React.useCallback((logical: number, animatedFlag: boolean): void => {
      const node = scrollNodeRef.current;
      if (!node || typeof node.scrollTo !== "function") {
        return;
      }
      const count = countRef.current;
      if (count <= 0) {
        return;
      }
      const ext = extentRef.current;
      if (ext === null || !Number.isFinite(ext) || ext <= 0) {
        return;
      }
      const offset = carouselOffsetForIndex(logical, count, ext, reversedRef.current);
      if (offset === null) {
        return;
      }
      if (orientationRef.current === "vertical") {
        node.scrollTo({ x: 0, y: offset, animated: animatedFlag });
      } else {
        node.scrollTo({ x: offset, y: 0, animated: animatedFlag });
      }
    }, []);
    const scrollToLogicalRef = React.useRef(scrollToLogical);
    scrollToLogicalRef.current = scrollToLogical;

    const requestApiSelect = React.useCallback((next: number, jump?: boolean): void => {
      if (!mountedRef.current) {
        return;
      }
      if (disabledRef.current) {
        return;
      }
      const count = countRef.current;
      if (count <= 0) {
        return;
      }
      const normalized = normalizeCarouselIndex(next, count);
      const current = indexRef.current;
      gestureActiveRef.current = false;
      if (normalized === current) {
        scrollToLogicalRef.current(current, !jump && shouldAnimateRef.current);
        return;
      }
      if (isControlledRef.current) {
        pendingSelectionRef.current = { index: normalized, jump: Boolean(jump) };
        onIndexChangeRef.current?.(normalized);
        scrollToLogicalRef.current?.(current, false);
        return;
      }
      indexRef.current = normalized;
      setUncontrolled(normalized);
      onIndexChangeRef.current?.(normalized);
      emitEventRef.current?.("select");
      scrollToLogicalRef.current?.(normalized, !jump && shouldAnimateRef.current);
    }, []);
    const requestApiSelectRef = React.useRef(requestApiSelect);
    requestApiSelectRef.current = requestApiSelect;

    const commitGesture = React.useCallback((logical: number): void => {
      gestureActiveRef.current = false;
      if (!mountedRef.current) {
        return;
      }
      if (disabledRef.current) {
        return;
      }
      const count = countRef.current;
      if (count <= 0) {
        return;
      }
      const normalized = normalizeCarouselIndex(logical, count);
      const current = indexRef.current;
      if (normalized === current) {
        scrollToLogicalRef.current(current, false);
        return;
      }
      if (isControlledRef.current) {
        onIndexChangeRef.current?.(normalized);
        scrollToLogicalRef.current?.(current, false);
        return;
      }
      indexRef.current = normalized;
      setUncontrolled(normalized);
      onIndexChangeRef.current?.(normalized);
      emitEventRef.current?.("select");
    }, []);
    const commitGestureRef = React.useRef(commitGesture);
    commitGestureRef.current = commitGesture;

    const handleViewportLayout = React.useCallback((event: LayoutChangeEvent): void => {
      const layout = event.nativeEvent.layout;
      viewportRef.current = { width: layout.width, height: layout.height };
      const vertical = orientationRef.current === "vertical";
      const next = vertical ? layout.height : layout.width;
      if (typeof next !== "number" || !Number.isFinite(next) || next <= 0) {
        extentRef.current = null;
        setExtent(null);
        gestureActiveRef.current = false;
        return;
      }
      if (extentRef.current === next) {
        return;
      }
      extentRef.current = next;
      setExtent(next);
      gestureActiveRef.current = false;
      if (contentReadyRef.current) {
        scrollToLogicalRef.current?.(indexRef.current, false);
      }
    }, []);
    const handleContentSize = React.useCallback((width: number, height: number): void => {
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
      // Cross-axis child layout can change during a drag without changing pages.
      if (gestureActiveRef.current) return;
      if (!contentReadyRef.current) {
        contentReadyRef.current = true;
        setContentReady(true);
      }
      const ext = extentRef.current;
      if (ext === null || !Number.isFinite(ext) || ext <= 0) {
        return;
      }
      if (countRef.current <= 0) {
        return;
      }
      scrollToLogicalRef.current?.(indexRef.current, false);
    }, []);
    const handleGestureBegin = React.useCallback((): void => {
      if (disabledRef.current) {
        return;
      }
      gestureActiveRef.current = true;
    }, []);
    const handleGestureEndDrag = React.useCallback((offset: number, velocity?: number, target?: number): void => {
      if (!gestureActiveRef.current) {
        return;
      }
      if (disabledRef.current) {
        gestureActiveRef.current = false;
        return;
      }
      // End-drag may precede deceleration even at an exact page boundary.
      // Only an explicitly stationary release can finish before momentum-end.
      if (velocity === undefined || !Number.isFinite(velocity) || velocity !== 0 ||
          (target !== undefined && Math.abs(target - offset) >= 1)) return;
      const count = countRef.current;
      const ext = extentRef.current;
      if (count <= 0 || ext === null || !Number.isFinite(ext) || ext <= 0) return;
      const logical = carouselIndexForOffset(offset, count, ext, reversedRef.current);
      if (logical === null) {
        return;
      }
      const expected = carouselOffsetForIndex(logical, count, ext, reversedRef.current);
      if (expected === null) {
        return;
      }
      if (Math.abs(offset - expected) >= 1) {
        return;
      }
      commitGestureRef.current?.(logical);
    }, []);
    const handleGestureMomentumEnd = React.useCallback((offset: number): void => {
      if (!gestureActiveRef.current) {
        return;
      }
      if (disabledRef.current) {
        gestureActiveRef.current = false;
        return;
      }
      const count = countRef.current;
      const ext = extentRef.current;
      if (count <= 0 || ext === null || !Number.isFinite(ext) || ext <= 0) {
        gestureActiveRef.current = false;
        return;
      }
      const logical = carouselIndexForOffset(offset, count, ext, reversedRef.current);
      if (logical === null) {
        gestureActiveRef.current = false;
        return;
      }
      commitGestureRef.current?.(logical);
    }, []);

    const registerItems = React.useCallback((keys: readonly string[]): void => {
      setItemKeys((previous) => previous.length === keys.length &&
        previous.every((key, index) => key === keys[index]) ? previous : keys);
    }, []);

    const api = React.useMemo<NativeCarouselApi>(() => {
      const listenersFor = (event: NativeCarouselEvent): Set<NativeCarouselListener> => {
        let set = listenersRef.current.get(event);
        if (!set) {
          set = new Set();
          listenersRef.current.set(event, set);
        }
        return set;
      };
      return {
        scrollTo(nextIndex: number, jump?: boolean): void {
          requestApiSelectRef.current(nextIndex, jump);
        },
        scrollNext(jump?: boolean): void {
          requestApiSelectRef.current(indexRef.current + 1, jump);
        },
        scrollPrev(jump?: boolean): void {
          requestApiSelectRef.current(indexRef.current - 1, jump);
        },
        selectedScrollSnap(): number {
          return indexRef.current;
        },
        scrollSnapList(): number[] {
          const count = countRef.current;
          if (count <= 0) {
            return [];
          }
          if (count === 1) {
            return [0];
          }
          const list: number[] = [];
          for (let position = 0; position < count; position += 1) {
            list.push(position / (count - 1));
          }
          return list;
        },
        canScrollNext(): boolean {
          const count = countRef.current;
          return count > 1 && indexRef.current < count - 1;
        },
        canScrollPrev(): boolean {
          return countRef.current > 1 && indexRef.current > 0;
        },
        on(event: NativeCarouselEvent, listener: NativeCarouselListener): NativeCarouselApi {
          listenersFor(event).add(listener);
          return apiRef.current as NativeCarouselApi;
        },
        off(event: NativeCarouselEvent, listener: NativeCarouselListener): NativeCarouselApi {
          listenersRef.current.get(event)?.delete(listener);
          return apiRef.current as NativeCarouselApi;
        },
      };
    }, []);
    apiRef.current = api;

    React.useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    React.useEffect(() => {
      setApi?.(api);
      return () => {
        setApi?.(undefined);
      };
    }, [api, setApi]);

    React.useLayoutEffect(() => {
      if (firstEffectRef.current) {
        firstEffectRef.current = false;
        prevCountRef.current = itemCount;
        prevOrientationRef.current = orientation;
        prevDirRef.current = effectiveDir;
        prevKeysRef.current = itemKeys;
        prevExtentRef.current = extent;
        prevControlledRef.current = isControlled;
        prevResolvedRef.current = resolvedIndex;
        return;
      }
      gestureActiveRef.current = false;
      const previousCount = prevCountRef.current;
      const countChanged = previousCount !== itemCount;
      const keysChanged = prevKeysRef.current !== itemKeys;
      const extentChanged = prevExtentRef.current !== extent;
      const modeChanged = prevControlledRef.current !== isControlled;
      const orientationChanged = prevOrientationRef.current !== orientation;
      const dirChanged = prevDirRef.current !== effectiveDir;
      prevCountRef.current = itemCount;
      prevOrientationRef.current = orientation;
      prevDirRef.current = effectiveDir;
      prevKeysRef.current = itemKeys;
      prevExtentRef.current = extent;
      prevControlledRef.current = isControlled;
      if (orientationChanged && viewportRef.current) {
        const nextExtent = orientation === "vertical"
          ? viewportRef.current.height : viewportRef.current.width;
        const validExtent = Number.isFinite(nextExtent) && nextExtent > 0 ? nextExtent : null;
        extentRef.current = validExtent;
        setExtent(validExtent);
      }
      if (!mountedRef.current) {
        prevResolvedRef.current = resolvedIndex;
        return;
      }
      if (keysChanged || orientationChanged || dirChanged || extentChanged || modeChanged) {
        if (!isControlled && countChanged && (itemCount > 0 || previousCount > 0)) {
          setUncontrolled(resolvedIndex);
        }
        // Direction and keyed reorders need alignment even when dimensions stay equal.
        scrollToLogicalRef.current(resolvedIndex, false);
        if (contentReady && extentRef.current !== null) {
          emitEventRef.current?.("reInit");
        }
        prevResolvedRef.current = resolvedIndex;
        return;
      }
      if (!isControlledRef.current) {
        prevResolvedRef.current = resolvedIndex;
        return;
      }
      if (prevResolvedRef.current !== resolvedIndex) {
        prevResolvedRef.current = resolvedIndex;
        const pending = pendingSelectionRef.current;
        pendingSelectionRef.current = null;
        scrollToLogicalRef.current(resolvedIndex,
          shouldAnimateRef.current && !(pending?.index === resolvedIndex && pending.jump));
        emitEventRef.current?.("select");
      }
    }, [itemKeys, itemCount, orientation, effectiveDir, extent, contentReady, resolvedIndex, isControlled]);

    React.useEffect(() => {
      gestureActiveRef.current = false;
    }, [disabled, indexProp, itemCount, orientation, effectiveDir, extent]);

    const contextValue = React.useMemo<NativeCarouselContextValue>(
      () => ({
        orientation,
        effectiveDir,
        reversed,
        disabled,
        index: resolvedIndex,
        itemCount,
        extent,
        canScrollNext,
        canScrollPrev,
        requestApiSelect,
        registerItems,
        scrollNodeRef,
        onViewportLayout: handleViewportLayout,
        onContentSize: handleContentSize,
        onGestureBegin: handleGestureBegin,
        onGestureEndDrag: handleGestureEndDrag,
        onGestureMomentumEnd: handleGestureMomentumEnd,
      }),
      [
        orientation,
        effectiveDir,
        reversed,
        disabled,
        resolvedIndex,
        itemCount,
        extent,
        canScrollNext,
        canScrollPrev,
        requestApiSelect,
        registerItems,
        handleViewportLayout,
        handleContentSize,
        handleGestureBegin,
        handleGestureEndDrag,
        handleGestureMomentumEnd,
      ],
    );

    return (
      <NativeCarouselContext.Provider value={contextValue}>
        <View
          {...viewProps}
          ref={setRootRef}
          testID={testID ?? "carousel"}
          style={[{ gap: 16 }, style]}
          onLayout={callerOnLayout}
        >
          {children}
        </View>
      </NativeCarouselContext.Provider>
    );
  },
);

Carousel.displayName = "Carousel";

export const CarouselContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CarouselContentProps> &
    React.RefAttributes<React.ElementRef<typeof ScrollView>>
> = React.forwardRef<React.ElementRef<typeof ScrollView>, CarouselContentProps>(
  (
    {
      children,
      testID,
      style: callerStyle,
      contentContainerStyle: callerContentStyle,
      scrollEnabled: callerScrollEnabled,
      horizontal: _callerHorizontal,
      pagingEnabled: _callerPagingEnabled,
      onLayout: callerOnLayout,
      onContentSizeChange: callerOnContentSizeChange,
      onScrollBeginDrag: callerOnScrollBeginDrag,
      onScrollEndDrag: callerOnScrollEndDrag,
      onMomentumScrollEnd: callerOnMomentumScrollEnd,
      ...restScrollProps
    },
    ref,
  ) => {
    void _callerHorizontal;
    void _callerPagingEnabled;
    const context = useNativeCarouselContext();
    const isVertical = context.orientation === "vertical";
    const items = React.useMemo(() => flattenCarouselItems(children), [children]);

    const itemKeys = React.useMemo(() => items.map((child) => String(child.key)), [items]);
    React.useLayoutEffect(() => {
      context.registerItems(itemKeys);
    }, [context.registerItems, itemKeys]);

    const displayIndex = normalizeCarouselIndex(context.index, items.length);
    const ordered = React.useMemo(
      () => (context.reversed ? [...items].reverse() : items),
      [context.reversed, items],
    );

    const setScrollRef = React.useCallback(
      (node: React.ElementRef<typeof ScrollView> | null) => {
        context.scrollNodeRef.current = node;
        const cleanup = setHostRef(ref, node);
        return () => {
          context.scrollNodeRef.current = null;
          cleanup?.();
        };
      },
      [context.scrollNodeRef, ref],
    );

    const handleLayout = React.useCallback(
      (event: LayoutChangeEvent): void => {
        callerOnLayout?.(event);
        context.onViewportLayout(event);
      },
      [callerOnLayout, context],
    );

    const handleContentSizeChange = React.useCallback(
      (width: number, height: number): void => {
        callerOnContentSizeChange?.(width, height);
        context.onContentSize(width, height);
      },
      [callerOnContentSizeChange, context],
    );

    const handleBeginDrag = React.useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
        callerOnScrollBeginDrag?.(event);
        context.onGestureBegin();
      },
      [callerOnScrollBeginDrag, context],
    );

    const handleEndDrag = React.useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
        callerOnScrollEndDrag?.(event);
        const offset = isVertical
          ? event.nativeEvent.contentOffset.y
          : event.nativeEvent.contentOffset.x;
        const velocity = isVertical ? event.nativeEvent.velocity?.y : event.nativeEvent.velocity?.x;
        const target = isVertical ? event.nativeEvent.targetContentOffset?.y : event.nativeEvent.targetContentOffset?.x;
        context.onGestureEndDrag(offset, velocity, target);
      },
      [callerOnScrollEndDrag, context, isVertical],
    );

    const handleMomentumEnd = React.useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
        callerOnMomentumScrollEnd?.(event);
        const offset = isVertical
          ? event.nativeEvent.contentOffset.y
          : event.nativeEvent.contentOffset.x;
        context.onGestureMomentumEnd(offset);
      },
      [callerOnMomentumScrollEnd, context, isVertical],
    );

    const total = items.length;

    return (
      <ScrollView
        {...restScrollProps}
        ref={setScrollRef}
        testID={testID ?? "carousel-content"}
        horizontal={!isVertical}
        pagingEnabled
        snapToInterval={undefined}
        snapToOffsets={undefined}
        snapToAlignment="start"
        contentInset={{ top: 0, bottom: 0, left: 0, right: 0 }}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        scrollEnabled={callerScrollEnabled !== false && !context.disabled}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={[{ height: isVertical ? 240 : undefined }, callerStyle, { direction: "ltr" }]}
        contentContainerStyle={[
          { flexDirection: isVertical ? "column" : "row", direction: "ltr" },
          callerContentStyle,
          { flexDirection: isVertical ? "column" : "row", direction: "ltr",
            gap: 0, rowGap: 0, columnGap: 0, margin: 0,
            padding: 0, paddingHorizontal: 0, paddingVertical: 0,
            paddingStart: 0, paddingEnd: 0, paddingLeft: 0, paddingRight: 0,
            paddingTop: 0, paddingBottom: 0 },
        ]}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        onScrollBeginDrag={handleBeginDrag}
        onScrollEndDrag={handleEndDrag}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {ordered.map((child, physicalPosition) => {
          const logical = context.reversed ? total - 1 - physicalPosition : physicalPosition;
          const isActive = total > 0 && logical === displayIndex;
          const sizeStyle =
            context.extent !== null
              ? isVertical
                ? { height: context.extent }
                : { width: context.extent }
              : undefined;
          return (
            <View
              key={child.key ?? String(physicalPosition)}
              style={[{ flexShrink: 0, direction: context.effectiveDir }, sizeStyle]}
              pointerEvents={isActive ? "auto" : "none"}
              accessibilityElementsHidden={!isActive}
              importantForAccessibility={isActive ? "auto" : "no-hide-descendants"}
            >
              {child}
            </View>
          );
        })}
      </ScrollView>
    );
  },
);

CarouselContent.displayName = "CarouselContent";

export const CarouselItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CarouselItemProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, CarouselItemProps>(
  ({ testID, ...props }, ref) => {
    type ViewHost = React.ElementRef<typeof View>;
    const setItemRef = React.useCallback(
      (node: ViewHost | null) => setHostRef(ref, node),
      [ref],
    );
    return <View {...props} ref={setItemRef} testID={testID ?? "carousel-item"} />;
  },
);

CarouselItem.displayName = "CarouselItem";

export const CarouselPrevious: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CarouselPreviousProps> &
    React.RefAttributes<React.ElementRef<typeof Button>>
> = React.forwardRef<React.ElementRef<typeof Button>, CarouselPreviousProps>(
  (
    {
      children,
      accessibilityLabel: callerLabel,
      disabled: callerDisabled,
      onPress: callerOnPress,
      size = "sm",
      variant = "outline",
      testID,
      ...restButtonProps
    },
    ref,
  ) => {
    const context = useNativeCarouselContext();
    const edgeDisabled = !context.canScrollPrev;
    const effectiveDisabled = Boolean(context.disabled || callerDisabled || edgeDisabled);

    const handlePress = React.useCallback(
      (event: Parameters<NonNullable<ButtonProps["onPress"]>>[0]): void => {
        if (effectiveDisabled) {
          return;
        }
        callerOnPress?.(event);
        if (event.defaultPrevented) {
          return;
        }
        context.requestApiSelect(context.index - 1);
      },
      [callerOnPress, context, effectiveDisabled],
    );

    return (
      <Button
        {...restButtonProps}
        ref={ref}
        size={size}
        variant={variant}
        testID={testID ?? "carousel-previous"}
        accessibilityLabel={callerLabel ?? "Previous slide"}
        disabled={effectiveDisabled}
        onPress={handlePress}
      >
        {children ?? "Previous"}
      </Button>
    );
  },
);

CarouselPrevious.displayName = "CarouselPrevious";

export const CarouselNext: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CarouselNextProps> &
    React.RefAttributes<React.ElementRef<typeof Button>>
> = React.forwardRef<React.ElementRef<typeof Button>, CarouselNextProps>(
  (
    {
      children,
      accessibilityLabel: callerLabel,
      disabled: callerDisabled,
      onPress: callerOnPress,
      size = "sm",
      variant = "outline",
      testID,
      ...restButtonProps
    },
    ref,
  ) => {
    const context = useNativeCarouselContext();
    const edgeDisabled = !context.canScrollNext;
    const effectiveDisabled = Boolean(context.disabled || callerDisabled || edgeDisabled);

    const handlePress = React.useCallback(
      (event: Parameters<NonNullable<ButtonProps["onPress"]>>[0]): void => {
        if (effectiveDisabled) {
          return;
        }
        callerOnPress?.(event);
        if (event.defaultPrevented) {
          return;
        }
        context.requestApiSelect(context.index + 1);
      },
      [callerOnPress, context, effectiveDisabled],
    );

    return (
      <Button
        {...restButtonProps}
        ref={ref}
        size={size}
        variant={variant}
        testID={testID ?? "carousel-next"}
        accessibilityLabel={callerLabel ?? "Next slide"}
        disabled={effectiveDisabled}
        onPress={handlePress}
      >
        {children ?? "Next"}
      </Button>
    );
  },
);

CarouselNext.displayName = "CarouselNext";
