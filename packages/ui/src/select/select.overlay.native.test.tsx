/**
 * Select overlay wiring (mock measurements, not devices).
 *
 * Exercises the actual shared overlay helper: transparent Modal,
 * backdrop outside dismissal, and system back dismissal all drive the
 * Select controller. Host refs are plain createNodeMock entries without
 * measure; the helper centers the surface as its documented fallback.
 */
import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GestureResponderEvent } from "react-native";

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  const host = (name: string) =>
    ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement(name, { ...props, ref }, children),
    );
  const flatten = (value: any): any =>
    Array.isArray(value)
      ? Object.assign({}, ...value.filter(Boolean).map(flatten))
      : (value ?? {});
  return {
    Pressable: host("select-pressable"),
    Text: host("select-text"),
    View: host("select-view"),
    ScrollView: host("select-scroll"),
    SafeAreaView: host("select-safe-area"),
    KeyboardAvoidingView: host("select-kav"),
    Modal: ({ children, visible, ...props }: any) =>
      visible ? ReactMock.createElement("select-modal", props, children) : null,
    Keyboard: { dismiss: vi.fn() },
    useWindowDimensions: () => ({ width: 400, height: 800, scale: 1, fontScale: 1 }),
    Platform: { OS: "ios", select: (options: any) => options.ios ?? options.default },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten,
      absoluteFillObject: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
    },
  };
});

vi.mock("../icons/index.native", () => ({
  CheckIcon: () => null,
  ChevronDownIcon: () => null,
}));

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select.native";

const trees: TestRenderer.ReactTestRenderer[] = [];
function render(node: React.ReactElement, options?: TestRenderer.TestRendererOptions) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node, {
      createNodeMock: (el) => ({ testID: (el.props as { testID?: string }).testID }),
      ...options,
    });
  });
  trees.push(tree);
  return tree;
}
afterEach(() => {
  act(() => {
    for (const tree of trees.splice(0)) tree.unmount();
  });
});

function event() {
  return {
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  } as GestureResponderEvent;
}

function pressable(tree: TestRenderer.ReactTestRenderer, testID: string) {
  const node = tree.root
    .findAllByType("select-pressable" as any)
    .find((n) => n.props.testID === testID);
  if (!node) throw new Error(`missing pressable ${testID}`);
  return node;
}

function byTestID(tree: TestRenderer.ReactTestRenderer, testID: string) {
  const node = tree.root.findAll((n) => typeof n.type === "string" && n.props?.testID === testID)[0];
  if (!node) throw new Error(`missing ${testID}`);
  return node;
}

