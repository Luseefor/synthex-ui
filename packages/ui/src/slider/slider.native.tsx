import * as React from "react";
import {
  PanResponder,
  Pressable,
  View,
  type AccessibilityActionEvent,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type PanResponderGestureState,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { NativeDirectionContext } from "../_shared/direction-context.native";
import { useControllableState } from "../hooks/useControllableState";
import {
  nearestSliderThumb,
  normalizeSliderConfig,
  normalizeSliderValues,
  sliderRatioForValue,
  sliderValueFromOffset,
  stepSliderThumb,
  updateSliderThumb,
  type NativeSliderConfig,
} from "./slider.math";
import type { SliderSharedProps } from "./slider.shared";

export interface SliderProps
  extends Omit<PressableProps, "disabled" | "style">,
    SliderSharedProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly thumbLabels?: readonly string[];
}

function areValuesEqual(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) {
      return false;
    }
  }
  return true;
}

interface TrackRect {
  readonly pageX: number;
  readonly pageY: number;
  readonly width: number;
  readonly height: number;
}

function isValidRect(rect: TrackRect | null): rect is TrackRect {
  return (
    rect !== null &&
    Number.isFinite(rect.pageX) &&
    Number.isFinite(rect.pageY) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    rect.width > 0 &&
    rect.height > 0
  );
}

function nextForPage(
  pageX: number,
  pageY: number,
  rect: TrackRect,
  config: NativeSliderConfig,
  base: readonly number[],
  index: number,
): number[] | null {
  const offset =
    config.orientation === "vertical" ? pageY - rect.pageY : pageX - rect.pageX;
  const size = config.orientation === "vertical" ? rect.height : rect.width;
  const target = sliderValueFromOffset(offset, size, config);
  if (target === null) {
    return null;
  }
  return updateSliderThumb(base, index, target, config);
}

function preferHigherForDirection(
  dx: number,
  dy: number,
  config: NativeSliderConfig,
): boolean {
  if (dx === 0 && dy === 0) {
    return false;
  }
  if (config.orientation === "vertical") {
    const flippedV = !config.inverted;
    if (dy > 0) {
      return !flippedV;
    }
    if (dy < 0) {
      return flippedV;
    }
    return false;
  }
  const flippedH = (config.dir === "rtl") !== config.inverted;
  if (dx > 0) {
    return !flippedH;
  }
  if (dx < 0) {
    return flippedH;
  }
  return false;
}

