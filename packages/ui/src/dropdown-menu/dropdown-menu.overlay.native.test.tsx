/**
 * DropdownMenu (native) — overlay host contract.
 *
 * Mocked react-native host only: verifies controller wiring through actual
 * host onPress / Modal onRequestClose / backdrop onPress. Not device evidence
 * for real Modal/back-button behavior, focus, or screen-reader announcements.
 */
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ dismiss: vi.fn() }));

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  const host = (tag: string) =>
    ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement(tag, { ...props, ref }, children),
    );
  const flatten = (value: any): any =>
    Array.isArray(value)
      ? Object.assign({}, ...value.filter(Boolean).map(flatten))
      : (value ?? {});
  return {
    Pressable: host("mock-pressable"),
    View: host("mock-view"),
    Text: host("mock-text"),
    TextInput: host("mock-text-input"),
    ScrollView: host("mock-scroll"),
    KeyboardAvoidingView: host("mock-kav"),
    SafeAreaView: host("mock-safe"),
    Modal: ({ children, visible, ...props }: any) =>
      visible ? ReactMock.createElement("mock-modal", props, children) : null,
    Keyboard: { dismiss: state.dismiss },
    useWindowDimensions: () => ({ width: 400, height: 800, scale: 1, fontScale: 1 }),
    Platform: { OS: "ios", select: (options: any) => options.ios ?? options.default },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten,
      absoluteFillObject: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    },
  };
});

vi.mock("../icons/index.native", () => ({
  CheckIcon: () => null,
  ChevronRightIcon: () => null,
}));

import TestRenderer from "react-test-renderer";
import { Pressable, StyleSheet } from "react-native";
import { Button } from "../button/button.native";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu.native";

function createTree(element: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    // Plain mock without measureInWindow: helper uses centered fallback.
    tree = TestRenderer.create(element, { createNodeMock: () => ({}) });
  });
  return tree!;
}

function hostNodes(root: TestRenderer.ReactTestInstance, testID: string) {
  return root.findAll((node) => typeof node.type === "string" && node.props.testID === testID);
}

function hostNode(root: TestRenderer.ReactTestInstance, testID: string) {
  const nodes = hostNodes(root, testID);
  expect(nodes.length, `expected host "${testID}"`).toBeGreaterThan(0);
  return nodes[0]!;
}

function modalNode(root: TestRenderer.ReactTestInstance) {
  const nodes = root.findAll((node) => String(node.type) === "mock-modal");
  expect(nodes.length, "expected mock-modal").toBeGreaterThan(0);
  return nodes[0]!;
}

function press(node: TestRenderer.ReactTestInstance, event: any = {}) {
  TestRenderer.act(() => {
    node.props.onPress(event);
  });
}

