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
import { useTheme } from "../_shared/theme/context";
import {
  HoverCardProvider,
  useHoverCardContext,
  useHoverCardController,
  type HoverCardSharedProps,
} from "./hover-card.shared";

export interface HoverCardProps
  extends Omit<ViewProps, "children" | "style">,
  HoverCardSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export function HoverCard({
  children,
  closeDelay,
  defaultOpen,
  onOpenChange,
  open,
  openDelay,
  style,
  testID,
  ...props
}: HoverCardProps) {
  const controller = useHoverCardController({
    closeDelay,
    defaultOpen,
    onOpenChange,
    open,
    openDelay,
  });

  return (
    <HoverCardProvider value={controller}>
      <View testID={testID ?? "hover-card"} style={[{ position: "relative" }, style]} {...props}>
        {children}
      </View>
    </HoverCardProvider>
  );
}

export interface HoverCardTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const HoverCardTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<HoverCardTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  HoverCardTriggerProps
>(({ children, onPress, style, asChild, testID, ...props }, ref) => {
  const context = useHoverCardContext();

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      context.setOpen(!context.open);
      onPress?.(event);
    },
    [context, onPress],
  );

  type AsChildProps = {
    onPress?: ((event: GestureResponderEvent) => void) | null;
    [key: string]: unknown;
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      testID: (children.props as { testID?: string }).testID ?? testID ?? "hover-card-trigger",
      ...props,
      onPress: (e: GestureResponderEvent) => {
        handlePress(e);
        children.props.onPress?.(e);
      },
    });
  }

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      onHoverIn={() => context.setOpen(true)}
      onHoverOut={() => context.setOpen(false)}
      style={style}
      testID={testID ?? "hover-card-trigger"}
      {...props}
    >
      {children}
    </Pressable>
  );
});

HoverCardTrigger.displayName = "HoverCardTrigger";

export interface HoverCardContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<ViewStyle>;
}

// Native renders in normal flow; side/align/sideOffset/alignOffset are accepted for API parity and ignored.
export const HoverCardContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<HoverCardContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  HoverCardContentProps
>(({ align, alignOffset, side, sideOffset, style, testID, ...props }, ref) => {
  const context = useHoverCardContext();
  const theme = useTheme();

  void align;
  void alignOffset;
  void side;
  void sideOffset;

  if (!context.open) {
    return null;
  }

  return (
    <View
      ref={ref}
      testID={testID ?? "hover-card-content"}
      style={[
        {
          marginTop: 8,
          minWidth: 256,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.surface,
          padding: 16,
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

HoverCardContent.displayName = "HoverCardContent";
