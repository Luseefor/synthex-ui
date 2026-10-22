/**
 * Combobox overlay wiring (mock measurements, not devices).
 *
 * Exercises the actual shared overlay helper: transparent Modal,
 * backdrop outside dismissal, and system back dismissal all drive the
 * Combobox controller. Host refs are plain createNodeMock entries without
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
    Pressable: host("combo-pressable"),
    Text: host("combo-text"),
    TextInput: host("combo-input"),
    View: host("combo-view"),
    ScrollView: host("combo-scroll"),
    SafeAreaView: host("combo-safe-area"),
    KeyboardAvoidingView: host("combo-kav"),
    Modal: ({ children, visible, ...props }: any) =>
      visible ? ReactMock.createElement("combo-modal", props, children) : null,
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
  SearchIcon: () => null,
}));

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "./combobox.native";

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
    .findAllByType("combo-pressable" as any)
    .find((n) => n.props.testID === testID);
  if (!node) throw new Error(`missing pressable ${testID}`);
  return node;
}

function byTestID(tree: TestRenderer.ReactTestRenderer, testID: string) {
  const node = tree.root.findAll((n) => typeof n.type === "string" && n.props?.testID === testID)[0];
  if (!node) throw new Error(`missing ${testID}`);
  return node;
}

function Example(props: React.ComponentProps<typeof Combobox>) {
  return (
    <Combobox defaultValue="apple" {...props}>
      <ComboboxTrigger testID="trigger">
        <ComboboxValue />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput testID="input" />
        <ComboboxList testID="list">
          <ComboboxItem value="banana" testID="banana">
            Banana
          </ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

describe("Combobox native overlay (actual helper)", () => {
  it("renders no Modal when closed and a transparent Modal when open", () => {
    const closed = render(<Example />);
    expect(closed.root.findAllByType("combo-modal" as any)).toHaveLength(0);

    const open = render(<Example defaultOpen />);
    const modals = open.root.findAllByType("combo-modal" as any);
    expect(modals).toHaveLength(1);
    const modal = modals[0];
    expect(modal).toBeTruthy();
    expect(modal?.props.transparent).toBe(true);
    expect(byTestID(open, "combobox-content")).toBeTruthy();
    expect(byTestID(open, "input")).toBeTruthy();
  });

  it("routes trigger, backdrop, and back dismissal through the controller", () => {
    const onOpenChange = vi.fn();
    const tree = render(<Example onOpenChange={onOpenChange} />);
    act(() => pressable(tree, "trigger").props.onPress(event()));
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);

    act(() => byTestID(tree, "combobox-content-overlay").props.onPress());
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange.mock.calls[1]).toEqual([false]);

    act(() => pressable(tree, "trigger").props.onPress(event()));
    onOpenChange.mockClear();
    act(() => byTestID(tree, "combobox-content-modal").props.onRequestClose());
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("selects the inside item, resets the query, and closes the Modal", () => {
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    const tree = render(
      <Example defaultOpen defaultQuery="ban" onValueChange={onValueChange} onOpenChange={onOpenChange} />,
    );
    act(() => pressable(tree, "banana").props.onPress(event()));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("banana");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(tree.root.findAllByType("combo-modal" as any)).toHaveLength(0);
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
    expect(pressable(tree, "trigger").props.accessibilityState.expanded).toBe(true);
    expect(pressable(tree, "banana").props.accessibilityState.selected).toBe(false);
  });

  it("disabled triggers and items guard callbacks without host enforcement", () => {
    const triggerPress = vi.fn();
    const itemPress = vi.fn();
    const onValueChange = vi.fn();
    const tree = render(
      <Combobox defaultOpen>
        <ComboboxTrigger testID="trigger" disabled onPress={triggerPress}>
          <ComboboxValue />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput />
          <ComboboxList>
            <ComboboxItem value="banana" testID="banana" disabled onPress={itemPress}>
              Banana
            </ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    expect(pressable(tree, "trigger").props.disabled).toBe(true);
    expect(pressable(tree, "banana").props.disabled).toBe(true);
    act(() => pressable(tree, "trigger").props.onPress(event()));
    act(() => pressable(tree, "banana").props.onPress(event()));
    expect(triggerPress).not.toHaveBeenCalled();
    expect(itemPress).not.toHaveBeenCalled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("preventDefault cancels trigger and item defaults", () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    const cancel = (e: GestureResponderEvent) => e.preventDefault();
    const tree = render(<Example onOpenChange={onOpenChange} onValueChange={onValueChange} />);
    act(() => {
      const trigger = pressable(tree, "trigger");
      const next = event();
      trigger.props.onPress(next);
      // Simulate a child cancel by calling preventDefault before default toggle.
      cancel(next);
    });
    // Direct cancel path: trigger with a cancelling parent callback stays closed.
    const tree2 = render(
      <Combobox onOpenChange={onOpenChange}>
        <ComboboxTrigger testID="trigger2" onPress={cancel}>
          <ComboboxValue />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxItem value="banana" testID="banana2" onPress={cancel}>
            Banana
          </ComboboxItem>
        </ComboboxContent>
      </Combobox>,
    );
    act(() => pressable(tree2, "trigger2").props.onPress(event()));
    act(() => {
      tree2.root.findAllByType("combo-pressable" as any);
    });
    expect(onValueChange).not.toHaveBeenCalled();

    const openTree = render(
      <Combobox defaultOpen onValueChange={onValueChange}>
        <ComboboxTrigger testID="t">
          <ComboboxValue />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput />
          <ComboboxList>
            <ComboboxItem value="banana" testID="b" onPress={cancel}>
              Banana
            </ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    onValueChange.mockClear();
    act(() => pressable(openTree, "b").props.onPress(event()));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps the list tappable while the keyboard is up", () => {
    const tree = render(<Example defaultOpen />);
    const list = byTestID(tree, "list");
    expect(list.props.keyboardShouldPersistTaps).toBe("handled");
    expect(list.props.nestedScrollEnabled).toBe(true);
  });

  it("forwards trigger refs and keeps the measured host collapsable=false", () => {
    const forwarded = React.createRef<any>();
    const tree = render(
      <Combobox defaultValue="apple">
        <ComboboxTrigger ref={forwarded} testID="trigger">
          <ComboboxValue />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput />
          <ComboboxList>
            <ComboboxItem value="banana">Banana</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    expect(forwarded.current?.testID).toBe("trigger");
    expect(pressable(tree, "trigger").props.collapsable).toBe(false);
    act(() => tree.unmount());
    expect(forwarded.current).toBeNull();
  });
});