function Example(props: React.ComponentProps<typeof Select>) {
  return (
    <Select defaultValue="apple" {...props}>
      <SelectTrigger testID="trigger">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="banana" testID="banana">
          Banana
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

describe("Select native overlay (actual helper)", () => {
  it("renders no Modal when closed and a transparent Modal when open", () => {
    const closed = render(<Example />);
    expect(closed.root.findAllByType("select-modal" as any)).toHaveLength(0);
    expect(closed.root.findAll((n) => typeof n.type === "string" && n.props?.testID === "select-content")).toHaveLength(0);

    const open = render(<Example defaultOpen />);
    const modals = open.root.findAllByType("select-modal" as any);
    expect(modals).toHaveLength(1);
    const modal = modals[0];
    expect(modal).toBeTruthy();
    expect(modal?.props.transparent).toBe(true);
    expect(byTestID(open, "select-content")).toBeTruthy();
  });

  it("routes trigger, backdrop, and back dismissal through the controller", () => {
    const onOpenChange = vi.fn();
    const tree = render(<Example onOpenChange={onOpenChange} />);
    act(() => pressable(tree, "trigger").props.onPress(event()));
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);

    act(() => byTestID(tree, "select-content-overlay").props.onPress());
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange.mock.calls[1]).toEqual([false]);

    act(() => pressable(tree, "trigger").props.onPress(event()));
    onOpenChange.mockClear();
    act(() => byTestID(tree, "select-content-modal").props.onRequestClose());
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("selects the inside item, notifies once, and closes the Modal", () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    const tree = render(
      <Example defaultOpen onValueChange={onValueChange} onOpenChange={onOpenChange} />,
    );
    act(() => pressable(tree, "banana").props.onPress(event()));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(tree.root.findAllByType("select-modal" as any)).toHaveLength(0);
  });

  it("controlled open/value notify without changing until the parent rerenders", () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const tree = render(
      <Example open value="apple" onOpenChange={onOpenChange} onValueChange={onValueChange} />,
    );
    act(() => pressable(tree, "banana").props.onPress(event()));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    // Controlled: trigger still reports open and the item stays unselected.
    expect(pressable(tree, "trigger").props.accessibilityState.expanded).toBe(true);
    expect(pressable(tree, "banana").props.accessibilityState.selected).toBe(false);
  });

  it("asChild clones child-first, respects cancel, and OR-merges disabled", () => {
    const order: string[] = [];
    const childOnPress = vi.fn(() => {
      order.push("child");
    });
    const parentOnPress = vi.fn(() => {
      order.push("parent");
    });
    const Child = React.forwardRef<any, any>(({ onPress, ...rest }: any, ref: any) =>
      React.createElement("select-pressable", { ...rest, ref, onPress }),
    );
    const tree = render(
      <Select defaultValue="apple">
        <SelectTrigger asChild onPress={parentOnPress}>
          <Child testID="custom-trigger" onPress={childOnPress} accessibilityState={{ busy: true }}>
            Custom
          </Child>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    const node = pressable(tree, "custom-trigger");
    expect(node.props.accessibilityState).toMatchObject({ busy: true, expanded: false });
    expect(node.props.collapsable).toBe(false);
    act(() => node.props.onPress(event()));
    expect(order).toEqual(["child", "parent"]);

    const cancelChild = (e: GestureResponderEvent) => e.preventDefault();
    const blockedParent = vi.fn();
    const tree2 = render(
      <Select defaultValue="apple">
        <SelectTrigger asChild onPress={blockedParent}>
          <Child testID="cancel-trigger" onPress={cancelChild}>
            Cancel
          </Child>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    act(() => pressable(tree2, "cancel-trigger").props.onPress(event()));
    expect(blockedParent).not.toHaveBeenCalled();
    expect(tree2.root.findAllByType("select-modal" as any)).toHaveLength(0);

    const disabledParent = vi.fn();
    const disabledChild = vi.fn();
    const tree3 = render(
      <Select defaultValue="apple">
        <SelectTrigger asChild onPress={disabledParent}>
          <Child testID="disabled-trigger" disabled onPress={disabledChild}>
            Disabled
          </Child>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    const disabledNode = pressable(tree3, "disabled-trigger");
    expect(disabledNode.props.disabled).toBe(true);
    act(() => disabledNode.props.onPress(event()));
    expect(disabledChild).not.toHaveBeenCalled();
    expect(disabledParent).not.toHaveBeenCalled();
  });

  it("forwards trigger refs and keeps the measured host collapsable=false", () => {
    const forwarded = React.createRef<any>();
    const tree = render(
      <Select defaultValue="apple">
        <SelectTrigger ref={forwarded} testID="trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(forwarded.current?.testID).toBe("trigger");
    expect(pressable(tree, "trigger").props.collapsable).toBe(false);
    act(() => tree.unmount());
    expect(forwarded.current).toBeNull();
  });

  it("asChild composes a functional child style with the parent style", () => {
    const childDynamic = ({ pressed }: { pressed: boolean }) => ({
      opacity: pressed ? 0.5 : 1,
      borderWidth: 2,
    });
    const Child = React.forwardRef<any, any>(({ onPress, ...rest }: any, ref: any) =>
      React.createElement("select-pressable", { ...rest, ref, onPress }),
    );
    const parentStyle = { backgroundColor: "red" };
    const tree = render(
      <Select defaultValue="apple">
        <SelectTrigger asChild style={parentStyle}>
          <Child testID="dynamic-trigger" style={childDynamic}>
            Dynamic
          </Child>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    const node = pressable(tree, "dynamic-trigger");
    expect(typeof node.props.style).toBe("function");
    const pressedStyle = node.props.style({ pressed: true });
    expect(pressedStyle).toEqual([parentStyle, { opacity: 0.5, borderWidth: 2 }]);
    const idleStyle = node.props.style({ pressed: false });
    expect(idleStyle).toEqual([parentStyle, { opacity: 1, borderWidth: 2 }]);

    const preserved = render(
      <Select defaultValue="apple">
        <SelectTrigger asChild>
          <Child testID="preserved-trigger" style={childDynamic}>
            Preserved
          </Child>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(pressable(preserved, "preserved-trigger").props.style).toBe(childDynamic);
  });
});
