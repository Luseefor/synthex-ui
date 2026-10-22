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
import { useDialogController } from "../dialog/dialog.shared";
import { DialogProvider, useDialogContext } from "../dialog/dialog.shared";
import type { DrawerDirection, DrawerSharedProps } from "./drawer.shared";

const DrawerNativeConfig = React.createContext<{ direction: DrawerDirection; dismissible: boolean }>({ direction: "bottom", dismissible: true });

export interface DrawerProps extends DrawerSharedProps {
  readonly children?: React.ReactNode;
  readonly dir?: "ltr" | "rtl";
}

export function Drawer({ children, defaultOpen, direction = "bottom", dismissible = true, modal, onOpenChange, open, dir }: DrawerProps) {
  void modal;
  const controller = useDialogController({ defaultOpen, onOpenChange, open });
  const inherited = React.useContext(NativeDirectionContext);
  const nativeDirection = React.useMemo(() => ({ ...inherited, dir: dir ?? inherited.dir }), [inherited, dir]);
  const config = React.useMemo(() => ({ direction, dismissible }), [direction, dismissible]);
  return <NativeDirectionContext.Provider value={nativeDirection}>
    <DrawerNativeConfig.Provider value={config}>
      <DialogProvider value={controller}>{children}</DialogProvider>
    </DrawerNativeConfig.Provider>
  </NativeDirectionContext.Provider>;
}

export interface DrawerTriggerProps extends Omit<PressableProps, "style"> {
  readonly children?: React.ReactNode;
  readonly style?: PressableProps["style"];
  readonly asChild?: boolean;
}

export const DrawerTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DrawerTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, DrawerTriggerProps>((props, ref) => {
  const context = useDialogContext();
  return <NativeModalAction {...props} forwardedRef={ref} defaultTestID="drawer-trigger" expanded={context.open} onAction={() => context.setOpen(true)} />;
});
DrawerTrigger.displayName = "DrawerTrigger";

export const DrawerClose: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DrawerTriggerProps> & React.RefAttributes<React.ElementRef<typeof Pressable>>
> = React.forwardRef<React.ElementRef<typeof Pressable>, DrawerTriggerProps>((props, ref) => {
  const context = useDialogContext();
  return <NativeModalAction {...props} forwardedRef={ref} defaultTestID="drawer-close" onAction={() => context.setOpen(false)} />;
});
DrawerClose.displayName = "DrawerClose";

export interface DrawerContentProps extends Omit<ViewProps, "style"> {
  readonly modalProps?: Omit<ModalProps, "children" | "transparent" | "visible">;
  readonly hideClose?: boolean;
  readonly closeLabel?: string;
  readonly dismissible?: boolean;
  readonly side?: "bottom" | "left" | "right" | "top";
  readonly style?: StyleProp<ViewStyle>;
}

export const DrawerContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DrawerContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, DrawerContentProps>(({ side, dismissible, ...props }, ref) => {
  const context = useDialogContext();
  const config = React.useContext(DrawerNativeConfig);
  const { dir } = React.useContext(NativeDirectionContext);
  return <NativeModalSurface {...props} family="drawer" closeIcon={<CloseIcon size={16} />} contentRef={ref} open={context.open} setOpen={context.setOpen}
    dir={dir} side={side ?? config.direction} dismissible={dismissible ?? config.dismissible} />;
});
DrawerContent.displayName = "DrawerContent";

export interface DrawerSectionProps extends Omit<ViewProps, "style"> {
  readonly style?: StyleProp<ViewStyle>;
}

export const DrawerHeader: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DrawerSectionProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, DrawerSectionProps>(
  ({ style, testID, ...props }, ref) => (
    <View ref={ref} testID={testID ?? "drawer-header"} style={[{ gap: 8 }, style]} {...props} />
  ),
);

DrawerHeader.displayName = "DrawerHeader";

export interface DrawerTextProps extends Omit<TextProps, "style"> {
  readonly style?: StyleProp<TextStyle>;
}

export const DrawerTitle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DrawerTextProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<React.ElementRef<typeof Text>, DrawerTextProps>(
  ({ style, testID, ...props }, ref) => {
    const theme = useTheme();

    return (
      <Text
        ref={ref}
        testID={testID ?? "drawer-title"}
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

DrawerTitle.displayName = "DrawerTitle";

export const DrawerDescription: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DrawerTextProps> & React.RefAttributes<React.ElementRef<typeof Text>>
> = React.forwardRef<
  React.ElementRef<typeof Text>,
  DrawerTextProps
>(({ style, testID, ...props }, ref) => {
  const theme = useTheme();

  return (
    <Text
      ref={ref}
      testID={testID ?? "drawer-description"}
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

DrawerDescription.displayName = "DrawerDescription";

export const DrawerFooter: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DrawerSectionProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, DrawerSectionProps>(
  ({ style, testID, ...props }, ref) => (
    <View
      ref={ref}
      testID={testID ?? "drawer-footer"}
      style={[{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 12 }, style]}
      {...props}
    />
  ),
);

DrawerFooter.displayName = "DrawerFooter";

export type { DrawerDirection };
