import * as React from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import type { OverlayPositionProps } from "../_shared/positioning";
import { NativeOverlayProvider, NativeOverlayContent, useNativeOverlayTriggerRef } from "../_shared/overlay.native";
import { NativePressableAction } from "../_shared/pressable.native";
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
  readonly dir?: "ltr" | "rtl";
}

export function HoverCard({
  children,
  dir,
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
    <NativeOverlayProvider dir={dir}><HoverCardProvider value={controller}>
      <View testID={testID ?? "hover-card"} style={[{ position: "relative" }, style]} {...props}>
        {children}
      </View>
    </HoverCardProvider></NativeOverlayProvider>
  );
}

export interface HoverCardTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: PressableProps["style"];
  readonly asChild?: boolean;
}

export const HoverCardTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<HoverCardTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, HoverCardTriggerProps>((props, ref) => {
  const context = useHoverCardContext();
  const anchorRef = useNativeOverlayTriggerRef(ref);
  return <NativePressableAction {...props} forwardedRef={anchorRef} collapsable={false}
    defaultTestID="hover-card-trigger" activation="press" expanded={context.open} onAction={() => context.setOpen(!context.open)} />;
});
HoverCardTrigger.displayName = "HoverCardTrigger";

export interface HoverCardContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<ViewStyle>;
}

export const HoverCardContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<HoverCardContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<
  React.ElementRef<typeof View>,
  HoverCardContentProps
>(({ align, alignOffset, side, sideOffset, style, testID, ...props }, ref) => {
  const context = useHoverCardContext();
  const theme = useTheme();


  return (
    <NativeOverlayContent
      open={context.open} onDismiss={() => context.setOpen(false)}
      side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}
      ref={ref}
      testID={testID ?? "hover-card-content"}
      style={[
        {
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
