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
  PopoverProvider,
  usePopoverContext,
  usePopoverController,
  type PopoverSharedProps,
} from "./popover.shared";

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
    <PopoverProvider value={controller}>
      <View testID={testID ?? "popover"} style={[{ position: "relative" }, style]} {...props}>
        {children}
      </View>
    </PopoverProvider>
  );
}

export interface PopoverTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PopoverTriggerProps
>(({ children, onPress, style, asChild, testID, ...props }, ref) => {
  const context = usePopoverContext();

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      context.setOpen(!context.open);
      onPress?.(event);
    },
    [context, onPress]
  );

  type AsChildProps = {
    onPress?: ((event: GestureResponderEvent) => void) | null;
    [key: string]: unknown;
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      testID: (children.props as { testID?: string }).testID ?? testID ?? "popover-trigger",
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

// Native renders in normal flow; side/align/sideOffset/alignOffset are accepted for API parity and ignored.
export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof View>,
  PopoverContentProps
>(({ align, alignOffset, side, sideOffset, style, testID, ...props }, ref) => {
  const context = usePopoverContext();
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
      testID={testID ?? "popover-content"}
      style={[
        {
          marginTop: 8,
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
