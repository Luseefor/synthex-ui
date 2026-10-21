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
  readonly testID?: string;
}

export function Collapsible({ children, defaultOpen, disabled, onOpenChange, open, style, testID, ...props }: CollapsibleProps) {
  const controller = useCollapsibleController({ defaultOpen, disabled, onOpenChange, open });
  return (
    <CollapsibleProvider value={controller}>
      <View testID={testID ?? "collapsible"} style={style} {...props}>{children}</View>
    </CollapsibleProvider>
  );
}

export interface CollapsibleTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
  readonly testID?: string;
}

export const CollapsibleTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CollapsibleTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, CollapsibleTriggerProps>(
  ({ children, onPress, style, asChild, testID, ...props }, ref) => {
    const context = useCollapsibleContext();

    const handlePress = (event: Parameters<NonNullable<typeof onPress>>[0]) => {
      onPress?.(event);
      if (!event.defaultPrevented && !context.disabled) {
        context.setOpen(!context.open);
      }
    };

    type AsChildProps = {
      onPress?: ((event: Parameters<NonNullable<typeof onPress>>[0]) => void) | null;
      [key: string]: unknown;
    };

    if (asChild && React.isValidElement<AsChildProps>(children)) {
      return React.cloneElement(children, {
        ref,
        testID: (children.props as { testID?: string }).testID ?? testID ?? "collapsible-trigger",
        ...props,
        onPress: (e: Parameters<NonNullable<typeof onPress>>[0]) => {
          handlePress(e);
          children.props.onPress?.(e);
        },
      });
    }

    return (
      <Pressable
        ref={ref}
        testID={testID ?? "collapsible-trigger"}
        accessibilityRole="button"
        accessibilityState={{ disabled: context.disabled, expanded: context.open }}
        disabled={context.disabled}
        onPress={handlePress}
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
  readonly forceMount?: boolean;
  readonly asChild?: boolean;
  readonly testID?: string;
}

export const CollapsibleContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<CollapsibleContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, CollapsibleContentProps>(
  ({ children, forceMount = false, style, asChild, testID, ...props }, ref) => {
    const context = useCollapsibleContext();
    if (!context.open && !forceMount) {
      return null;
    }
    type AsChildContentProps = {
      style?: StyleProp<ViewStyle>;
      [key: string]: unknown;
    };
    if (asChild && React.isValidElement<AsChildContentProps>(children)) {
      return React.cloneElement(children, {
        ref,
        testID: (children.props as { testID?: string }).testID ?? testID ?? "collapsible-content",
        ...props,
        style: [style, !context.open && { display: "none" }, children.props.style],
      });
    }
    return (
      <View ref={ref} testID={testID ?? "collapsible-content"} style={[style, !context.open && { display: "none" }]} {...props}>
        {children}
      </View>
    );
  },
);
CollapsibleContent.displayName = "CollapsibleContent";
