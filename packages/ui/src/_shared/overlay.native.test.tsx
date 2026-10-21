import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LayoutChangeEvent } from "react-native";

type Frame = { x: number; y: number; width: number; height: number };
const state = vi.hoisted(() => ({
  frames: new Map<string, Frame>(),
  pending: [] as Array<() => void>,
  deferred: false,
  platform: "ios",
  window: { width: 400, height: 700, scale: 1, fontScale: 1 },
  dismiss: vi.fn(),
}));
vi.mock("react-native", () => {
  const R = require("react") as typeof React;
  const host = (tag: string) => R.forwardRef(({ children, ...props }: any, ref: any) => R.createElement(tag, { ...props, ref }, children));
  const flatten = (value: any): any => Array.isArray(value) ? Object.assign({}, ...value.filter(Boolean).map(flatten)) : value ?? {};
  return {
    View: host("rn-view"), Pressable: host("rn-pressable"), SafeAreaView: host("rn-safe-area"),
    KeyboardAvoidingView: host("rn-keyboard-avoider"), ScrollView: host("rn-scroll"),
    Modal: ({ children, visible, ...props }: any) => visible ? R.createElement("rn-modal", props, children) : null,
    useWindowDimensions: () => state.window,
    Platform: { get OS() { return state.platform; } },
    Keyboard: { dismiss: state.dismiss },
    StyleSheet: { flatten, create: (styles: any) => styles, absoluteFillObject: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } },
  };
});
vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
import { View } from "react-native";
import { NativeOverlayContent, NativeOverlayProvider, useNativeOverlayTriggerRef } from "./overlay.native";
import { DirectionProvider } from "../direction/direction.native";

const trees = new Set<TestRenderer.ReactTestRenderer>();
function Anchor({ forwarded, childRef }: { forwarded?: React.Ref<React.ElementRef<typeof View>>; childRef?: React.Ref<React.ElementRef<typeof View>> }) {
  const ref = useNativeOverlayTriggerRef(forwarded, childRef);
  return <View ref={ref} testID="anchor" />;
}
type ExampleProps = { open?: boolean; onDismiss?: () => void; anchor?: boolean; forwarded?: React.Ref<React.ElementRef<typeof View>>; childRef?: React.Ref<React.ElementRef<typeof View>>; contentRef?: React.Ref<React.ElementRef<typeof View>>; onLayout?: (event: LayoutChangeEvent) => void; onEscape?: () => void };
function Example({ open = true, onDismiss = () => {}, anchor = true, forwarded, childRef, contentRef, onLayout, onEscape }: ExampleProps) {
  return <NativeOverlayProvider>
    {anchor ? <Anchor forwarded={forwarded} childRef={childRef} /> : null}
    <NativeOverlayContent open={open} onDismiss={onDismiss} ref={contentRef} testID="surface" onLayout={onLayout} onAccessibilityEscape={onEscape}>
      <View testID="inside" onTouchEnd={() => {}} />
    </NativeOverlayContent>
  </NativeOverlayProvider>;
}
function render(element: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(element, { createNodeMock: element => {
    const id = (element.props as { testID?: string }).testID ?? "";
    return { testID: id, measureInWindow(callback: (x: number, y: number, width: number, height: number) => void) {
      const invoke = () => { const f = state.frames.get(id) ?? { x: 0, y: 0, width: 400, height: 700 }; callback(f.x, f.y, f.width, f.height); };
      if (state.deferred) state.pending.push(invoke); else invoke();
    } };
  } }); });
  trees.add(tree); return tree;
}
function host(tree: TestRenderer.ReactTestRenderer, id: string) {
  const result = tree.root.findAll(node => typeof node.type === "string" && node.props.testID === id)[0];
  if (!result) throw new Error("Missing host " + id);
  return result;
}
function layout(tree: TestRenderer.ReactTestRenderer, id: string, width: number, height: number) {
  act(() => host(tree, id).props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width, height } } }));
}
function surface(tree: TestRenderer.ReactTestRenderer) { layout(tree, "surface", 224, 100); }
beforeEach(() => {
  state.frames.clear();
  state.frames.set("anchor", { x: 110, y: 140, width: 100, height: 40 });
  state.frames.set("surface-viewport", { x: 10, y: 40, width: 400, height: 700 });
  state.window = { width: 400, height: 700, scale: 1, fontScale: 1 };
  state.platform = "ios"; state.pending = []; state.deferred = false; state.dismiss.mockClear();
});
afterEach(() => { act(() => { for (const tree of trees) tree.unmount(); }); trees.clear(); });

