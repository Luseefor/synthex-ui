import * as React from "react";
import { Pressable, type PressableProps } from "react-native";
import { NativeDirectionContext } from "./direction-context.native";
import { renderNativeInlineText } from "./native-text";
import { useTheme } from "./theme/context";

/** Compose React 19 cleanup refs without losing void-callback detach notifications. */
export function mergeNativePressableRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    const cleanups: Array<() => void> = [];
    for (const ref of refs) {
      if (typeof ref === "function") {
        const cleanup = ref(node);
        cleanups.push(typeof cleanup === "function" ? cleanup : () => { ref(null); });
      } else if (ref != null) {
        ref.current = node;
        cleanups.push(() => { ref.current = null; });
      }
    }
    return () => { for (const cleanup of cleanups) cleanup(); };
  };
}

export function getNativeChildRef<T>(child: React.ReactElement): React.Ref<T> | undefined {
  return (child.props as { readonly ref?: React.Ref<T> }).ref;
}

/** Evaluate both callback styles with the same Pressable state, then merge child last. */
export function composeNativePressableStyles(
  parent: PressableProps["style"],
  child: PressableProps["style"],
): PressableProps["style"] {
  if (typeof parent === "function" || typeof child === "function") {
    return (state) => [
      typeof parent === "function" ? parent(state) : parent,
      typeof child === "function" ? child(state) : child,
    ];
  }
  return [parent, child];
}

export interface NativePressableActionProps extends Omit<PressableProps, "children"> {
  readonly children?: React.ReactNode;
  readonly asChild?: boolean;
  readonly onAction: () => void;
  readonly activation?: "press" | "longPress";
  readonly expanded?: boolean;
  readonly defaultTestID: string;
  readonly defaultRole?: PressableProps["accessibilityRole"];
  readonly forwardedRef?: React.Ref<React.ElementRef<typeof Pressable>>;
}

export function NativePressableAction({
  children, asChild, onAction, activation = "press", expanded, defaultTestID, defaultRole = "button", forwardedRef,
  onPress, onLongPress, onPressIn, onPressOut, onHoverIn, onHoverOut, onFocus, onBlur,
  disabled, accessibilityState, accessibilityRole, style, testID, ...props
}: NativePressableActionProps) {
  const { dir } = React.useContext(NativeDirectionContext);
  const theme = useTheme();
  const child = asChild && React.isValidElement<PressableProps & { ref?: React.Ref<React.ElementRef<typeof Pressable>> }>(children)
    ? children : null;
  const childRef = child ? getNativeChildRef<React.ElementRef<typeof Pressable>>(child) : undefined;
  const mergedRef = React.useMemo(() => mergeNativePressableRefs(forwardedRef, childRef), [forwardedRef, childRef]);
  const isDisabled = !!disabled || !!child?.props.disabled;
  const state = {
    ...child?.props.accessibilityState, ...accessibilityState,
    disabled: isDisabled,
    ...(expanded === undefined ? {} : { expanded }),
  };
  function compose<E extends { readonly defaultPrevented?: boolean }>(
    childHandler: ((event: E) => void) | null | undefined,
    parentHandler: ((event: E) => void) | null | undefined,
    action?: () => void,
    guardDisabled = true,
  ) {
    if (!childHandler && !parentHandler && !action) return undefined;
    return (event: E) => {
      if (guardDisabled && isDisabled) return;
      childHandler?.(event);
      if (event.defaultPrevented) return;
      parentHandler?.(event);
      if (!event.defaultPrevented) action?.();
    };
  }
  const mergedStyle = child ? composeNativePressableStyles(style, child.props.style) : style;
  const directedStyle: PressableProps["style"] = typeof mergedStyle === "function"
    ? state => [mergedStyle(state), { direction: dir }]
    : [mergedStyle, { direction: dir }];
  const actionProps: PressableProps & { ref?: React.Ref<React.ElementRef<typeof Pressable>> } = {
    ...props,
    ref: child ? mergedRef : forwardedRef,
    testID: child?.props.testID ?? testID ?? defaultTestID,
    accessibilityRole: accessibilityRole ?? child?.props.accessibilityRole ?? defaultRole,
    accessibilityState: state,
    disabled: isDisabled,
    style: directedStyle,
    onPress: compose(child?.props.onPress, onPress, activation === "press" ? onAction : undefined),
    onLongPress: compose(child?.props.onLongPress, onLongPress, activation === "longPress" ? onAction : undefined),
    onPressIn: compose(child?.props.onPressIn, onPressIn),
    onPressOut: compose(child?.props.onPressOut, onPressOut),
    onHoverIn: compose(child?.props.onHoverIn, onHoverIn, undefined, false),
    onHoverOut: compose(child?.props.onHoverOut, onHoverOut, undefined, false),
    onFocus: compose(child?.props.onFocus, onFocus, undefined, false),
    onBlur: compose(child?.props.onBlur, onBlur, undefined, false),
  };
  return child ? React.cloneElement(child, actionProps) : (
    <Pressable {...actionProps}>
      {renderNativeInlineText(children, {
        color: theme.colors.foreground,
        fontFamily: theme.typography.family.sans,
        fontSize: theme.typography.size.sm,
      })}
    </Pressable>
  );
}
