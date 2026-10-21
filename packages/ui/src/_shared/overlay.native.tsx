import * as React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { NativeDirectionContext } from "./direction-context.native";
import type { OverlayPositionProps } from "./positioning";
import { resolveNativeOverlayPosition, type NativeOverlayAnchor as NativeOverlayRect } from "./positioning.native";

type NativeHost = React.ElementRef<typeof View>;
interface OverlayContextValue {
  readonly anchorRef: React.RefObject<NativeHost | null>;
  readonly dir: "ltr" | "rtl";
}
const OverlayContext = React.createContext<OverlayContextValue | null>(null);

export function NativeOverlayProvider({ children, dir }: React.PropsWithChildren<{ readonly dir?: "ltr" | "rtl" }>) {
  const anchorRef = React.useRef<NativeHost | null>(null);
  const inherited = React.useContext(NativeDirectionContext);
  const resolvedDir = dir ?? inherited.dir;
  const value = React.useMemo(() => ({ anchorRef, dir: resolvedDir }), [resolvedDir]);
  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

function useOverlayContext() {
  const context = React.useContext(OverlayContext);
  if (!context) throw new Error("Native overlay parts must be inside their root component.");
  return context;
}

// React 19 refs may return cleanup functions; void callbacks still need null.
export function useNativeOverlayTriggerRef(
  forwardedRef: React.Ref<NativeHost> | undefined,
  childRef?: React.Ref<NativeHost>,
): React.RefCallback<NativeHost> {
  const { anchorRef } = useOverlayContext();
  return React.useCallback((node: NativeHost | null) => {
    const cleanups = [anchorRef, forwardedRef, childRef].map((ref) => {
      if (typeof ref === "function") {
        const cleanup = ref(node);
        return typeof cleanup === "function" ? cleanup : () => { ref(null); };
      }
      if (ref) {
        ref.current = node;
        return () => { ref.current = null; };
      }
      return undefined;
    });
    return () => { for (const cleanup of cleanups) cleanup?.(); };
  }, [anchorRef, forwardedRef, childRef]);
}

export interface NativeOverlayContentProps extends Omit<ViewProps, "style">, OverlayPositionProps {
  readonly open: boolean;
  readonly onDismiss: () => void;
  readonly style?: StyleProp<ViewStyle>;
}
function validSize(value: number) { return Number.isFinite(value) ? Math.max(0, value) : 0; }
function dimension(value: ViewStyle["width"], available: number): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, value) : undefined;
  if (typeof value === "string" && value.endsWith("%")) {
    const percent = Number.parseFloat(value);
    if (Number.isFinite(percent)) return Math.max(0, available * percent / 100);
  }
  return undefined;
}
function equalRect(a: NativeOverlayRect | null, b: NativeOverlayRect | null) {
  return a === b || (!!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height);
}

