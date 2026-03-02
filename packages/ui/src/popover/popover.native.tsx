import * as React from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
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
  readonly style?: StyleProp<ViewStyle>;
}

export function Popover({
  children,
  defaultOpen,
  onOpenChange,
  open,
  style,
  ...props
}: PopoverProps) {
  const controller = usePopoverController({ defaultOpen, onOpenChange, open });

  return (
    <PopoverProvider value={controller}>
      <View style={[{ position: "relative" }, style]} {...props}>
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
>(({ children, onPress, style, asChild, ...props }, ref) => {
  const context = usePopoverContext();

  const handlePress = React.useCallback(
    (event: any) => {
      context.setOpen(!context.open);
      onPress?.(event);
    },
    [context, onPress]
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      ...props,
      onPress: (e: any) => {
        handlePress(e);
        (children.props as any).onPress?.(e);
      },
    });
  }

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      style={style}
      {...props}
    >
      {children}
    </Pressable>
  );
});

PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof View>,
  PopoverContentProps
>(({ style, ...props }, ref) => {
  const context = usePopoverContext();
  const theme = useTheme();

  if (!context.open) {
    return null;
  }

  return (
    <View
      ref={ref}
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
