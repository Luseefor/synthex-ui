/**
 * Popover (native) — overlay host contract.
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

import TestRenderer from "react-test-renderer";
import { Pressable, StyleSheet } from "react-native";
import { Button } from "../button/button.native";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.native";

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

describe("Popover native overlay (mock host)", () => {
  it("opens uncontrolled via trigger host and toggles closed", () => {
    const onOpenChange = vi.fn();
    const callerOnPress = vi.fn();
    const tree = createTree(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger onPress={callerOnPress}>Open</PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner-action">Action</Pressable>
        </PopoverContent>
      </Popover>,
    );
    expect(hostNodes(tree.root, "popover-content").length).toBe(0);
    const event = {};
    press(hostNode(tree.root, "popover-trigger"), event);
    expect(callerOnPress).toHaveBeenCalledWith(event);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(hostNode(tree.root, "popover-content")).toBeTruthy();
    expect(modalNode(tree.root)).toBeTruthy();
    press(hostNode(tree.root, "popover-trigger"), {});
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("controlled open notifies without rendering until prop changes", () => {
    const onOpenChange = vi.fn();
    const tree = createTree(
      <Popover open={false} onOpenChange={onOpenChange}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner">In</Pressable>
        </PopoverContent>
      </Popover>,
    );
    press(hostNode(tree.root, "popover-trigger"), {});
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(hostNodes(tree.root, "popover-content").length).toBe(0);
  });

  it("routes outside/back dismissal through helper and keeps interior press separate", () => {
    const onOpenChange = vi.fn();
    state.dismiss.mockClear();
    const innerPress = vi.fn();
    const tree = createTree(
      <Popover defaultOpen onOpenChange={onOpenChange}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner-action" onPress={innerPress}>Action</Pressable>
        </PopoverContent>
      </Popover>,
    );
    const content = hostNode(tree.root, "popover-content");
    expect(content.props.onPress).toBeUndefined();
    press(hostNode(tree.root, "inner-action"), {});
    expect(innerPress).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(hostNode(tree.root, "popover-content")).toBeTruthy();
    press(hostNode(tree.root, "popover-content-overlay"), {});
    expect(state.dismiss).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(hostNodes(tree.root, "popover-content").length).toBe(0);
    press(hostNode(tree.root, "popover-trigger"), {});
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    TestRenderer.act(() => {
      modalNode(tree.root).props.onRequestClose({});
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("disabled trigger guards handlers", () => {
    const triggerPress = vi.fn();
    const onOpenChange = vi.fn();
    const tree = createTree(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger disabled onPress={triggerPress}>Blocked</PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner">In</Pressable>
        </PopoverContent>
      </Popover>,
    );
    press(hostNode(tree.root, "popover-trigger"), {});
    expect(triggerPress).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("cancel via defaultPrevented blocks toggle", () => {
    const onOpenChange = vi.fn();
    const tree = createTree(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger onPress={(e: any) => { e.defaultPrevented = true; }}>Open</PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner">In</Pressable>
        </PopoverContent>
      </Popover>,
    );
    press(hostNode(tree.root, "popover-trigger"), {});
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(hostNodes(tree.root, "popover-content").length).toBe(0);
  });

  it("asChild runs child then parent then toggle and preserves child testID/style/ref", () => {
    const order: Array<string> = [];
    const childOnPress = vi.fn(() => { order.push("child"); });
    const parentOnPress = vi.fn(() => { order.push("parent"); });
    const onOpenChange = vi.fn();
    const childRef = React.createRef<any>();
    const outerRef = React.createRef<any>();
    const tree = createTree(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger asChild ref={outerRef} onPress={parentOnPress} style={{ opacity: 1 }}>
          <Pressable ref={childRef} testID="child-trigger" style={{ opacity: 0.5 }} onPress={childOnPress}>
            Open
          </Pressable>
        </PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner">In</Pressable>
        </PopoverContent>
      </Popover>,
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

  it("asChild OR-disabled blocks both handlers and merges refs with cleanup", () => {
    const childOnPress = vi.fn();
    const parentOnPress = vi.fn();
    const onOpenChange = vi.fn();
    const tree = createTree(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger asChild disabled onPress={parentOnPress}>
          <Pressable testID="child-disabled" onPress={childOnPress}>Blocked</Pressable>
        </PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner">In</Pressable>
        </PopoverContent>
      </Popover>,
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
        <Popover>
          <PopoverTrigger asChild ref={outerRef}>
            <Pressable ref={childRef} testID="child-refs">Open</Pressable>
          </PopoverTrigger>
          <PopoverContent>
            <Pressable testID="inner">In</Pressable>
          </PopoverContent>
        </Popover>,
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
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button testID="child-btn">Open</Button>
        </PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner">In</Pressable>
        </PopoverContent>
      </Popover>,
    );
    press(hostNode(tree.root, "child-btn"), {});
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(hostNode(tree.root, "popover-content")).toBeTruthy();
  });

  it("forwards side/align props, content ref, and caller style", () => {
    const contentRef = React.createRef<any>();
    const tree = createTree(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent
          ref={contentRef}
          testID="custom-content"
          side="top"
          align="center"
          sideOffset={12}
          alignOffset={4}
          style={{ opacity: 0.9 }}
        >
          <Pressable testID="inner">In</Pressable>
        </PopoverContent>
      </Popover>,
    );
    const content = hostNode(tree.root, "custom-content");
    expect(content).toBeTruthy();
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({ opacity: 0.9 });
    expect(contentRef.current).toBeTruthy();
    expect(modalNode(tree.root)).toBeTruthy();
  });

  it("non-asChild forces disabled false in accessibilityState but preserves busy", () => {
    const tree = createTree(
      <Popover>
        <PopoverTrigger accessibilityState={{ busy: true, disabled: true } as any}>
          Open
        </PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner">In</Pressable>
        </PopoverContent>
      </Popover>,
    );
    expect(hostNode(tree.root, "popover-trigger").props.accessibilityState).toMatchObject({
      busy: true,
      disabled: false,
    });

    const disabledTree = createTree(
      <Popover>
        <PopoverTrigger disabled accessibilityState={{ busy: true, disabled: false } as any}>
          Blocked
        </PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner">In</Pressable>
        </PopoverContent>
      </Popover>,
    );
    expect(hostNode(disabledTree.root, "popover-trigger").props.accessibilityState).toMatchObject({
      busy: true,
      disabled: true,
    });
  });

  it("asChild preserves functional child style when parent style is absent", () => {
    const childFn = ({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.5 : 1 });
    const tree = createTree(
      <Popover>
        <PopoverTrigger asChild>
          <Pressable testID="child-fn-style" style={childFn as any}>
            Open
          </Pressable>
        </PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner">In</Pressable>
        </PopoverContent>
      </Popover>,
    );
    const trigger = hostNode(tree.root, "child-fn-style");
    expect(typeof trigger.props.style).toBe("function");
    expect(trigger.props.style).toBe(childFn);
    expect(trigger.props.style({ pressed: true })).toEqual({ opacity: 0.5 });
  });

  it("asChild composes parent style with functional child style", () => {
    const childFn = ({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.5 : 1 });
    const tree = createTree(
      <Popover>
        <PopoverTrigger asChild style={{ opacity: 0.8 }}>
          <Pressable testID="child-fn-composed" style={childFn as any}>
            Open
          </Pressable>
        </PopoverTrigger>
        <PopoverContent>
          <Pressable testID="inner">In</Pressable>
        </PopoverContent>
      </Popover>,
    );
    const trigger = hostNode(tree.root, "child-fn-composed");
    expect(typeof trigger.props.style).toBe("function");
    expect(trigger.props.style({ pressed: true })).toEqual([{ opacity: 0.8 }, { opacity: 0.5 }]);
    expect(trigger.props.style({ pressed: false })).toEqual([{ opacity: 0.8 }, { opacity: 1 }]);
  });
});