export const NativeOverlayContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NativeOverlayContentProps> & React.RefAttributes<React.ElementRef<typeof View>>
> = React.forwardRef<React.ElementRef<typeof View>, NativeOverlayContentProps>(
  ({ open, onDismiss, children, style, testID = "native-overlay-content", side, align, sideOffset, alignOffset, onLayout, onAccessibilityEscape, accessibilityViewIsModal = true, ...props }, ref) => {
    const { anchorRef, dir } = useOverlayContext();
    const window = useWindowDimensions();
    const rootRef = React.useRef<NativeHost | null>(null);
    const generation = React.useRef(0);
    const mounted = React.useRef(false);
    const [viewport, setViewport] = React.useState({ width: validSize(window.width), height: validSize(window.height) });
    const [origin, setOrigin] = React.useState({ x: 0, y: 0 });
    const [anchor, setAnchor] = React.useState<NativeOverlayRect | null>(null);
    const [naturalHeight, setNaturalHeight] = React.useState<number | null>(null);

    React.useLayoutEffect(() => {
      mounted.current = true;
      return () => { mounted.current = false; generation.current += 1; };
    }, []);

    const measure = React.useCallback(() => {
      if (!open) return;
      const id = ++generation.current;
      const active = () => mounted.current && generation.current === id;
      const measureAnchor = () => {
        const host = anchorRef.current;
        if (!host || typeof host.measureInWindow !== "function") {
          if (active()) setAnchor(null);
          return;
        }
        host.measureInWindow((x, y, width, height) => {
          if (!active()) return;
          const rect = [x, y, width, height].every(Number.isFinite) && width >= 0 && height >= 0 && (width > 0 || height > 0)
            ? { x, y, width, height } : null;
          setAnchor(previous => equalRect(previous, rect) ? previous : rect);
        });
      };
      const root = rootRef.current;
      if (root && typeof root.measureInWindow === "function") {
        root.measureInWindow((x, y, width, height) => {
          if (!active()) return;
          if (Number.isFinite(x) && Number.isFinite(y)) setOrigin(previous => previous.x === x && previous.y === y ? previous : { x, y });
          if ([width, height].every(Number.isFinite) && width > 0 && height > 0) setViewport(previous => previous.width === width && previous.height === height ? previous : { width, height });
          measureAnchor();
        });
      } else {
        measureAnchor();
      }
    }, [anchorRef, open]);

    React.useLayoutEffect(() => {
      generation.current += 1;
      if (!open) { setAnchor(null); return; }
      setNaturalHeight(null);
      measure();
      return () => { generation.current += 1; };
    }, [open, window.width, window.height, measure]);

    const handleViewportLayout = React.useCallback((event: LayoutChangeEvent) => {
      const width = validSize(event.nativeEvent.layout.width), height = validSize(event.nativeEvent.layout.height);
      setViewport(previous => previous.width === width && previous.height === height ? previous : { width, height });
      measure();
    }, [measure]);

    const flat = StyleSheet.flatten(style) ?? {};
    const availableWidth = Math.max(0, viewport.width - 16);
    const desiredWidth = dimension(flat.width, availableWidth) ?? Math.max(anchor?.width ?? 0, dimension(flat.minWidth, availableWidth) ?? 224);
    const preferredWidth = Math.min(desiredWidth, dimension(flat.maxWidth, availableWidth) ?? availableWidth, availableWidth);
    const height = naturalHeight ?? viewport.height;
    const placement = resolveNativeOverlayPosition({
      anchor: anchor ? { ...anchor, x: anchor.x - origin.x, y: anchor.y - origin.y } : { x: viewport.width / 2, y: 0, width: 0, height: 0 },
      content: { width: preferredWidth, height },
      viewport, side, align, sideOffset, alignOffset, dir,
    });
    // A custom child that does not expose a native ref can still open a usable
    // centered surface; measured triggers anchor in the modal root's frame.
    const maxHeight = anchor ? placement.maxHeight : Math.min(height, Math.max(0, viewport.height - 16));
    const left = anchor ? placement.left : Math.max(0, (viewport.width - placement.width) / 2);
    const top = anchor ? placement.top : Math.max(0, (viewport.height - maxHeight) / 2);
    const dismiss = () => { Keyboard.dismiss(); onDismiss(); };

    if (!open) return null;
    return (
      <Modal transparent visible animationType="none" presentationStyle="overFullScreen"
        supportedOrientations={["portrait", "portrait-upside-down", "landscape-left", "landscape-right"]}
        onRequestClose={dismiss} onShow={measure} testID={testID + "-modal"}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} testID={testID + "-keyboard-avoider"}>
          <Pressable style={StyleSheet.absoluteFillObject} accessible={false} importantForAccessibility="no"
            testID={testID + "-overlay"} onPress={dismiss} />
          <SafeAreaView style={{ flex: 1 }} pointerEvents="box-none">
            <View ref={rootRef} collapsable={false} pointerEvents="box-none" style={{ flex: 1, direction: dir }}
              onLayout={handleViewportLayout} testID={testID + "-viewport"}>
              <View style={{ position: "absolute", left, top, width: placement.width, maxHeight }} testID={testID + "-positioner"}>
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" bounces={false}
                  style={{ maxHeight }} contentContainerStyle={{ flexGrow: 0 }} testID={testID + "-scroll"}>
                  <View {...props} ref={ref} collapsable={false} testID={testID}
                    accessibilityViewIsModal={accessibilityViewIsModal}
                    onAccessibilityEscape={() => { onAccessibilityEscape?.(); dismiss(); }}
                    onLayout={(event) => { setNaturalHeight(validSize(event.nativeEvent.layout.height)); onLayout?.(event); }}
                    style={[style, { width: "100%", minWidth: 0, maxWidth: "100%", direction: dir }]}>
                    {children}
                  </View>
                </ScrollView>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);
NativeOverlayContent.displayName = "NativeOverlayContent";
