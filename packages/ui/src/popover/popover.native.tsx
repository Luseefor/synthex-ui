import * as React from "react";
import {
  Pressable,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import type { OverlayPositionProps } from "../_shared/positioning";
import {
  NativeOverlayContent,
  NativeOverlayProvider,
  useNativeOverlayTriggerRef,
} from "../_shared/overlay.native";
import { useTheme } from "../_shared/theme/context";
import {
  PopoverProvider,
  usePopoverContext,
  usePopoverController,
  type PopoverSharedProps,
} from "./popover.shared";

function getChildRef<T>(child: React.ReactElement): React.Ref<T> | undefined {
  return (child.props as { readonly ref?: React.Ref<T> }).ref;
}

type ComposedTriggerStyle = PressableProps["style"];

function composeTriggerStyle(
  parent: StyleProp<ViewStyle> | undefined,
  child: unknown,
): ComposedTriggerStyle {
  if (typeof child === "function") {
    if (parent == null) {
      return child as ComposedTriggerStyle;
    }
    const childFn = child as (state: { pressed: boolean }) => StyleProp<ViewStyle>;
    return (state: { pressed: boolean }) => [parent, childFn(state)];
  }
  if (parent == null) {
    return child as ComposedTriggerStyle;
  }
  if (child == null) {
    return parent as ComposedTriggerStyle;
  }
  return [parent, child as StyleProp<ViewStyle>];
}

export interface PopoverProps
  extends Omit<ViewProps, "children" | "style">,
  PopoverSharedProps {
  readonly children: React.ReactNode;
  readonly modal?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

export function Popover({
  children,
  defaultOpen,
  modal,
  onOpenChange,
  open,
  style,
  testID,
  ...props
}: PopoverProps) {
  void modal;
  const controller = usePopoverController({ defaultOpen, onOpenChange, open });

  return (
    <NativeOverlayProvider>
      <PopoverProvider value={controller}>
        <View testID={testID ?? "popover"} style={[{ position: "relative" }, style]} {...props}>
          {children}
        </View>
      </PopoverProvider>
    </NativeOverlayProvider>
  );
}

export interface PopoverTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const PopoverTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<PopoverTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PopoverTriggerProps
>(({ children, onPress, style, asChild, testID, disabled, accessibilityState, accessibilityRole, ...props }, ref) => {
  const context = usePopoverContext();

  type AsChildProps = {
    onPress?: ((event: GestureResponderEvent) => void) | null;
    [key: string]: unknown;
  };

  const childElement =
    asChild && React.isValidElement<AsChildProps>(children) ? children : null;
  const childRef = childElement
    ? getChildRef<React.ElementRef<typeof View>>(childElement)
    : undefined;
  const mergedRef = useNativeOverlayTriggerRef(
    ref as React.Ref<React.ElementRef<typeof View>> | undefined,
    childRef,
  );

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      if (disabled === true) {
        return;
      }
      onPress?.(event);
      if ((event as { defaultPrevented?: boolean }).defaultPrevented) {
        return;
      }
      context.setOpen(!context.open);
    },
    [context, disabled, onPress]
  );

  if (childElement) {
    const childDisabled = (childElement.props as { readonly disabled?: boolean }).disabled;
    const resolvedDisabled = disabled === true || childDisabled === true;
    const childOnPress = childElement.props.onPress as
      | ((event: GestureResponderEvent) => void)
      | undefined;
    const childTestID = (childElement.props as { testID?: string }).testID;
    const childStyle = (childElement.props as { style?: PressableProps["style"] }).style;
    const childAccessibilityState = (childElement.props as { accessibilityState?: PressableProps["accessibilityState"] }).accessibilityState;
    const childRole = (childElement.props as { accessibilityRole?: PressableProps["accessibilityRole"] }).accessibilityRole;
    return React.cloneElement(childElement, {
      ref: mergedRef,
      testID: childTestID ?? testID ?? "popover-trigger",
      disabled: resolvedDisabled,
      collapsable: false,
      accessibilityRole: accessibilityRole ?? childRole ?? "button",
      ...props,
      accessibilityState: {
        ...childAccessibilityState,
        ...accessibilityState,
        expanded: context.open,
        disabled: resolvedDisabled,
      },
      style: composeTriggerStyle(style, childStyle),
      onPress: (event: GestureResponderEvent) => {
        if (resolvedDisabled) {
          return;
        }
        childOnPress?.(event);
        if ((event as { defaultPrevented?: boolean }).defaultPrevented) {
          return;
        }
        onPress?.(event);
        if ((event as { defaultPrevented?: boolean }).defaultPrevented) {
          return;
        }
        context.setOpen(!context.open);
      },
    });
  }

  return (
    <Pressable
      ref={mergedRef as unknown as React.Ref<React.ElementRef<typeof Pressable>>}
      onPress={handlePress}
      accessibilityRole={accessibilityRole ?? "button"}
      accessibilityState={{ ...accessibilityState, expanded: context.open, disabled: !!disabled }}
      disabled={disabled}
      collapsable={false}
      style={style}
      testID={testID ?? "popover-trigger"}
      {...props}
    >
      {children}
    </Pressable>
  );
});

PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const PopoverContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<PopoverContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  PopoverContentProps
>(({ align, alignOffset, side, sideOffset, style, testID, ...props }, ref) => {
  const context = usePopoverContext();
  const theme = useTheme();

  return (
    <NativeOverlayContent
      ref={ref}
      open={context.open}
      onDismiss={() => context.setOpen(false)}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      testID={testID ?? "popover-content"}
      style={[
        {
          minWidth: 224,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.surface,
          padding: 12,
          shadowColor: "#0f172a",
          shadowOpacity: 0.14,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
        },
        style,
      ]}
      {...props}
    />
  );
});

PopoverContent.displayName = "PopoverContent";
