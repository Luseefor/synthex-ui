import * as React from "react";
import {
  Pressable,
  Text,
  type TextProps,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { NativeOverlayProvider, NativeOverlayContent, useNativeOverlayTriggerRef } from "../_shared/overlay.native";
import { NativePressableAction } from "../_shared/pressable.native";
import { useTheme } from "../_shared/theme/context";
import type { OverlayPositionProps } from "../_shared/positioning";
import {
  TooltipProvider,
  useTooltipContext,
  useTooltipController,
  type TooltipSharedProps,
} from "./tooltip.shared";

export interface TooltipProps
  extends Omit<ViewProps, "children" | "style">, TooltipSharedProps {
  readonly children: React.ReactNode;
  readonly delayDuration?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly dir?: "ltr" | "rtl";
}

export function Tooltip({ children, defaultOpen, delayDuration, dir, onOpenChange, open, style, testID, ...props }: TooltipProps) {
  // Native uses an explicit tap-toggle surface; web hover delays do not apply.
  void delayDuration;
  const controller = useTooltipController({ defaultOpen, onOpenChange, open });
  return <NativeOverlayProvider dir={dir}><TooltipProvider value={controller}>
    <View {...props} testID={testID ?? "tooltip"} style={[{ position: "relative" }, style]}>{children}</View>
  </TooltipProvider></NativeOverlayProvider>;
}

export interface TooltipTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: PressableProps["style"];
  readonly asChild?: boolean;
}

export const TooltipTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TooltipTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, TooltipTriggerProps>((props, ref) => {
  const context = useTooltipContext();
  const anchorRef = useNativeOverlayTriggerRef(ref);
  return <NativePressableAction {...props} forwardedRef={anchorRef} collapsable={false}
    defaultTestID="tooltip-trigger" expanded={context.open} onAction={() => context.setOpen(!context.open)} />;
});
TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps extends Omit<TextProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<TextStyle>;
  readonly containerStyle?: StyleProp<ViewStyle>;
  /** Escape belongs to the overlay surface; RN 0.88 Text no longer exposes it. */
  readonly onAccessibilityEscape?: () => void;
}

// Keep the public ref and Text props on the explanatory text, not its portal shell.
export const TooltipContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TooltipContentProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<React.ElementRef<typeof Text>, TooltipContentProps>(
  ({ align, alignOffset, side, sideOffset, style, containerStyle, testID = "tooltip-content", onAccessibilityEscape, ...props }, ref) => {
    const context = useTooltipContext();
    const theme = useTheme();
    return <NativeOverlayContent open={context.open} onDismiss={() => context.setOpen(false)}
      side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}
      testID={testID + "-surface"} onAccessibilityEscape={onAccessibilityEscape} style={[{ minWidth: 160 }, containerStyle]}>
      <Text {...props} ref={ref} testID={testID} style={[
        { borderRadius: theme.radius.md, backgroundColor: "#0f172a", color: "#ffffff",
          paddingHorizontal: 12, paddingVertical: 8, fontFamily: theme.typography.family.sans,
          fontSize: theme.typography.size.xs, fontWeight: theme.typography.weight.medium }, style,
      ]} />
    </NativeOverlayContent>;
  },
);
TooltipContent.displayName = "TooltipContent";
