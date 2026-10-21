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
import { useTheme } from "../_shared/theme/context";
import type { OverlayPositionProps } from "../_shared/positioning";
import {
  TooltipProvider,
  useTooltipContext,
  useTooltipController,
  type TooltipSharedProps,
} from "./tooltip.shared";

export interface TooltipProps
  extends Omit<ViewProps, "children" | "style">,
  TooltipSharedProps {
  readonly children: React.ReactNode;
  readonly delayDuration?: number;
  readonly style?: StyleProp<ViewStyle>;
}

export function Tooltip({
  children,
  defaultOpen,
  delayDuration,
  onOpenChange,
  open,
  style,
  testID,
  ...props
}: TooltipProps) {
  // Accepted for web API parity but ignored on native (no hover delay).
  void delayDuration;
  const controller = useTooltipController({ defaultOpen, onOpenChange, open });

  return (
    <TooltipProvider value={controller}>
      <View testID={testID ?? "tooltip"} style={[{ position: "relative" }, style]} {...props}>
        {children}
      </View>
    </TooltipProvider>
  );
}

export interface TooltipTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const TooltipTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TooltipTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  TooltipTriggerProps
>(({ children, onHoverIn, onHoverOut, onPressIn, onPressOut, style, asChild, testID, ...props }, ref) => {
  const context = useTooltipContext();

  type HoverInEvent = Parameters<NonNullable<PressableProps["onHoverIn"]>>[0];
  type HoverOutEvent = Parameters<NonNullable<PressableProps["onHoverOut"]>>[0];
  type PressInEvent = Parameters<NonNullable<PressableProps["onPressIn"]>>[0];
  type PressOutEvent = Parameters<NonNullable<PressableProps["onPressOut"]>>[0];

  const handleHoverIn = React.useCallback((event: HoverInEvent) => { context.setOpen(true); onHoverIn?.(event); }, [context, onHoverIn]);
  const handleHoverOut = React.useCallback((event: HoverOutEvent) => { context.setOpen(false); onHoverOut?.(event); }, [context, onHoverOut]);
  const handlePressIn = React.useCallback((event: PressInEvent) => { context.setOpen(true); onPressIn?.(event); }, [context, onPressIn]);
  const handlePressOut = React.useCallback((event: PressOutEvent) => { context.setOpen(false); onPressOut?.(event); }, [context, onPressOut]);

  type AsChildProps = {
    onHoverIn?: PressableProps["onHoverIn"];
    onHoverOut?: PressableProps["onHoverOut"];
    onPressIn?: PressableProps["onPressIn"];
    onPressOut?: PressableProps["onPressOut"];
    [key: string]: unknown;
  };

  if (asChild && React.isValidElement<AsChildProps>(children)) {
    return React.cloneElement(children, {
      ref,
      testID: (children.props as { testID?: string }).testID ?? testID ?? "tooltip-trigger",
      ...props,
      onHoverIn: (e: HoverInEvent) => { handleHoverIn(e); children.props.onHoverIn?.(e); },
      onHoverOut: (e: HoverOutEvent) => { handleHoverOut(e); children.props.onHoverOut?.(e); },
      onPressIn: (e: PressInEvent) => { handlePressIn(e); children.props.onPressIn?.(e); },
      onPressOut: (e: PressOutEvent) => { handlePressOut(e); children.props.onPressOut?.(e); },
    });
  }

  return (
    <Pressable
      ref={ref}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
      testID={testID ?? "tooltip-trigger"}
      {...props}
    >
      {children}
    </Pressable>
  );
});

TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps extends Omit<TextProps, "style">, OverlayPositionProps {
  readonly style?: StyleProp<TextStyle>;
}

// Native renders in normal flow; side/align/sideOffset/alignOffset are accepted for API parity and ignored.
export const TooltipContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TooltipContentProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<React.ElementRef<typeof Text>, TooltipContentProps>(
  ({ align, alignOffset, side, sideOffset, style, testID, ...props }, ref) => {
    const context = useTooltipContext();
    const theme = useTheme();

    void align;
    void alignOffset;
    void side;
    void sideOffset;

    if (!context.open) {
      return null;
    }

    return (
      <Text
        ref={ref}
        testID={testID ?? "tooltip-content"}
        style={[
          {
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 8,
            borderRadius: theme.radius.md,
            backgroundColor: "#0f172a",
            color: "#ffffff",
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.xs,
            fontWeight: theme.typography.weight.medium,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

TooltipContent.displayName = "TooltipContent";
