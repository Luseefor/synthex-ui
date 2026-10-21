import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GestureResponderEvent } from "react-native";

vi.mock("react-native", () => {
  const ReactMock = require("react") as typeof React;
  const host = (name: string) => ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
    ReactMock.createElement(name, { ...props, ref }, children));
  return { Pressable: host("native-pressable"), Text: host("native-text"), View: host("native-view") };
});
vi.mock("../icons/index.native", () => ({ CheckIcon: () => null, ChevronDownIcon: () => null }));

const trees: TestRenderer.ReactTestRenderer[] = [];
function render(node: React.ReactElement, options?: TestRenderer.TestRendererOptions) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(node, options); });
  trees.push(tree);
  return tree;
}
afterEach(() => { act(() => { for (const tree of trees.splice(0)) tree.unmount(); }); });
function event() {
  return { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } } as GestureResponderEvent;
}
function press(tree: TestRenderer.ReactTestRenderer, testID: string) {
  act(() => { tree.root.findAllByType("native-pressable" as any).find(n => n.props.testID === testID)!.props.onPress(event()); });
}
function host(tree: TestRenderer.ReactTestRenderer, id: string) {
  return tree.root.findAllByType("native-pressable" as any).find(n => n.props.testID === id)!;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.native";
function Example({ onPress, ...props }: React.ComponentProps<typeof Tabs> & { onPress?: (e: GestureResponderEvent) => void }) {
  return <Tabs defaultValue="one" {...props}><TabsList>
    <TabsTrigger value="one" testID="one">One</TabsTrigger>
    <TabsTrigger value="two" testID="two" onPress={onPress}>Two</TabsTrigger>
    <TabsTrigger value="disabled" testID="disabled" disabled onPress={onPress}>Disabled</TabsTrigger>
  </TabsList><TabsContent value="one" testID="panel-one">One panel</TabsContent><TabsContent value="two" testID="panel-two">Two panel</TabsContent></Tabs>;
}
describe("native Tabs interaction contracts (mock hosts)", () => {
  it("composes onPress with selection instead of replacing the default handler", () => {
    const onPress = vi.fn(), onValueChange = vi.fn();
    const tree = render(<Example {...{ onPress, onValueChange }} />);
    press(tree, "two");
    expect(onPress).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("two");
    expect(host(tree, "two").props.accessibilityState.selected).toBe(true);
    const panels = tree.root.findAllByType("native-view" as any);
    expect(panels.some(node => node.props.testID === "panel-one")).toBe(false);
    expect(panels.some(node => node.props.testID === "panel-two")).toBe(true);
  });
  it("guards disabled interaction and permits preventDefault cancellation", () => {
    const onPress = vi.fn((e: GestureResponderEvent) => e.preventDefault()), onValueChange = vi.fn();
    const tree = render(<Example {...{ onPress, onValueChange }} />);
    press(tree, "disabled");
    expect(onPress).not.toHaveBeenCalled();
    press(tree, "two");
    expect(onPress).toHaveBeenCalledOnce();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(host(tree, "one").props.accessibilityState.selected).toBe(true);
  });
  it("controlled selection changes only on a parent rerender", () => {
    const onValueChange = vi.fn();
    const tree = render(<Example value="one" onValueChange={onValueChange} />);
    press(tree, "two");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("two");
    expect(host(tree, "one").props.accessibilityState.selected).toBe(true);
    act(() => tree.update(<Example value="two" onValueChange={onValueChange} />));
    expect(host(tree, "two").props.accessibilityState.selected).toBe(true);
  });
  it("preserves caller accessibility metadata and ref to the native trigger host", () => {
    const ref = React.createRef<any>();
    const tree = render(<Tabs defaultValue="one"><TabsTrigger ref={ref} testID="one" value="one" accessibilityState={{ busy: true }}>One</TabsTrigger></Tabs>, { createNodeMock: el => ({ testID: (el.props as { testID?: string }).testID }) });
    expect(host(tree, "one").props.accessibilityState).toEqual({ busy: true, disabled: false, selected: true });
    expect(ref.current.testID).toBe("one");
  });
});
