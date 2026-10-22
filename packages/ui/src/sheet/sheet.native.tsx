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
  type ModalProps,
} from "react-native";
import { CloseIcon } from "../icons/index.native";
import { NativeDirectionContext } from "../_shared/direction-context.native";
import { NativeModalAction, NativeModalSurface } from "../_shared/modal-actions.native";
import { useTheme } from "../_shared/theme/context";
import {
  DialogProvider as SheetProvider,
  useDialogContext as useSheetContext,
  useDialogController as useSheetController,
  type DialogSharedProps,
} from "../dialog/dialog.shared";

export interface SheetProps extends DialogSharedProps {
  readonly children: React.ReactNode;
  readonly modal?: boolean;
  readonly dir?: "ltr" | "rtl";
}

export function Sheet({ children, defaultOpen, modal, onOpenChange, open, dir }: SheetProps) {
  void modal;
  const controller = useSheetController({ defaultOpen, onOpenChange, open });
  const inherited = React.useContext(NativeDirectionContext);
  const direction = React.useMemo(() => ({ ...inherited, dir: dir ?? inherited.dir }), [inherited, dir]);
  return <NativeDirectionContext.Provider value={direction}>
    <SheetProvider value={controller}>{children}</SheetProvider>
  </NativeDirectionContext.Provider>;
}

export interface SheetTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: PressableProps["style"];
  readonly asChild?: boolean;
}

export const SheetTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, SheetTriggerProps>((props, ref) => {
  const context = useSheetContext();
  return <NativeModalAction {...props} forwardedRef={ref} defaultTestID="sheet-trigger" expanded={context.open} onAction={() => context.setOpen(true)} />;
});
SheetTrigger.displayName = "SheetTrigger";

export const SheetClose: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, SheetTriggerProps>((props, ref) => {
  const context = useSheetContext();
  return <NativeModalAction {...props} forwardedRef={ref} defaultTestID="sheet-close" onAction={() => context.setOpen(false)} />;
});
SheetClose.displayName = "SheetClose";

export interface SheetContentProps extends Omit<ViewProps, "style"> {
  readonly modalProps?: Omit<ModalProps, "children" | "transparent" | "visible">;
  readonly hideClose?: boolean;
  readonly closeLabel?: string;
  readonly dismissible?: boolean;
  readonly side?: "top" | "right" | "bottom" | "left";
  readonly style?: StyleProp<ViewStyle>;
}

export const SheetContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, SheetContentProps>(({ side, dismissible, ...props }, ref) => {
  const context = useSheetContext();
  const { dir } = React.useContext(NativeDirectionContext);
  return <NativeModalSurface {...props} family="sheet" closeIcon={<CloseIcon size={16} />} contentRef={ref} open={context.open} setOpen={context.setOpen}
    dir={dir} side={side ?? "right"} dismissible={dismissible ?? true} />;
});
SheetContent.displayName = "SheetContent";

export interface SheetSectionProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const SheetHeader: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetSectionProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, SheetSectionProps>(
  ({ style, testID, ...props }, ref) => (
    <View ref={ref} testID={testID ?? "sheet-header"} style={[{ gap: 8 }, style]} {...props} />
  ),
);

SheetHeader.displayName = "SheetHeader";

export interface SheetTextProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const SheetTitle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetTextProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<React.ElementRef<typeof Text>, SheetTextProps>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        testID={testID ?? "sheet-title"}
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

export const SheetDescription: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetTextProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<
  React.ElementRef<typeof Text>,
  SheetTextProps
>(({ style, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <Text
      ref={ref}
      testID={testID ?? "sheet-description"}
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

export const SheetFooter: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SheetSectionProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, SheetSectionProps>(
  ({ style, testID, ...props }, ref) => (
    <View
      ref={ref}
      testID={testID ?? "sheet-footer"}
      style={[{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 12 }, style]}
      {...props}
    />
  ),
);

SheetFooter.displayName = "SheetFooter";
