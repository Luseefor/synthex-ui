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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select.native";

function Example(props: React.ComponentProps<typeof Select> & { triggerPress?: (e: GestureResponderEvent) => void; itemPress?: (e: GestureResponderEvent) => void; itemDisabled?: boolean }) {
  const { triggerPress, itemPress, itemDisabled, ...root } = props;
  return <Select defaultValue="apple" {...root}>
    <SelectTrigger testID="trigger" onPress={triggerPress}><SelectValue /></SelectTrigger>
    <SelectContent><SelectItem value="banana" testID="banana" disabled={itemDisabled} onPress={itemPress}>Banana</SelectItem></SelectContent>
  </Select>;
}
describe("native Select interaction contracts (mock hosts)", () => {
  it("composes trigger/item handlers with uncontrolled selection and dismissal", () => {
    const onOpenChange = vi.fn(), onValueChange = vi.fn(), triggerPress = vi.fn(), itemPress = vi.fn();
    const tree = render(<Example {...{ onOpenChange, onValueChange, triggerPress, itemPress }} />);
    expect(host(tree, "trigger").props.accessibilityState.expanded).toBe(false);
    press(tree, "trigger");
    expect(triggerPress).toHaveBeenCalledOnce();
    expect(host(tree, "trigger").props.accessibilityState.expanded).toBe(true);
    press(tree, "banana");
    expect(itemPress).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(host(tree, "trigger").props.accessibilityState.expanded).toBe(false);
    expect(tree.toJSON()).toBeTruthy();
  });

  it("root disabled propagates and guards callbacks even when host onPress is invoked", () => {
    const triggerPress = vi.fn(), itemPress = vi.fn(), onValueChange = vi.fn(), onOpenChange = vi.fn();
    const tree = render(<Example disabled defaultOpen {...{ triggerPress, itemPress, onValueChange, onOpenChange }} />);
    for (const id of ["trigger", "banana"]) {
      expect(host(tree, id).props.disabled).toBe(true);
      expect(host(tree, id).props.accessibilityState.disabled).toBe(true);
      press(tree, id);
    }
    for (const callback of [triggerPress, itemPress, onValueChange, onOpenChange]) expect(callback).not.toHaveBeenCalled();
  });

  it("disabled items do not select or close while an enabled trigger still opens", () => {
    const onValueChange = vi.fn(), itemPress = vi.fn();
    const tree = render(<Example itemDisabled {...{ onValueChange, itemPress }} />);
    press(tree, "trigger"); press(tree, "banana");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(itemPress).not.toHaveBeenCalled();
    expect(host(tree, "trigger").props.accessibilityState.expanded).toBe(true);
  });

  it("preventDefault cancels trigger and item default actions", () => {
    const cancel = (e: GestureResponderEvent) => e.preventDefault();
    const onValueChange = vi.fn(), onOpenChange = vi.fn();
    const tree = render(<Example triggerPress={cancel} {...{ onValueChange, onOpenChange }} />);
    press(tree, "trigger");
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => tree.update(<Example defaultOpen itemPress={cancel} {...{ onValueChange, onOpenChange }} />));
    // defaultOpen is mount-only; open it using the now-unblocked trigger.
    press(tree, "trigger"); onOpenChange.mockClear();
    press(tree, "banana");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("controlled value/open notify without changing until the parent rerenders", () => {
    const onOpenChange = vi.fn(), onValueChange = vi.fn();
    const tree = render(<Example open value="apple" {...{ onOpenChange, onValueChange }} />);
    press(tree, "banana");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(host(tree, "banana").props.accessibilityState.selected).toBe(false);
    expect(host(tree, "trigger").props.accessibilityState.expanded).toBe(true);
    act(() => tree.update(<Example open value="banana" />));
    expect(host(tree, "banana").props.accessibilityState.selected).toBe(true);
    act(() => tree.update(<Example open={false} value="banana" />));
    expect(host(tree, "banana")).toBeUndefined();
  });

  it("preserves extra accessibility state and forwards trigger/item refs", () => {
    const triggerRef = React.createRef<any>(), itemRef = React.createRef<any>();
    const tree = render(<Select defaultOpen defaultValue="banana">
      <SelectTrigger ref={triggerRef} testID="trigger" accessibilityState={{ busy: true }} />
      <SelectContent><SelectItem ref={itemRef} testID="banana" value="banana" accessibilityState={{ busy: true }}>Banana</SelectItem></SelectContent>
    </Select>, { createNodeMock: el => ({ testID: (el.props as { testID?: string }).testID }) });
    expect(host(tree, "trigger").props.accessibilityState).toEqual({ busy: true, disabled: false, expanded: true });
    expect(host(tree, "banana").props.accessibilityState).toEqual({ busy: true, disabled: false, selected: true });
    expect(triggerRef.current.testID).toBe("trigger");
    expect(itemRef.current.testID).toBe("banana");
  });
});