export const Slider: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SliderProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, SliderProps>(
  (
    {
      defaultValue = [50],
      disabled = false,
      max = 100,
      min = 0,
      onValueChange,
      onValueCommit,
      orientation = "horizontal",
      step = 1,
      dir: dirProp,
      inverted = false,
      thumbLabels,
      style,
      value,
      onPress: callerOnPress,
      onPressIn: callerOnPressIn,
      onLayout: callerOnLayout,
      accessibilityLabel: callerLabel,
      accessibilityHint: callerHint,
      accessibilityState: callerState,
      accessibilityValue: callerValue,
      accessibilityActions: callerActions,
      onAccessibilityAction: callerOnAccessibilityAction,
      testID,
      ...restPressProps
    },
    ref,
  ) => {
    const theme = useTheme();
    const directionCtx = React.useContext(NativeDirectionContext);
    const effectiveDir = dirProp ?? directionCtx.dir ?? "ltr";

    const config: NativeSliderConfig = React.useMemo(
      () =>
        normalizeSliderConfig({
          min,
          max,
          step,
          orientation,
          dir: effectiveDir,
          inverted,
        }),
      [min, max, step, orientation, effectiveDir, inverted],
    );
    const isVertical = config.orientation === "vertical";

    const [currentValue, setCurrentValueInternal] = useControllableState<number[]>({
      defaultValue,
      onChange: onValueChange,
      value,
    });
    const renderedValues = React.useMemo(
      () => normalizeSliderValues(currentValue, config),
      [currentValue, config],
    );

    const rootTestID = testID ?? "slider";

    const trackRef = React.useRef<React.ElementRef<typeof View> | null>(null);

    type PressableHost = React.ElementRef<typeof Pressable>;
    const setPressableRef = React.useCallback(
      (node: PressableHost | null) => {
        if (typeof ref === "function") {
          const cleanup = ref(node);
          return typeof cleanup === "function" ? cleanup : () => ref(null);
        }
        if (ref !== null && ref !== undefined && typeof ref === "object" && "current" in ref) {
          ref.current = node;
          return () => {
            ref.current = null;
          };
        }
        return undefined;
      },
      [ref],
    );

    const configRef = React.useRef(config);
    configRef.current = config;
    const renderedRef = React.useRef(renderedValues);
    renderedRef.current = renderedValues;
    const disabledRef = React.useRef(disabled);
    disabledRef.current = disabled;
    const setterRef = React.useRef(setCurrentValueInternal);
    setterRef.current = setCurrentValueInternal;
    const commitRef = React.useRef(onValueCommit);
    commitRef.current = onValueCommit;

    const measureGenRef = React.useRef(0);
    const dragRectRef = React.useRef<TrackRect | null>(null);
    const activeIndexRef = React.useRef<number | null>(null);
    const dragActiveRef = React.useRef(false);
    const pendingGrantRef = React.useRef(false);
    const captureDirectionRef = React.useRef<{ dx: number; dy: number } | null>(null);
    const dragChangedRef = React.useRef(false);
    const proposedRef = React.useRef<number[] | null>(null);
    const pressStartRef = React.useRef<{ pageX: number; pageY: number } | null>(null);
    const suppressTapRef = React.useRef(false);

    const cancelDrag = React.useCallback((): void => {
      measureGenRef.current += 1;
      pendingGrantRef.current = false;
      captureDirectionRef.current = null;
      dragActiveRef.current = false;
      activeIndexRef.current = null;
      dragRectRef.current = null;
      dragChangedRef.current = false;
      proposedRef.current = null;
    }, []);

    const cancelDragRef = React.useRef(cancelDrag);
    cancelDragRef.current = cancelDrag;

    React.useEffect(() => {
      cancelDragRef.current();
      pressStartRef.current = null;
    }, [disabled, config, renderedValues.length]);

    React.useEffect(() => {
      return () => {
        measureGenRef.current += 1;
        pendingGrantRef.current = false;
        captureDirectionRef.current = null;
        dragActiveRef.current = false;
      };
    }, []);

    const requestFreshTrackRect = React.useCallback(
      (done: (rect: TrackRect | null) => void): void => {
        const gen = measureGenRef.current + 1;
        measureGenRef.current = gen;
        const trackNode = trackRef.current;
        if (trackNode === null || typeof trackNode.measure !== "function") {
          done(null);
          return;
        }
        trackNode.measure((x, y, width, height, pageX, pageY) => {
          void x;
          void y;
          if (gen !== measureGenRef.current) {
            return;
          }
          if (
            !Number.isFinite(pageX) ||
            !Number.isFinite(pageY) ||
            !Number.isFinite(width) ||
            !Number.isFinite(height) ||
            width <= 0 ||
            height <= 0
          ) {
            done(null);
            return;
          }
          const rect: TrackRect = { pageX, pageY, width, height };
          done(rect);
        });
      },
      [],
    );

    const requestRef = React.useRef(requestFreshTrackRect);
    requestRef.current = requestFreshTrackRect;

    const rebasedBaseForMove = React.useCallback((index: number): readonly number[] => {
      const currentRendered = renderedRef.current;
      const lastProposed = proposedRef.current;
      if (lastProposed !== null && lastProposed.length === currentRendered.length) {
        const rebased = [...lastProposed];
        for (let i = 0; i < rebased.length; i += 1) {
          if (i !== index) {
            rebased[i] = currentRendered[i] as number;
          }
        }
        proposedRef.current = rebased;
        return rebased;
      }
      return lastProposed ?? currentRendered;
    }, []);

    const rebaseRef = React.useRef(rebasedBaseForMove);
    rebaseRef.current = rebasedBaseForMove;

    const panResponder = React.useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => false,
          onStartShouldSetPanResponderCapture: () => false,
          onMoveShouldSetPanResponder: () => false,
          onMoveShouldSetPanResponderCapture: (
            _event: GestureResponderEvent,
            gesture: PanResponderGestureState,
          ) => {
            if (disabledRef.current) {
              return false;
            }
            const touches = gesture.numberActiveTouches ?? 1;
            if (touches !== 1) {
              return false;
            }
            const cfg = configRef.current;
            const dx = gesture.dx ?? 0;
            const dy = gesture.dy ?? 0;
            let shouldCapture = false;
            if (cfg.orientation === "vertical") {
              shouldCapture = Math.abs(dy) > 4 && Math.abs(dy) > Math.abs(dx);
            } else {
              shouldCapture = Math.abs(dx) > 4 && Math.abs(dx) > Math.abs(dy);
            }
            if (shouldCapture) {
              captureDirectionRef.current = { dx, dy };
            }
            return shouldCapture;
          },
          onPanResponderGrant: (
            _event: GestureResponderEvent,
            gesture: PanResponderGestureState,
          ) => {
            void gesture;
            if (disabledRef.current) {
              return;
            }
            const stored = pressStartRef.current;
            if (
              stored === null ||
              !Number.isFinite(stored.pageX) ||
              !Number.isFinite(stored.pageY)
            ) {
              return;
            }
            const startPageX = stored.pageX;
            const startPageY = stored.pageY;
            const captured = captureDirectionRef.current;
            pendingGrantRef.current = true;
            requestRef.current((rect) => {
              pendingGrantRef.current = false;
              if (!isValidRect(rect)) {
                return;
              }
              if (disabledRef.current) {
                return;
              }
              const currentStored = pressStartRef.current;
              if (
                currentStored === null ||
                currentStored.pageX !== startPageX ||
                currentStored.pageY !== startPageY
              ) {
                return;
              }
              const cfg = configRef.current;
              const base = renderedRef.current;
              const direction = captured ?? { dx: 0, dy: 0 };
              const preferHigher = preferHigherForDirection(direction.dx, direction.dy, cfg);
              captureDirectionRef.current = null;
              const offset =
                cfg.orientation === "vertical"
                  ? startPageY - rect.pageY
                  : startPageX - rect.pageX;
              const size = cfg.orientation === "vertical" ? rect.height : rect.width;
              const target = sliderValueFromOffset(offset, size, cfg);
              if (target === null) {
                return;
              }
              const index = nearestSliderThumb(base, target, preferHigher);
              activeIndexRef.current = index;
              dragActiveRef.current = true;
              dragChangedRef.current = false;
              dragRectRef.current = rect;
              proposedRef.current = [...base];
              const next = updateSliderThumb(proposedRef.current, index, target, cfg);
              if (areValuesEqual(next, base)) {
                return;
              }
              proposedRef.current = next;
              dragChangedRef.current = true;
              setterRef.current(next);
            });
          },
          onPanResponderMove: (
            _event: GestureResponderEvent,
            gesture: PanResponderGestureState,
          ) => {
            if (!dragActiveRef.current || activeIndexRef.current === null) {
              return;
            }
            const touches = gesture.numberActiveTouches ?? 1;
            if (touches !== 1) {
              return;
            }
            if (disabledRef.current) {
              cancelDragRef.current();
              return;
            }
            const cfg = configRef.current;
            const rect = dragRectRef.current;
            if (!isValidRect(rect)) {
              return;
            }
            if (!Number.isFinite(gesture.moveX) || !Number.isFinite(gesture.moveY)) {
              return;
            }
            const index = activeIndexRef.current;
            const base = rebaseRef.current(index);
            const next = nextForPage(gesture.moveX, gesture.moveY, rect, cfg, base, index);
            if (next === null || areValuesEqual(next, base)) {
              return;
            }
            proposedRef.current = next;
            dragChangedRef.current = true;
            setterRef.current(next);
          },
          onPanResponderRelease: (
            _event: GestureResponderEvent,
            gesture: PanResponderGestureState,
          ) => {
            const wasActive = dragActiveRef.current && activeIndexRef.current !== null;
            const wasPending = pendingGrantRef.current;
            if (!wasActive && !wasPending) {
              return;
            }
            if (!wasActive && wasPending) {
              cancelDragRef.current();
              pressStartRef.current = null;
              suppressTapRef.current = true;
              return;
            }
            pendingGrantRef.current = false;
            captureDirectionRef.current = null;
            const cfg = configRef.current;
            const rect = dragRectRef.current;
            const index = activeIndexRef.current;
            if (index === null) {
              dragActiveRef.current = false;
              activeIndexRef.current = null;
              dragRectRef.current = null;
              dragChangedRef.current = false;
              pressStartRef.current = null;
              suppressTapRef.current = true;
              proposedRef.current = null;
              return;
            }
            if (isValidRect(rect) && !disabledRef.current) {
              if (Number.isFinite(gesture.moveX) && Number.isFinite(gesture.moveY)) {
                const base = rebaseRef.current(index);
                const next = nextForPage(gesture.moveX, gesture.moveY, rect, cfg, base, index);
                if (next !== null && !areValuesEqual(next, base)) {
                  proposedRef.current = next;
                  dragChangedRef.current = true;
                  setterRef.current(next);
                }
              }
            }
            const changed = dragChangedRef.current;
            const finalValue = proposedRef.current;
            dragActiveRef.current = false;
            activeIndexRef.current = null;
            dragRectRef.current = null;
            dragChangedRef.current = false;
            pressStartRef.current = null;
            suppressTapRef.current = true;
            proposedRef.current = null;
            if (changed && finalValue !== null) {
              commitRef.current?.(finalValue);
            }
          },
          onPanResponderTerminate: () => {
            const wasActive = dragActiveRef.current && activeIndexRef.current !== null;
            const wasPending = pendingGrantRef.current;
            cancelDragRef.current();
            pressStartRef.current = null;
            if (wasActive || wasPending) {
              suppressTapRef.current = true;
            }
          },
          onPanResponderTerminationRequest: () => !dragActiveRef.current,
        }),
      [],
    );

    const handleTrackLayout = React.useCallback(
      (_event: LayoutChangeEvent): void => {
        requestRef.current(() => {});
      },
      [],
    );

    const handleRootLayout = React.useCallback(
      (event: LayoutChangeEvent): void => {
        callerOnLayout?.(event);
      },
      [callerOnLayout],
    );

    const handlePressIn = React.useCallback(
      (event: GestureResponderEvent): void => {
        if (disabledRef.current) {
          return;
        }
        suppressTapRef.current = false;
        callerOnPressIn?.(event);
        const { pageX, pageY } = event.nativeEvent;
        if (Number.isFinite(pageX) && Number.isFinite(pageY)) {
          pressStartRef.current = { pageX, pageY };
        } else {
          pressStartRef.current = null;
        }
        requestRef.current(() => {});
      },
      [callerOnPressIn],
    );

    const handlePress = React.useCallback(
      (event: GestureResponderEvent): void => {
        if (disabledRef.current) {
          return;
        }
        if (suppressTapRef.current) {
          suppressTapRef.current = false;
          return;
        }
        if (dragActiveRef.current || pendingGrantRef.current) {
          return;
        }
        callerOnPress?.(event);
        if (event.defaultPrevented) {
          return;
        }
        const { pageX, pageY } = event.nativeEvent;
        if (!Number.isFinite(pageX) || !Number.isFinite(pageY)) {
          pressStartRef.current = null;
          return;
        }
        const tapPageX = pageX;
        const tapPageY = pageY;
        requestRef.current((rect) => {
          if (!isValidRect(rect)) {
            pressStartRef.current = null;
            return;
          }
          if (disabledRef.current || dragActiveRef.current || pendingGrantRef.current) {
            pressStartRef.current = null;
            return;
          }
          if (suppressTapRef.current) {
            suppressTapRef.current = false;
            pressStartRef.current = null;
            return;
          }
          const cfg = configRef.current;
          const base = renderedRef.current;
          const offset =
            cfg.orientation === "vertical" ? tapPageY - rect.pageY : tapPageX - rect.pageX;
          const size = cfg.orientation === "vertical" ? rect.height : rect.width;
          const target = sliderValueFromOffset(offset, size, cfg);
          const targetForTie = target ?? base[0] ?? cfg.min;
          const index = nearestSliderThumb(base, targetForTie, false);
          const next = nextForPage(tapPageX, tapPageY, rect, cfg, base, index);
          pressStartRef.current = null;
          if (next === null || areValuesEqual(next, base)) {
            return;
          }
          setterRef.current(next);
          commitRef.current?.(next);
        });
      },
      [callerOnPress],
    );

    const handleThumbAccessibilityAction = React.useCallback(
      (index: number, event: AccessibilityActionEvent): void => {
        if (disabledRef.current) {
          return;
        }
        callerOnAccessibilityAction?.(event);
        if (event.defaultPrevented) {
          return;
        }
        const actionName = event.nativeEvent.actionName;
        if (actionName !== "increment" && actionName !== "decrement") {
          return;
        }
        const cfg = configRef.current;
        const base = renderedRef.current;
        const direction = actionName === "increment" ? 1 : -1;
        const next = stepSliderThumb(base, index, direction as 1 | -1, cfg);
        if (areValuesEqual(next, base)) {
          return;
        }
        setterRef.current(next);
        commitRef.current?.(next);
      },
      [callerOnAccessibilityAction],
    );

    const low = renderedValues.length > 0 ? Math.min(...renderedValues) : config.min;
    const high = renderedValues.length > 0 ? Math.max(...renderedValues) : config.min;
    const physFor = (entry: number): number => sliderRatioForValue(entry, config);
    const physMin = physFor(config.min);
    let fillMinPhys: number;
    let fillMaxPhys: number;
    if (renderedValues.length <= 1) {
      const physVal = physFor(renderedValues[0] ?? config.min);
      fillMinPhys = Math.min(physMin, physVal);
      fillMaxPhys = Math.max(physMin, physVal);
    } else {
      const physLow = physFor(low);
      const physHigh = physFor(high);
      fillMinPhys = Math.min(physLow, physHigh);
      fillMaxPhys = Math.max(physLow, physHigh);
    }
    const fillWidthPercent = (fillMaxPhys - fillMinPhys) * 100;
    const fillLeftPercent = fillMinPhys * 100;
    const fillBottomPercent = (1 - fillMaxPhys) * 100;
    const fillHeightPercent = (fillMaxPhys - fillMinPhys) * 100;

    const hasCustomIncrement =
      callerActions?.some((action) => action.name === "increment") ?? false;
    const hasCustomDecrement =
      callerActions?.some((action) => action.name === "decrement") ?? false;
    const thumbActions = [
      ...(callerActions ?? []),
      ...(hasCustomIncrement ? [] : [{ name: "increment" as const }]),
      ...(hasCustomDecrement ? [] : [{ name: "decrement" as const }]),
    ];

    return (
      <View accessible={false} {...panResponder.panHandlers}>
        <Pressable
          ref={setPressableRef}
          disabled={disabled}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onLayout={handleRootLayout}
          testID={rootTestID}
          style={[
            isVertical
              ? { width: 40, height: 160, alignItems: "center", justifyContent: "center" }
              : { height: 40, justifyContent: "center" },
            disabled && { opacity: 0.45 },
            style,
          ]}
          {...restPressProps}
          accessible={false}
        >
          <View
            ref={trackRef}
            collapsable={false}
            onLayout={handleTrackLayout}
            style={
              isVertical
                ? { width: 8, height: "100%", borderRadius: 999, backgroundColor: theme.colors.secondaryMuted }
                : { height: 8, borderRadius: 999, backgroundColor: theme.colors.secondaryMuted }
            }
          >
            <View
              style={
                isVertical
                  ? {
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: `${fillBottomPercent}%`,
                      height: `${fillHeightPercent}%`,
                      borderRadius: 999,
                      backgroundColor: theme.colors.primary,
                    }
                  : {
                      position: "absolute",
                      left: `${fillLeftPercent}%`,
                      top: 0,
                      bottom: 0,
                      width: `${fillWidthPercent}%`,
                      borderRadius: 999,
                      backgroundColor: theme.colors.primary,
                    }
              }
            />
            {renderedValues.map((entry, index) => {
              const physical = physFor(entry);
              const thumbLabel =
                thumbLabels?.[index] ??
                (callerLabel !== undefined
                  ? renderedValues.length > 1
                    ? `${callerLabel} ${index + 1}`
                    : callerLabel
                  : `Value ${index + 1}`);
              return (
                <View
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  accessible
                  accessibilityRole="adjustable"
                  accessibilityLabel={thumbLabel}
                  accessibilityHint={callerHint}
                  accessibilityValue={{
                    min: config.min,
                    max: config.max,
                    now: entry,
                    text: callerValue?.text,
                  }}
                  accessibilityState={{
                    ...callerState,
                    disabled,
                  }}
                  accessibilityActions={thumbActions}
                  onAccessibilityAction={(event: AccessibilityActionEvent) =>
                    handleThumbAccessibilityAction(index, event)
                  }
                  testID={`${rootTestID}-thumb-${index}`}
                  style={
                    isVertical
                      ? {
                          position: "absolute",
                          left: -6,
                          bottom: `${(1 - physical) * 100}%`,
                          width: 20,
                          height: 20,
                          marginBottom: -10,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: theme.colors.borderStrong,
                          backgroundColor: theme.colors.surface,
                        }
                      : {
                          position: "absolute",
                          top: -6,
                          left: `${physical * 100}%`,
                          width: 20,
                          height: 20,
                          marginLeft: -10,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: theme.colors.borderStrong,
                          backgroundColor: theme.colors.surface,
                        }
                  }
                />
              );
            })}
          </View>
        </Pressable>
      </View>
    );
  },
);

Slider.displayName = "Slider";
