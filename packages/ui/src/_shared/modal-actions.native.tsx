import * as React from "react";
import { Modal, Pressable, View, type ModalProps, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "./theme/context";

export {
  NativePressableAction as NativeModalAction,
  mergeNativePressableRefs as mergeNativeModalRefs,
  getNativeChildRef as getNativeModalChildRef,
  composeNativePressableStyles as composeNativeModalStyles,
} from "./pressable.native";
export type { NativePressableActionProps as NativeModalActionProps } from "./pressable.native";

export type NativeModalSide = "top" | "right" | "bottom" | "left";
export interface NativeModalSurfaceProps extends Omit<ViewProps, "style"> {
  readonly family: "sheet" | "drawer";
  readonly closeIcon: React.ReactNode;
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly side: NativeModalSide;
  readonly dir: "ltr" | "rtl";
  readonly dismissible: boolean;
  readonly hideClose?: boolean;
  readonly closeLabel?: string;
  readonly modalProps?: Omit<ModalProps, "children" | "transparent" | "visible">;
  readonly style?: ViewProps["style"];
  readonly contentRef?: React.Ref<React.ElementRef<typeof View>>;
}

export function NativeModalSurface({
  family, closeIcon, open, setOpen, side, dir, dismissible, hideClose = false,
  closeLabel, modalProps, style, contentRef, children, testID,
  onAccessibilityEscape, accessibilityViewIsModal = true, ...props
}: NativeModalSurfaceProps) {
  const theme = useTheme();
  const { onRequestClose, ...restModalProps } = modalProps ?? {};
  if (!open) return null;
  const horizontalEdge = side === "top" || side === "bottom";
  const placement: ViewStyle = horizontalEdge
    ? { position: "absolute", left: 0, right: 0, [side]: 0, width: "100%", maxHeight: "100%" }
    : { position: "absolute", top: 0, bottom: 0, [side]: 0, width: "100%", maxWidth: 420 };
  const border: ViewStyle = side === "right" ? { borderLeftWidth: 1 }
    : side === "left" ? { borderRightWidth: 1 }
    : side === "top" ? { borderBottomWidth: 1 } : { borderTopWidth: 1 };
  return <Modal {...restModalProps}
    testID={restModalProps.testID ?? `${family}-modal`}
    transparent visible={open} animationType={restModalProps.animationType ?? "fade"}
    onRequestClose={(event) => {
      onRequestClose?.(event);
      if (dismissible && !event?.defaultPrevented) setOpen(false);
    }}>
    <View style={{ flex: 1, direction: "ltr" }}>
      <Pressable testID={`${family}-overlay`} accessible={false}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(15,23,42,0.38)" }}
        onPress={(event) => { if (dismissible && !event.defaultPrevented) setOpen(false); }} />
      <View {...props} ref={contentRef} testID={testID ?? `${family}-content`}
        accessibilityViewIsModal={accessibilityViewIsModal}
        onAccessibilityEscape={() => { onAccessibilityEscape?.(); if (dismissible) setOpen(false); }}
        style={[placement, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: 24 }, border, style, { direction: dir }]}>
        {family === "drawer" && <View testID="drawer-handle" accessible={false}
          style={{ alignSelf: "center", height: horizontalEdge ? 6 : 48, width: horizontalEdge ? 48 : 6,
            marginBottom: 16, borderRadius: 999, backgroundColor: theme.colors.border }} />}
        {!hideClose && <Pressable accessibilityRole="button"
          accessibilityLabel={closeLabel ?? (family === "sheet" ? "Close sheet" : "Close drawer")}
          testID={`${family}-close`} onPress={() => setOpen(false)}
          style={{ position: "absolute", ...(dir === "rtl" ? { left: 16 } : { right: 16 }), top: 16,
            width: 36, height: 36, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border,
            alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.surface }}>
          {closeIcon}
        </Pressable>}
        {children}
      </View>
    </View>
  </Modal>;
}