describe("DropdownMenu native overlay (mock host)", () => {
  it("opens uncontrolled via trigger host and closes via item press", () => {
    const onOpenChange = vi.fn();
    const callerOnPress = vi.fn();
    const tree = createTree(
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger onPress={callerOnPress}>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(hostNodes(tree.root, "dropdown-menu-content").length).toBe(0);
    const event = {};
    press(hostNode(tree.root, "dropdown-menu-trigger"), event);
    expect(callerOnPress).toHaveBeenCalledWith(event);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(hostNode(tree.root, "dropdown-menu-content")).toBeTruthy();
    expect(modalNode(tree.root)).toBeTruthy();
    press(hostNode(tree.root, "dropdown-menu-item"), {});
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(hostNodes(tree.root, "dropdown-menu-content").length).toBe(0);
  });

  it("controlled open notifies without rendering until prop changes", () => {
    const onOpenChange = vi.fn();
    const tree = createTree(
      <DropdownMenu open={false} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    press(hostNode(tree.root, "dropdown-menu-trigger"), {});
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(hostNodes(tree.root, "dropdown-menu-content").length).toBe(0);
  });

  it("routes outside/back dismissal through helper and keeps interior press separate", () => {
    const onOpenChange = vi.fn();
    state.dismiss.mockClear();
    const tree = createTree(
      <DropdownMenu defaultOpen onOpenChange={onOpenChange}>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const content = hostNode(tree.root, "dropdown-menu-content");
    expect(content.props.onPress).toBeUndefined();
    press(hostNode(tree.root, "dropdown-menu-content-overlay"), {});
    expect(state.dismiss).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(hostNodes(tree.root, "dropdown-menu-content").length).toBe(0);
    press(hostNode(tree.root, "dropdown-menu-trigger"), {});
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    TestRenderer.act(() => {
      modalNode(tree.root).props.onRequestClose({});
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("disabled trigger and item guard handlers and close", () => {
    const triggerPress = vi.fn();
    const itemPress = vi.fn();
    const onOpenChange = vi.fn();
    const tree = createTree(
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger disabled onPress={triggerPress}>Blocked</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    press(hostNode(tree.root, "dropdown-menu-trigger"), {});
    expect(triggerPress).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();

    const openTree = createTree(
      <DropdownMenu defaultOpen onOpenChange={onOpenChange}>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled onPress={itemPress}>Blocked item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    onOpenChange.mockClear();
    press(hostNode(openTree.root, "dropdown-menu-item"), {});
    expect(itemPress).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("cancel via defaultPrevented blocks toggle and item close", () => {
    const onOpenChange = vi.fn();
    const tree = createTree(
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger onPress={(e: any) => { e.defaultPrevented = true; }}>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    press(hostNode(tree.root, "dropdown-menu-trigger"), {});
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(hostNodes(tree.root, "dropdown-menu-content").length).toBe(0);

    const openChange = vi.fn();
    const itemPress = vi.fn((e: any) => { e.defaultPrevented = true; });
    const openTree = createTree(
      <DropdownMenu defaultOpen onOpenChange={openChange}>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onPress={itemPress}>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    press(hostNode(openTree.root, "dropdown-menu-item"), {});
    expect(itemPress).toHaveBeenCalledTimes(1);
    expect(openChange).not.toHaveBeenCalled();
    expect(hostNodes(openTree.root, "dropdown-menu-content").length).toBe(1);
  });

  it("asChild runs child then parent then toggle and preserves child testID/style/ref", () => {
    const order: Array<string> = [];
    const childOnPress = vi.fn(() => { order.push("child"); });
    const parentOnPress = vi.fn(() => { order.push("parent"); });
    const onOpenChange = vi.fn();
    const childRef = React.createRef<any>();
    const outerRef = React.createRef<any>();
    const tree = createTree(
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild ref={outerRef} onPress={parentOnPress} style={{ opacity: 1 }}>
          <Pressable ref={childRef} testID="child-trigger" style={{ opacity: 0.5 }} onPress={childOnPress}>
            Open
          </Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = hostNode(tree.root, "child-trigger");
    expect(trigger.props.collapsable).toBe(false);
    expect(trigger.props.style).toEqual(expect.arrayContaining([{ opacity: 1 }, { opacity: 0.5 }]));
    press(trigger, {});
    expect(order).toEqual(["child", "parent"]);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(childRef.current).toBeTruthy();
    expect(outerRef.current).toBe(childRef.current);
  });

  it("asChild child cancel skips parent and toggle; parent cancel skips toggle", () => {
    const parentOnPress = vi.fn();
    const childCancel = vi.fn((e: any) => { e.defaultPrevented = true; });
    const onOpenChange = vi.fn();
    const tree = createTree(
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild onPress={parentOnPress}>
          <Pressable testID="child-cancel" onPress={childCancel}>Open</Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    press(hostNode(tree.root, "child-cancel"), {});
    expect(childCancel).toHaveBeenCalledTimes(1);
    expect(parentOnPress).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();

    const childOnPress = vi.fn();
    const parentCancel = vi.fn((e: any) => { e.defaultPrevented = true; });
    const tree2 = createTree(
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild onPress={parentCancel}>
          <Pressable testID="child-parent-cancel" onPress={childOnPress}>Open</Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    onOpenChange.mockClear();
    press(hostNode(tree2.root, "child-parent-cancel"), {});
    expect(childOnPress).toHaveBeenCalledTimes(1);
    expect(parentCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("asChild OR-disabled blocks both handlers and merges refs with cleanup", () => {
    const childOnPress = vi.fn();
    const parentOnPress = vi.fn();
    const onOpenChange = vi.fn();
    const tree = createTree(
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild disabled onPress={parentOnPress}>
          <Pressable testID="child-disabled" onPress={childOnPress}>Blocked</Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(hostNode(tree.root, "child-disabled").props.disabled).toBe(true);
    press(hostNode(tree.root, "child-disabled"), {});
    expect(childOnPress).not.toHaveBeenCalled();
    expect(parentOnPress).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();

    const outerCleanup = vi.fn();
    const outerRef = vi.fn((_node: unknown) => outerCleanup);
    const childRef = React.createRef<any>();
    let refTree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      refTree = TestRenderer.create(
        <DropdownMenu>
          <DropdownMenuTrigger asChild ref={outerRef}>
            <Pressable ref={childRef} testID="child-refs">Open</Pressable>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Pick</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
        { createNodeMock: () => ({}) },
      );
    });
    expect(outerRef).toHaveBeenCalled();
    expect(childRef.current).toBeTruthy();
    expect(outerRef.mock.calls[0]?.[0]).toBe(childRef.current);
    TestRenderer.act(() => {
      refTree!.unmount();
    });
    expect(outerCleanup).toHaveBeenCalled();
    expect(childRef.current).toBeNull();
  });

  it("asChild inside Button opens via actual Button host", () => {
    const onOpenChange = vi.fn();
    const tree = createTree(
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button testID="child-btn">Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    press(hostNode(tree.root, "child-btn"), {});
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(hostNode(tree.root, "dropdown-menu-content")).toBeTruthy();
  });

  it("forwards side/align props, content ref, caller style, and dir", () => {
    const contentRef = React.createRef<any>();
    const tree = createTree(
      <DropdownMenu defaultOpen dir="rtl">
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent
          ref={contentRef}
          testID="custom-content"
          side="top"
          align="center"
          sideOffset={12}
          alignOffset={4}
          style={{ opacity: 0.9 }}
        >
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const content = hostNode(tree.root, "custom-content");
    expect(content).toBeTruthy();
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({ opacity: 0.9 });
    expect(contentRef.current).toBeTruthy();
    expect(modalNode(tree.root)).toBeTruthy();
    expect(hostNode(tree.root, "custom-content-viewport").props.style).toMatchObject({ direction: "rtl" });
  });

  it("non-asChild forces disabled false in accessibilityState but preserves busy", () => {
    const tree = createTree(
      <DropdownMenu>
        <DropdownMenuTrigger accessibilityState={{ busy: true, disabled: true } as any}>
          Open
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = hostNode(tree.root, "dropdown-menu-trigger");
    expect(trigger.props.accessibilityState).toMatchObject({ busy: true, disabled: false });

    const disabledTree = createTree(
      <DropdownMenu>
        <DropdownMenuTrigger disabled accessibilityState={{ busy: true, disabled: false } as any}>
          Blocked
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(hostNode(disabledTree.root, "dropdown-menu-trigger").props.accessibilityState).toMatchObject({
      busy: true,
      disabled: true,
    });
  });

  it("asChild preserves functional child style when parent style is absent", () => {
    const childFn = ({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.5 : 1 });
    const tree = createTree(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Pressable testID="child-fn-style" style={childFn as any}>
            Open
          </Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = hostNode(tree.root, "child-fn-style");
    expect(typeof trigger.props.style).toBe("function");
    expect(trigger.props.style).toBe(childFn);
    expect(trigger.props.style({ pressed: true })).toEqual({ opacity: 0.5 });
  });

  it("asChild composes parent style with functional child style", () => {
    const childFn = ({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.5 : 1 });
    const tree = createTree(
      <DropdownMenu>
        <DropdownMenuTrigger asChild style={{ opacity: 0.8 }}>
          <Pressable testID="child-fn-composed" style={childFn as any}>
            Open
          </Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Pick</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = hostNode(tree.root, "child-fn-composed");
    expect(typeof trigger.props.style).toBe("function");
    expect(trigger.props.style({ pressed: true })).toEqual([{ opacity: 0.8 }, { opacity: 0.5 }]);
    expect(trigger.props.style({ pressed: false })).toEqual([{ opacity: 0.8 }, { opacity: 1 }]);
  });
});
