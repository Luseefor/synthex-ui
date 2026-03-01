import * as React from "react";
import { Pressable, View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import {
  CollapsibleProvider,
  useCollapsibleContext,
  useCollapsibleController,
  type CollapsibleSharedProps,
} from "./collapsible.shared";

export interface CollapsibleProps extends Omit<ViewProps, "style">, CollapsibleSharedProps {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export function Collapsible({ children, defaultOpen, disabled, onOpenChange, open, style, ...props }: CollapsibleProps) {
  const controller = useCollapsibleController({ defaultOpen, disabled, onOpenChange, open });
  return (
    <CollapsibleProvider value={controller}>
      <View style={style} {...props}>{children}</View>
    </CollapsibleProvider>
  );
}

export interface CollapsibleTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export const CollapsibleTrigger = React.forwardRef<React.ElementRef<typeof Pressable>, CollapsibleTriggerProps>(
  ({ children, onPress, style, ...props }, ref) => {
    const context = useCollapsibleContext();
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: context.disabled, expanded: context.open }}
        disabled={context.disabled}
        onPress={(event) => {
          onPress?.(event);
          if (!event.defaultPrevented && !context.disabled) {
            context.setOpen(!context.open);
          }
        }}
        style={style}
        {...props}
      >
        {children}
      </Pressable>
    );
  },
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

export interface CollapsibleContentProps extends Omit<ViewProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

export const CollapsibleContent = React.forwardRef<React.ElementRef<typeof View>, CollapsibleContentProps>(
  ({ children, style, ...props }, ref) => {
    const context = useCollapsibleContext();
    if (!context.open) {
      return null;
    }
    return <View ref={ref} style={style} {...props}>{children}</View>;
  },
);
CollapsibleContent.displayName = "CollapsibleContent";