describe("Native overlay host contracts (mock measurements, not devices)", () => {
  it("renders no Modal when closed", () => {
    const tree = render(<Example open={false} />);
    expect(tree.root.findAll(node => String(node.type) === "rn-modal")).toHaveLength(0);
    expect(state.dismiss).not.toHaveBeenCalled();
  });
  it("converts anchor window coordinates into the actual modal viewport frame", () => {
    const tree = render(<Example />); surface(tree);
    expect(host(tree, "surface-positioner").props.style).toMatchObject({ left: 100, top: 148, width: 224, maxHeight: 100 });
    expect(host(tree, "surface-modal").props).toMatchObject({ transparent: true, presentationStyle: "overFullScreen" });
  });
  it("routes backdrop and system dismissal to the caller while interior touches stay separate", () => {
    const onDismiss = vi.fn();
    const tree = render(<Example onDismiss={onDismiss} />);
    act(() => host(tree, "inside").props.onTouchEnd({}));
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => host(tree, "surface-overlay").props.onPress({}));
    expect(state.dismiss).toHaveBeenCalledOnce(); expect(onDismiss).toHaveBeenCalledOnce();
    act(() => host(tree, "surface-modal").props.onRequestClose({}));
    expect(onDismiss).toHaveBeenCalledTimes(2);
    expect(host(tree, "surface-overlay").props.accessible).toBe(false);
  });
  it("bounds and repositions the surface when keyboard avoidance shrinks the root", () => {
    const tree = render(<Example />); surface(tree);
    expect(host(tree, "surface-keyboard-avoider").props.behavior).toBe("padding");
    state.frames.set("surface-viewport", { x: 10, y: 40, width: 400, height: 200 });
    layout(tree, "surface-viewport", 400, 200);
    const position = host(tree, "surface-positioner").props.style;
    expect(position.top).toBe(8); expect(position.maxHeight).toBe(84);
    expect(position.top + position.maxHeight).toBeLessThanOrEqual(192);
    expect(host(tree, "surface-scroll").props.keyboardShouldPersistTaps).toBe("handled");
    expect(host(tree, "surface-scroll").props.nestedScrollEnabled).toBe(true);
  });
  it("uses height avoidance on Android and scrolls oversized natural content", () => {
    state.platform = "android";
    const tree = render(<Example />);
    layout(tree, "surface", 224, 1600);
    expect(host(tree, "surface-keyboard-avoider").props.behavior).toBe("height");
    const position = host(tree, "surface-positioner").props.style;
    expect(position.maxHeight).toBeLessThan(1600);
    expect(position.top + position.maxHeight).toBeLessThanOrEqual(692);
    expect(host(tree, "surface-scroll").props.style.maxHeight).toBe(position.maxHeight);
  });
  it("uses a centered fallback when there is no measurable trigger", () => {
    const tree = render(<Example anchor={false} />); surface(tree);
    expect(host(tree, "surface-positioner").props.style).toMatchObject({ left: 88, top: 300, width: 224, maxHeight: 100 });
  });
  it("ignores delayed measurements from a previous open cycle", () => {
    state.deferred = true;
    const tree = render(<Example />);
    const old = state.pending.splice(0);
    act(() => tree.update(<Example open={false} />));
    state.deferred = false;
    state.frames.set("anchor", { x: 50, y: 180, width: 100, height: 40 });
    act(() => tree.update(<Example />)); surface(tree);
    const expected = { ...host(tree, "surface-positioner").props.style };
    act(() => old.forEach(deliver => deliver()));
    expect(host(tree, "surface-positioner").props.style).toEqual(expected);
  });
  it("forwards content refs and composes layout and accessibility escape callbacks", () => {
    const ref = React.createRef<React.ElementRef<typeof View>>();
    const onLayout = vi.fn(), onEscape = vi.fn(), onDismiss = vi.fn();
    const tree = render(<Example contentRef={ref} {...{ onLayout, onEscape, onDismiss }} />); surface(tree);
    expect((ref.current as unknown as { testID: string }).testID).toBe("surface");
    expect(onLayout).toHaveBeenCalledOnce();
    expect(host(tree, "surface").props.accessibilityViewIsModal).toBe(true);
    act(() => host(tree, "surface").props.onAccessibilityEscape());
    expect(onEscape).toHaveBeenCalledOnce(); expect(onDismiss).toHaveBeenCalledOnce();
  });
  it("preserves both trigger refs and React 19 cleanup without detaching on direction updates", () => {
    const object = React.createRef<React.ElementRef<typeof View>>(), cleanup = vi.fn();
    const childRef = vi.fn((_node: React.ElementRef<typeof View> | null) => cleanup);
    const tree = render(<DirectionProvider dir="ltr"><Example forwarded={object} childRef={childRef} /></DirectionProvider>);
    expect(object.current).not.toBeNull(); expect(childRef.mock.calls[0]?.[0]).toBe(object.current);
    act(() => tree.update(<DirectionProvider dir="rtl"><Example forwarded={object} childRef={childRef} /></DirectionProvider>));
    expect(cleanup).not.toHaveBeenCalled();
    expect(host(tree, "surface").props.style.at(-1).direction).toBe("rtl");
    act(() => tree.unmount()); trees.delete(tree);
    expect(object.current).toBeNull(); expect(cleanup).toHaveBeenCalledOnce();
  });
});
