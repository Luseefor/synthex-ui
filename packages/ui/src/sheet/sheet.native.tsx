import * as React from "react";
import {
  Modal,
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
import { CloseIcon } from "../icons/index.native";
import { useTheme } from "../_shared/theme/context";
import {
  DialogProvider as SheetProvider,
  useDialogContext as useSheetContext,
  useDialogController as useSheetController,
  type DialogSharedProps,
} from "../dialog/dialog.shared";

export interface SheetProps extends DialogSharedProps {
  readonly children: React.ReactNode;
}

export function Sheet({ children, defaultOpen, onOpenChange, open }: SheetProps) {
  const controller = useSheetController({ defaultOpen, onOpenChange, open });

  return <SheetProvider value={controller}>{children}</SheetProvider>;
}

export interface SheetTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly asChild?: boolean;
}

export const SheetTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  SheetTriggerProps
>(({ children, onPress, style, asChild, ...props }, ref) => {
  const context = useSheetContext();

  const handlePress = React.useCallback(
    (event: any) => {
      context.setOpen(true);
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

SheetTrigger.displayName = "SheetTrigger";

export const SheetClose = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  SheetTriggerProps
>(({ children, onPress, style, asChild, ...props }, ref) => {
  const context = useSheetContext();

  const handlePress = React.useCallback(
    (event: any) => {
      context.setOpen(false);
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

SheetClose.displayName = "SheetClose";

export interface SheetContentProps extends Omit<ViewProps, "style"> {
  readonly side?: "left" | "right";
  readonly style?: StyleProp<ViewStyle>;
}

export const SheetContent = React.forwardRef<React.ElementRef<typeof View>, SheetContentProps>(
  ({ children, side = "right", style, ...props }, ref) => {
    const context = useSheetContext();
    const theme = useTheme();

    if (!context.open) {
      return null;
    }

    return (
      <Modal
        transparent
        animationType="fade"
        visible={context.open}
        onRequestClose={() => context.setOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.38)",
          }}
          onPress={() => context.setOpen(false)}
        >
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              [side]: 0,
              width: "100%",
              maxWidth: 420,
            } as ViewStyle}
            onPress={(event) => event.stopPropagation()}
          >
            <View
              ref={ref}
              style={[
                {
                  flex: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  padding: 24,
                },
                side === "right"
                  ? { borderLeftWidth: 1 }
                  : { borderRightWidth: 1 },
                style,
              ]}
              {...props}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => context.setOpen(false)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 16,
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.colors.surface,
                }}
              >
                <CloseIcon size={16} />
              </Pressable>
              {children}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

SheetContent.displayName = "SheetContent";

export interface SheetSectionProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const SheetHeader = React.forwardRef<React.ElementRef<typeof View>, SheetSectionProps>(
  ({ style, ...props }, ref) => <View ref={ref} style={[{ gap: 8 }, style]} {...props} />,
);

SheetHeader.displayName = "SheetHeader";

export interface SheetTextProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const SheetTitle = React.forwardRef<React.ElementRef<typeof Text>, SheetTextProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        style={[
          {
            color: theme.colors.foreground,
            fontFamily: theme.typography.family.sans,
            fontSize: theme.typography.size.xl,
            fontWeight: theme.typography.weight.semibold,
            letterSpacing: -0.4,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof Text>,
  SheetTextProps
>(({ style, ...props }, ref) => {
  const theme = useTheme();

  return (
    <Text
      ref={ref}
      style={[
        {
          color: theme.colors.foregroundMuted,
          fontFamily: theme.typography.family.sans,
          fontSize: theme.typography.size.sm,
          lineHeight: theme.typography.size.sm * theme.typography.lineHeight.relaxed,
        },
        style,
      ]}
      {...props}
    />
  );
});

SheetDescription.displayName = "SheetDescription";

export const SheetFooter = React.forwardRef<React.ElementRef<typeof View>, SheetSectionProps>(
  ({ style, ...props }, ref) => (
    <View
      ref={ref}
      style={[{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 12 }, style]}
      {...props}
    />
  ),
);

SheetFooter.displayName = "SheetFooter";
