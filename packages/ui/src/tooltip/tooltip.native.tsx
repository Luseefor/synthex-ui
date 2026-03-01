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
  readonly style?: StyleProp<ViewStyle>;
}

export function Tooltip({
  children,
  defaultOpen,
  onOpenChange,
  open,
  style,
  ...props
}: TooltipProps) {
  const controller = useTooltipController({ defaultOpen, onOpenChange, open });

  return (
    <TooltipProvider value={controller}>
      <View style={[{ position: "relative" }, style]} {...props}>
        {children}
      </View>
    </TooltipProvider>
  );
}

export interface TooltipTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  TooltipTriggerProps
>(({ children, onHoverIn, onHoverOut, onPressIn, onPressOut, style, ...props }, ref) => {
  const context = useTooltipContext();

  return (
    <Pressable
      ref={ref}
      onHoverIn={(event) => {
        context.setOpen(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        context.setOpen(false);
        onHoverOut?.(event);
      }}
      onPressIn={(event) => {
        context.setOpen(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        context.setOpen(false);
        onPressOut?.(event);
      }}
      style={style}
      {...props}
    >
      {children}
    </Pressable>
  );
});

TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const TooltipContent = React.forwardRef<React.ElementRef<typeof Text>, TooltipContentProps>(
  ({ style, ...props }, ref) => {
    const context = useTooltipContext();
    const theme = useTheme();

    if (!context.open) {
      return null;
    }

    return (
      <Text
        ref={ref}
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
