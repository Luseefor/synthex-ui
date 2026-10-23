import * as React from "react";
import {
  PanResponder,
  Pressable,
  View,
  type AccessibilityActionEvent,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type PanResponderGestureState,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../_shared/theme/context";
import { NativeDirectionContext } from "../_shared/direction-context.native";
import {
  getPanelPairBounds,
  resizePanelPair,
  resolvePanelSizes,
  type NativePanelConstraint,
} from "./resizable.math";
import type {
  ResizableDirection,
  ResizableHandleSharedProps,
  ResizablePanelGroupSharedProps,
  ResizablePanelSharedProps,
} from "./resizable.shared";

export interface ResizablePanelGroupProps
  extends Omit<React.ComponentProps<typeof View>, "children">,
    ResizablePanelGroupSharedProps {
  readonly sizes?: readonly number[];
  readonly defaultSizes?: readonly number[];
  readonly onSizesChange?: (sizes: number[]) => void;
  readonly onSizesCommit?: (sizes: number[]) => void;
  readonly dir?: "ltr" | "rtl";
  readonly resizeStep?: number;
  readonly disabled?: boolean;
  readonly testID?: string;
}

export interface ResizablePanelProps
  extends Omit<React.ComponentProps<typeof View>, "children">,
    ResizablePanelSharedProps {
  readonly maxSize?: number;
  readonly onResize?: (size: number, previous: number | undefined) => void;
  readonly testID?: string;
}

export interface ResizableHandleProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    ResizableHandleSharedProps {
  readonly testID?: string;
}

interface PanelInjection {
  readonly __size?: number;
  readonly __direction?: ResizableDirection;
  readonly __panelIndex?: number;
}

interface HandleInjection {
  readonly __pairIndex?: number;
}

interface GroupDragSession {
  readonly pairIndex: number;
  readonly snapshotSizes: number[];
  readonly snapshotSpan: number;
  readonly snapshotGroupExtent: number | null;
  readonly captureDelta: { readonly dx: number; readonly dy: number };
  pending: number[][];
  proposed: number[] | null;
  changed: boolean;
}

interface ResizableGroupContextValue {
  readonly direction: ResizableDirection;
  readonly effectiveDir: "ltr" | "rtl";
  readonly groupDisabled: boolean;
  readonly resizeStep: number;
  readonly sizes: readonly number[];
  readonly constraints: readonly NativePanelConstraint[];
  readonly renderedRef: React.MutableRefObject<readonly number[]>;
  readonly constraintsRef: React.MutableRefObject<readonly NativePanelConstraint[]>;
  readonly disabledRef: React.MutableRefObject<boolean>;
  readonly stepRef: React.MutableRefObject<number>;
  readonly directionRef: React.MutableRefObject<ResizableDirection>;
  readonly effectiveDirRef: React.MutableRefObject<"ltr" | "rtl">;
  readonly panelExtentsRef: React.MutableRefObject<number[]>;
  readonly groupExtentRef: React.MutableRefObject<number | null>;
  readonly sessionRef: React.MutableRefObject<GroupDragSession | null>;
  readonly startSession: (pairIndex: number, captureDelta: { dx: number; dy: number }) => boolean;
  readonly moveSession: (pairIndex: number, totalPixels: number) => void;
  readonly endSession: (pairIndex: number, totalPixels: number | null) => boolean;
  readonly cancelSession: () => void;
  readonly requestStep: (pairIndex: number, direction: 1 | -1) => void;
  readonly registerPanelLayout: (index: number, extent: number) => void;
  readonly registerGroupLayout: (extent: number) => void;
}

const ResizableGroupContext = React.createContext<ResizableGroupContextValue | null>(null);

function areSizesEqual(a: readonly number[], b: readonly number[]): boolean {
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

function sanitizeStep(value: number | undefined): number {
  if (value === undefined) {
    return 5;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(
      "ResizablePanelGroup: resizeStep must be a finite number > 0.",
    );
  }
  return value;
}

function flattenResizableChildren(children: React.ReactNode): React.ReactNode[] {
  const flat: React.ReactNode[] = [];
  const walk = (nodes: React.ReactNode, parentKey = ""): void => {
    for (const node of React.Children.toArray(nodes)) {
      const key = React.isValidElement(node) ? JSON.stringify([parentKey, node.key]) : parentKey;
      if (
        React.isValidElement<{ children?: React.ReactNode }>(node) &&
        node.type === React.Fragment
      ) {
        walk(node.props.children, key);
      } else {
        flat.push(React.isValidElement(node) ? React.cloneElement(node, { key }) : node);
      }
    }
  };
  walk(children);
  return flat;
}

function setHostRef<T>(ref: React.Ref<T> | undefined, node: T | null): void | (() => void) {
  if (typeof ref === "function") {
    const cleanup = ref(node);
    if (typeof cleanup === "function") {
      return cleanup;
    }
    return () => {
      ref(null);
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

export const ResizablePanel: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ResizablePanelProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, ResizablePanelProps & PanelInjection>(
  (
    {
      children,
      defaultSize,
      minSize = 15,
      maxSize = 100,
      onResize,
      style,
      testID,
      onLayout: callerOnLayout,
      __size,
      __direction,
      __panelIndex,
      ...viewProps
    },
    ref,
  ) => {
    const theme = useTheme();
    const group = React.useContext(ResizableGroupContext);
    const direction = __direction ?? group?.direction ?? "horizontal";
    const size = __size ?? defaultSize ?? 100;
    void maxSize;

    type ViewHost = React.ElementRef<typeof View>;
    const setPanelRef = React.useCallback(
      (node: ViewHost | null) => setHostRef(ref, node),
      [ref],
    );

    const previousRef = React.useRef<number | undefined>(undefined);
    React.useEffect(() => {
      if (onResize === undefined) {
        previousRef.current = size;
        return;
      }
      if (previousRef.current === undefined) {
        previousRef.current = size;
        onResize(size, undefined);
        return;
      }
      if (previousRef.current !== size) {
        const previous = previousRef.current;
        previousRef.current = size;
        onResize(size, previous);
      }
    }, [size, onResize]);

    const handleLayout = React.useCallback(
      (event: LayoutChangeEvent): void => {
        callerOnLayout?.(event);
        const layout = event.nativeEvent.layout;
        const extent = direction === "horizontal" ? layout.width : layout.height;
        // Zero is a valid panel extent (a panel at 0% must stay draggable
        // back open); only non-finite extents are ignored. Dragging requires
        // a positive total span, enforced at grant time.
        if (typeof extent === "number" && Number.isFinite(extent) && extent >= 0) {
          const index = __panelIndex ?? -1;
          group?.registerPanelLayout(index, extent);
        }
      },
      [callerOnLayout, direction, group, __panelIndex],
    );

    return (
      <View
        {...viewProps}
        ref={setPanelRef}
        testID={testID ?? "resizable-panel"}
        onLayout={handleLayout}
        style={[
          { overflow: "hidden", backgroundColor: theme.colors.surfaceRaised },
          style,
          {
            flexBasis: 0,
            flexGrow: size,
            flexShrink: 1,
            minWidth: 0,
            minHeight: 0,
          },
        ]}
      >
        {children}
      </View>
    );
  },
);

ResizablePanel.displayName = "ResizablePanel";

export const ResizableHandle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ResizableHandleProps> &
    React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, ResizableHandleProps & HandleInjection>(
  (
    {
      style,
      testID,
      withHandle = true,
      disabled: selfDisabled = false,
      children,
      onPress: callerOnPress,
      onPressIn: callerOnPressIn,
      onPressOut: callerOnPressOut,
      onLayout: callerOnLayout,
      accessibilityLabel: callerLabel,
      accessibilityHint: callerHint,
      accessibilityValue: callerValue,
      accessibilityState: callerState,
      accessibilityActions: callerActions,
      onAccessibilityAction: callerOnAccessibilityAction,
      __pairIndex,
      ...pressProps
    },
    ref,
  ) => {
    const theme = useTheme();
    const group = React.useContext(ResizableGroupContext);
    const pairIndex = __pairIndex ?? 0;
    const groupDisabled = group?.groupDisabled ?? false;
    const effectiveDisabled = Boolean(groupDisabled || selfDisabled);
    const direction = group?.direction ?? "horizontal";

    type PressableHost = React.ElementRef<typeof Pressable>;
    const setPressableRef = React.useCallback(
      (node: PressableHost | null) => setHostRef(ref, node),
      [ref],
    );

    const pairIndexRef = React.useRef(pairIndex);
    pairIndexRef.current = pairIndex;
    const disabledRef = React.useRef(effectiveDisabled);
    disabledRef.current = effectiveDisabled;
    const captureDeltaRef = React.useRef<{ dx: number; dy: number } | null>(null);
    const suppressTapRef = React.useRef(false);

    const groupForResponder = React.useRef(group);
    groupForResponder.current = group;

    // Self-disable mid-gesture must cancel this handle's own session without
    // commit. Group-level disable is covered by the group's cancel signature;
    // only the handle observes its own disabled prop here.
    const cancelOwnSession = React.useCallback((): void => {
      const activeGroup = groupForResponder.current;
      if (activeGroup === null) {
        return;
      }
      const session = activeGroup.sessionRef.current;
      if (session !== null && session.pairIndex === pairIndexRef.current) {
        activeGroup.cancelSession();
      }
    }, []);

    React.useEffect(() => {
      if (disabledRef.current) {
        captureDeltaRef.current = null;
        cancelOwnSession();
      }
    }, [effectiveDisabled, cancelOwnSession]);

    const panResponder = React.useMemo(() => {
      if (groupForResponder.current === null) {
        return null;
      }
      return PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: () => false,
        onPanResponderStart: (_event, gesture) => {
          if (gesture.numberActiveTouches > 1) {
            captureDeltaRef.current = null;
            cancelOwnSession();
            suppressTapRef.current = true;
          }
        },
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
          const activeGroup = groupForResponder.current;
          if (activeGroup === null) {
            return false;
          }
          const isVertical = activeGroup.directionRef.current === "vertical";
          const dx = gesture.dx ?? 0;
          const dy = gesture.dy ?? 0;
          let shouldCapture = false;
          if (isVertical) {
            shouldCapture = Math.abs(dy) > 4 && Math.abs(dy) > Math.abs(dx);
          } else {
            shouldCapture = Math.abs(dx) > 4 && Math.abs(dx) > Math.abs(dy);
          }
          if (shouldCapture) {
            captureDeltaRef.current = { dx, dy };
          }
          return shouldCapture;
        },
        onPanResponderGrant: (
          _event: GestureResponderEvent,
          _gesture: PanResponderGestureState,
        ) => {
          if (disabledRef.current) {
            return;
          }
          const activeGroup = groupForResponder.current;
          if (activeGroup === null) {
            return;
          }
          const captured = captureDeltaRef.current;
          if (captured === null) {
            return;
          }
          activeGroup.startSession(pairIndexRef.current, captured);
        },
        onPanResponderMove: (
          _event: GestureResponderEvent,
          gesture: PanResponderGestureState,
        ) => {
          if (disabledRef.current) {
            captureDeltaRef.current = null;
            const activeGroup = groupForResponder.current;
            if (activeGroup === null) {
              return;
            }
            const session = activeGroup.sessionRef.current;
            if (session !== null && session.pairIndex === pairIndexRef.current) {
              activeGroup.cancelSession();
            }
            return;
          }
          const activeGroup = groupForResponder.current;
          if (activeGroup === null) {
            return;
          }
          const touches = gesture.numberActiveTouches ?? 1;
          if (touches !== 1) {
            captureDeltaRef.current = null;
            cancelOwnSession();
            suppressTapRef.current = true;
            return;
          }
          const captured = captureDeltaRef.current;
          if (captured === null) {
            return;
          }
          const isVertical = activeGroup.directionRef.current === "vertical";
          const axis = isVertical ? (gesture.dy ?? 0) : (gesture.dx ?? 0);
          const capturedAxis = isVertical ? captured.dy : captured.dx;
          activeGroup.moveSession(pairIndexRef.current, capturedAxis + axis);
        },
        onPanResponderRelease: (
          _event: GestureResponderEvent,
          gesture: PanResponderGestureState,
        ) => {
          if (disabledRef.current) {
            captureDeltaRef.current = null;
            const disabledGroup = groupForResponder.current;
            if (disabledGroup !== null) {
              const session = disabledGroup.sessionRef.current;
              if (session !== null && session.pairIndex === pairIndexRef.current) {
                disabledGroup.cancelSession();
              }
            }
            return;
          }
          const activeGroup = groupForResponder.current;
          if (activeGroup === null) {
            return;
          }
          const captured = captureDeltaRef.current;
          captureDeltaRef.current = null;
          if (captured === null) {
            return;
          }
          const isVertical = activeGroup.directionRef.current === "vertical";
          const axis = isVertical ? (gesture.dy ?? 0) : (gesture.dx ?? 0);
          const capturedAxis = isVertical ? captured.dy : captured.dx;
          const wasActive = activeGroup.endSession(
            pairIndexRef.current,
            capturedAxis + axis,
          );
          if (wasActive) {
            suppressTapRef.current = true;
          }
        },
        onPanResponderTerminate: () => {
          const activeGroup = groupForResponder.current;
          captureDeltaRef.current = null;
          if (activeGroup === null) {
            return;
          }
          const session = activeGroup.sessionRef.current;
          const wasActive =
            session !== null && session.pairIndex === pairIndexRef.current;
          activeGroup.cancelSession();
          if (wasActive) {
            suppressTapRef.current = true;
          }
        },
        onPanResponderTerminationRequest: () => {
          const activeGroup = groupForResponder.current;
          if (activeGroup === null) {
            return true;
          }
          const session = activeGroup.sessionRef.current;
          if (session === null) {
            return true;
          }
          return session.pairIndex !== pairIndexRef.current;
        },
      });
    }, []);

    const handlePressIn = React.useCallback(
      (event: GestureResponderEvent): void => {
        if (disabledRef.current) {
          return;
        }
        suppressTapRef.current = false;
        callerOnPressIn?.(event);
      },
      [callerOnPressIn],
    );

    const handlePressOut = React.useCallback(
      (event: GestureResponderEvent): void => {
        if (disabledRef.current) {
          return;
        }
        callerOnPressOut?.(event);
      },
      [callerOnPressOut],
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
        const activeGroup = groupForResponder.current;
        if (activeGroup !== null) {
          const session = activeGroup.sessionRef.current;
          if (session !== null && session.pairIndex === pairIndexRef.current) {
            return;
          }
        }
        callerOnPress?.(event);
      },
      [callerOnPress],
    );

    const handleAccessibilityAction = React.useCallback(
      (event: AccessibilityActionEvent): void => {
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
        const activeGroup = groupForResponder.current;
        if (activeGroup === null) {
          return;
        }
        activeGroup.requestStep(
          pairIndexRef.current,
          actionName === "increment" ? 1 : -1,
        );
      },
      [callerOnAccessibilityAction],
    );

    const bounds =
      group === null
        ? null
        : getPanelPairBounds(group.sizes, pairIndex, group.constraints);
    const leadingNow =
      bounds !== null
        ? bounds.now
        : ((group?.sizes[pairIndex] as number | undefined) ?? 0);
    const feasibleMin = bounds !== null ? bounds.min : leadingNow;
    const feasibleMax = bounds !== null ? bounds.max : leadingNow;
    const handleLabel =
      callerLabel ?? `Resize panels ${pairIndex + 1} and ${pairIndex + 2}`;
    const hasCustomIncrement =
      callerActions?.some((action) => action.name === "increment") ?? false;
    const hasCustomDecrement =
      callerActions?.some((action) => action.name === "decrement") ?? false;
    const handleActions = [
      ...(callerActions ?? []),
      ...(hasCustomIncrement ? [] : [{ name: "increment" as const }]),
      ...(hasCustomDecrement ? [] : [{ name: "decrement" as const }]),
    ];

    const baseHandleStyle: ViewStyle = {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      minHeight: 12,
      minWidth: 12,
    };
    // The wrapper sits in the group axis (row for horizontal, column for
    // vertical) and must never be squeezed by panel content, so it keeps an
    // explicit fixed extent with flexShrink 0. In Yoga, alignSelf stretch on a
    // column child only affects width, so a horizontal Pressable would keep a
    // 40px pill-height hit area at the top of a tall panel; flexGrow/flexBasis
    // on the Pressable fills the wrapper height instead. Vertical handles
    // keep a fixed height of 12 with full-bleed width via stretch.
    const wrapperStyle: ViewStyle =
      direction === "horizontal"
        ? { width: 12, flexShrink: 0, alignSelf: "stretch" }
        : { height: 12, flexShrink: 0, alignSelf: "stretch" };
    const orientationStyle: ViewStyle =
      direction === "horizontal"
        ? { width: 12, flexGrow: 1, flexBasis: 0, flexShrink: 1 }
        : { height: 12, alignSelf: "stretch" };
    const disabledStyle: ViewStyle = effectiveDisabled ? { opacity: 0.45 } : {};
    const composedStyle =
      typeof style === "function"
        ? (state: Parameters<Exclude<typeof style, ViewStyle>>[0]) => [
            baseHandleStyle,
            orientationStyle,
            disabledStyle,
            style(state),
          ]
        : [baseHandleStyle, orientationStyle, disabledStyle, style];

    const pillStyle: ViewStyle =
      direction === "horizontal"
        ? {
            backgroundColor: theme.colors.borderStrong,
            borderRadius: 999,
            height: 40,
            width: 4,
          }
        : {
            backgroundColor: theme.colors.borderStrong,
            borderRadius: 999,
            height: 4,
            width: 40,
          };

    const pressableElement = (
      <Pressable
        {...pressProps}
        ref={setPressableRef}
        testID={testID ?? "resizable-handle"}
        accessibilityRole="adjustable"
        accessible
        accessibilityLabel={handleLabel}
        accessibilityHint={callerHint}
        accessibilityValue={{
          min: feasibleMin,
          max: feasibleMax,
          now: leadingNow,
          text: callerValue?.text,
        }}
        accessibilityState={{ ...callerState, disabled: effectiveDisabled }}
        accessibilityActions={handleActions}
        onAccessibilityAction={handleAccessibilityAction}
        disabled={effectiveDisabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLayout={callerOnLayout}
        style={composedStyle}
      >
        {children ?? (withHandle ? <View style={pillStyle} /> : null)}
      </Pressable>
    );

    if (group === null) {
      return pressableElement;
    }

    const handlers = panResponder !== null ? panResponder.panHandlers : {};
    return (
      <View accessible={false} style={wrapperStyle} {...handlers}>
        {pressableElement}
      </View>
    );
  },
);

ResizableHandle.displayName = "ResizableHandle";

export const ResizablePanelGroup: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ResizablePanelGroupProps> &
    React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, ResizablePanelGroupProps>(
  (
    {
      children,
      direction,
      sizes: sizesProp,
      defaultSizes,
      onSizesChange,
      onSizesCommit,
      dir: dirProp,
      resizeStep: resizeStepProp,
      disabled = false,
      style,
      testID,
      onLayout: callerOnLayout,
      ...viewProps
    },
    ref,
  ) => {
    const theme = useTheme();
    const inherited = React.useContext(NativeDirectionContext);
    const effectiveDir = dirProp ?? inherited.dir ?? "ltr";
    const normalizedDir: "ltr" | "rtl" = effectiveDir === "rtl" ? "rtl" : "ltr";
    const resizeStep = sanitizeStep(resizeStepProp);
    const isVertical = direction === "vertical";

    type ViewHost = React.ElementRef<typeof View>;
    const setGroupRef = React.useCallback(
      (node: ViewHost | null) => setHostRef(ref, node),
      [ref],
    );

    const flat = flattenResizableChildren(children);
    if (flat.some(node => !React.isValidElement(node))) {
      throw new Error("ResizablePanelGroup: only ResizablePanel and ResizableHandle children are allowed.");
    }
    type PanelChild = React.ReactElement<ResizablePanelProps & PanelInjection>;
    type HandleChild = React.ReactElement<ResizableHandleProps & HandleInjection>;
    const elements = flat.filter(
      (node): node is PanelChild | HandleChild => React.isValidElement(node),
    );
    if (elements.length === 0) {
      throw new Error(
        "ResizablePanelGroup: at least one ResizablePanel is required.",
      );
    }
    for (const element of elements) {
      if (element.type !== ResizablePanel && element.type !== ResizableHandle) {
        throw new Error(
          "ResizablePanelGroup: only ResizablePanel and ResizableHandle are allowed as direct children.",
        );
      }
    }
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (first !== undefined && first.type === ResizableHandle) {
      throw new Error(
        "ResizablePanelGroup: handle cannot be the first child; handles must sit between panels.",
      );
    }
    if (last !== undefined && last.type === ResizableHandle) {
      throw new Error(
        "ResizablePanelGroup: handle cannot be the last child; handles must sit between panels.",
      );
    }
    for (let index = 1; index < elements.length; index += 1) {
      const previous = elements[index - 1];
      const current = elements[index];
      if (
        previous !== undefined &&
        current !== undefined &&
        previous.type === ResizableHandle &&
        current.type === ResizableHandle
      ) {
        throw new Error(
          "ResizablePanelGroup: handles must sit between panels (adjacent handles are not allowed).",
        );
      }
    }
    for (let index = 0; index < elements.length; index += 1) {
      const current = elements[index];
      if (current !== undefined && current.type === ResizableHandle) {
        const previous = elements[index - 1];
        const next = elements[index + 1];
        if (
          previous === undefined ||
          next === undefined ||
          previous.type !== ResizablePanel ||
          next.type !== ResizablePanel
        ) {
          throw new Error(
            `ResizablePanelGroup: handle at position ${index} must sit between two ResizablePanels.`,
          );
        }
      }
    }

    const panelElements = elements.filter(
      (element): element is PanelChild => element.type === ResizablePanel,
    );
    const panelCount = panelElements.length;
    const childKeys = JSON.stringify(elements.map(element => [
      element.type === ResizablePanel ? "panel" : "handle", element.key,
    ]));
    if (panelCount === 0) {
      throw new Error(
        "ResizablePanelGroup: at least one ResizablePanel is required.",
      );
    }

    const constraints: NativePanelConstraint[] = panelElements.map((panel) => ({
      defaultSize: panel.props.defaultSize,
      minSize: panel.props.minSize ?? 15,
      maxSize: panel.props.maxSize ?? 100,
    }));

    const minsKey = panelElements
      .map((panel) => `${panel.props.minSize ?? 15}`)
      .join(",");
    const maxsKey = panelElements
      .map((panel) => `${panel.props.maxSize ?? 100}`)
      .join(",");

    const [uncontrolledSizes, setUncontrolledSizes] = React.useState<number[]>(() =>
      resolvePanelSizes(constraints, defaultSizes),
    );

    // Render a feasible projection every render: when the uncontrolled state
    // still matches the current topology, normalize it through the strict math
    // (bounds + sum 100); when the panel count changed, fall back to fresh
    // defaults. Normalization never emits onSizesChange.
    const renderedSizes: readonly number[] =
      sizesProp !== undefined
        ? resolvePanelSizes(constraints, sizesProp)
        : uncontrolledSizes.length === panelCount
          ? resolvePanelSizes(constraints, uncontrolledSizes)
          : resolvePanelSizes(constraints, defaultSizes);

    const renderedRef = React.useRef<readonly number[]>(renderedSizes);
    renderedRef.current = renderedSizes;
    const constraintsRef = React.useRef<readonly NativePanelConstraint[]>(constraints);
    constraintsRef.current = constraints;
    const disabledRef = React.useRef(disabled);
    disabledRef.current = disabled;
    const stepRef = React.useRef(resizeStep);
    stepRef.current = resizeStep;
    const directionRef = React.useRef<ResizableDirection>(direction);
    directionRef.current = direction;
    const effectiveDirRef = React.useRef<"ltr" | "rtl">(normalizedDir);
    effectiveDirRef.current = normalizedDir;
    const sizesPropRef = React.useRef<readonly number[] | undefined>(sizesProp);
    sizesPropRef.current = sizesProp;
    const onChangeRef = React.useRef(onSizesChange);
    onChangeRef.current = onSizesChange;
    const onCommitRef = React.useRef(onSizesCommit);
    onCommitRef.current = onSizesCommit;
    const panelExtentsRef = React.useRef<number[]>([]);
    const groupExtentRef = React.useRef<number | null>(null);
    const sessionRef = React.useRef<GroupDragSession | null>(null);

    const cancelSession = React.useCallback((): void => {
      sessionRef.current = null;
    }, []);
    const cancelSessionRef = React.useRef(cancelSession);
    cancelSessionRef.current = cancelSession;

    const registerPanelLayout = React.useCallback(
      (index: number, extent: number): void => {
        if (!Number.isInteger(index) || index < 0) {
          return;
        }
        panelExtentsRef.current[index] = extent;
      },
      [],
    );

    const registerGroupLayout = React.useCallback((extent: number): void => {
      groupExtentRef.current = extent;
    }, []);

    const startSession = React.useCallback(
      (pairIndex: number, captureDelta: { dx: number; dy: number }): boolean => {
        if (sessionRef.current !== null) {
          return false;
        }
        if (disabledRef.current) {
          return false;
        }
        const rendered = renderedRef.current;
        if (
          !Number.isInteger(pairIndex) ||
          pairIndex < 0 ||
          pairIndex >= rendered.length - 1
        ) {
          return false;
        }
        // Zero is a valid per-panel extent (a panel at 0% with minSize 0 must
        // stay draggable back open); only the total span must be positive.
        const extents = panelExtentsRef.current;
        if (extents.length !== rendered.length) {
          return false;
        }
        for (let index = 0; index < rendered.length; index += 1) {
          const extent = extents[index] as number | undefined;
          if (typeof extent !== "number" || !Number.isFinite(extent) || extent < 0) {
            return false;
          }
        }
        const span = extents.reduce((total, extent) => total + extent, 0);
        if (!Number.isFinite(span) || span <= 0) {
          return false;
        }
        sessionRef.current = {
          pairIndex,
          snapshotSizes: [...rendered],
          snapshotSpan: span,
          snapshotGroupExtent: groupExtentRef.current,
          captureDelta: { dx: captureDelta.dx, dy: captureDelta.dy },
          pending: [],
          proposed: null,
          changed: false,
        };
        return true;
      },
      [],
    );

    // Controlled-acknowledgement policy (documented): a drag stays active
    // while the latest rendered sizes equal either the grant snapshot
    // (parent rejected or has not echoed yet) or any proposal previously
    // emitted during this drag (a controlled parent echoes asynchronously,
    // so an older echo may arrive after newer proposals were emitted, and
    // the rendered echo lags behind further moves). Entries strictly older
    // than the acknowledged one are pruned; the acknowledged entry is kept
    // because it may stay rendered across subsequent moves. Anything else
    // (a true external correction of the pair or any other panel) cancels
    // the session without commit; already reported onSizesChange values
    // are retained.
    const moveSession = React.useCallback(
      (pairIndex: number, totalPixels: number): void => {
        const session = sessionRef.current;
        if (session === null || session.pairIndex !== pairIndex) {
          return;
        }
        if (disabledRef.current) {
          sessionRef.current = null;
          return;
        }
        const currentGroup = groupExtentRef.current;
        const snapshotGroup = session.snapshotGroupExtent;
        if (
          snapshotGroup !== null &&
          currentGroup !== null &&
          Math.abs(currentGroup - snapshotGroup) > 0.5
        ) {
          sessionRef.current = null;
          return;
        }
        const latest = renderedRef.current;
        const snapshot = session.snapshotSizes;
        if (latest.length !== snapshot.length) {
          sessionRef.current = null;
          return;
        }
        if (!areSizesEqual(latest, snapshot)) {
          const acknowledged = session.pending.findIndex((sizes) => areSizesEqual(latest, sizes));
          if (acknowledged === -1) {
            sessionRef.current = null;
            return;
          }
          session.pending = session.pending.slice(acknowledged);
        }
        if (typeof totalPixels !== "number" || !Number.isFinite(totalPixels)) {
          return;
        }
        if (!Number.isFinite(session.snapshotSpan) || session.snapshotSpan <= 0) {
          return;
        }
        const horizontal = directionRef.current === "horizontal";
        const rtl = effectiveDirRef.current === "rtl";
        let logical = (totalPixels / session.snapshotSpan) * 100;
        if (horizontal && rtl) {
          logical = -logical;
        }
        const next: number[] = resizePanelPair(
          session.snapshotSizes,
          session.pairIndex,
          logical,
          constraintsRef.current,
        );
        const lastEmitted = session.proposed ?? session.snapshotSizes;
        if (areSizesEqual(next, lastEmitted)) {
          return;
        }
        session.pending.push(next);
        session.proposed = next;
        session.changed = true;
        if (sizesPropRef.current === undefined) {
          setUncontrolledSizes(next);
        }
        onChangeRef.current?.([...next]);
      },
      [],
    );

    const endSession = React.useCallback(
      (pairIndex: number, totalPixels: number | null): boolean => {
        const session = sessionRef.current;
        if (session === null || session.pairIndex !== pairIndex) {
          return false;
        }
        if (totalPixels !== null) {
          moveSession(pairIndex, totalPixels);
          const after = sessionRef.current;
          if (after === null || after.pairIndex !== pairIndex) {
            return true;
          }
          const changed = after.changed;
          const final = after.proposed;
          sessionRef.current = null;
          if (changed && final !== null) {
            onCommitRef.current?.([...final]);
          }
          return true;
        }
        const changed = session.changed;
        const final = session.proposed;
        sessionRef.current = null;
        if (changed && final !== null) {
          onCommitRef.current?.([...final]);
        }
        return true;
      },
      [moveSession],
    );

    const requestStep = React.useCallback(
      (pairIndex: number, stepDirection: 1 | -1): void => {
        if (disabledRef.current) {
          return;
        }
        const latest = renderedRef.current;
        const delta = stepDirection * stepRef.current;
        const next: number[] = resizePanelPair(latest, pairIndex, delta, constraintsRef.current);
        if (areSizesEqual(next, latest)) {
          return;
        }
        if (sizesPropRef.current === undefined) {
          setUncontrolledSizes(next);
        }
        onChangeRef.current?.([...next]);
        onCommitRef.current?.([...next]);
      },
      [],
    );

    const defaultSizesRef = React.useRef<readonly number[] | undefined>(defaultSizes);
    defaultSizesRef.current = defaultSizes;

    const cancelSignature = `${direction}|${normalizedDir}|${resizeStep}|${childKeys}|${minsKey}|${maxsKey}|${disabled}|${sizesProp !== undefined}`;
    React.useEffect(() => {
      cancelSessionRef.current();
    }, [cancelSignature]);

    const topologySignature = `${direction}|${childKeys}`;
    React.useEffect(() => {
      panelExtentsRef.current = [];
    }, [topologySignature]);

    React.useEffect(() => {
      if (sizesPropRef.current === undefined) {
        setUncontrolledSizes((previous) =>
          previous.length === panelCount
            ? previous
            : resolvePanelSizes(constraintsRef.current, defaultSizesRef.current),
        );
      }
    }, [panelCount]);

    React.useEffect(() => {
      return () => {
        sessionRef.current = null;
      };
    }, []);

    const handleGroupLayout = React.useCallback(
      (event: LayoutChangeEvent): void => {
        callerOnLayout?.(event);
        const layout = event.nativeEvent.layout;
        const extent = isVertical ? layout.height : layout.width;
        if (typeof extent === "number" && Number.isFinite(extent) && extent >= 0) {
          registerGroupLayout(extent);
        }
      },
      [callerOnLayout, isVertical, registerGroupLayout],
    );

    const contextValue: ResizableGroupContextValue = {
      direction,
      effectiveDir: normalizedDir,
      groupDisabled: disabled,
      resizeStep,
      sizes: renderedSizes,
      constraints,
      renderedRef,
      constraintsRef,
      disabledRef,
      stepRef,
      directionRef,
      effectiveDirRef,
      panelExtentsRef,
      groupExtentRef,
      sessionRef,
      startSession,
      moveSession,
      endSession,
      cancelSession,
      requestStep,
      registerPanelLayout,
      registerGroupLayout,
    };

    let panelsSeen = 0;
    let handlesSeen = 0;
    const isPanelChild = (
      child: PanelChild | HandleChild,
    ): child is PanelChild => child.type === ResizablePanel;
    const renderedChildren = elements.map((child) => {
      if (isPanelChild(child)) {
        const panelIndex = panelsSeen;
        panelsSeen += 1;
        const size = renderedSizes[panelIndex] as number;
        return React.cloneElement(child, {
          __size: size,
          __direction: direction,
          __panelIndex: panelIndex,
            key: child.key ?? `panel-${panelIndex}`,
        });
      }
      const panelsBefore = panelsSeen;
      const pairIndex = panelsBefore - 1;
      const handleOrder = handlesSeen;
      handlesSeen += 1;
      return React.cloneElement(child, {
        __pairIndex: pairIndex,
          key: child.key ?? `handle-${handleOrder}`,
      });
    });

    return (
      <ResizableGroupContext.Provider value={contextValue}>
        <View
          {...viewProps}
          ref={setGroupRef}
          testID={testID ?? "resizable-panel-group"}
          onLayout={handleGroupLayout}
          style={[
            {
              overflow: "hidden",
              borderRadius: theme.radius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              minHeight: 192,
            },
            style,
            {
              flexDirection: isVertical ? "column" : "row",
              direction: normalizedDir,
            },
          ]}
        >
          {renderedChildren}
        </View>
      </ResizableGroupContext.Provider>
    );
  },
);

ResizablePanelGroup.displayName = "ResizablePanelGroup";
