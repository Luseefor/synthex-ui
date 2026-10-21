import * as React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  return {
    Pressable: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      ReactMock.useImperativeHandle(ref, () => ({ __mockPressable: true }));
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-pressable", rest, children);
    }),
    Text: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      ReactMock.useImperativeHandle(ref, () => ({ __mockText: true }));
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-text", rest, children);
    }),
    View: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      ReactMock.useImperativeHandle(ref, () => ({ __mockView: true }));
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-view", rest, children);
    }),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
    Platform: {
      OS: "ios",
      select: (options: any) => options.ios ?? options.default,
    },
  };
});

import TestRenderer from "react-test-renderer";
import { Switch } from "./switch.native";

function renderSwitch(element: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree!;
}

function pressProps(tree: TestRenderer.ReactTestRenderer) {
  const nodes = tree.root.findAll((node) => (node.type as unknown as string) === "mock-pressable");
  if (nodes.length === 0) {
    throw new Error("mock-pressable not found");
  }
  return nodes[0]!.props as any;
}

describe("Switch (native contract)", () => {
  it("exposes switch role and checked state", () => {
    const tree = renderSwitch(<Switch aria-label="Alerts" />);
    const props = pressProps(tree);
    expect(props.accessibilityRole).toBe("switch");
    expect(props.accessibilityState).toMatchObject({ checked: false, disabled: false });
  });

  it("toggles uncontrolled checked and notifies", () => {
    const onCheckedChange = vi.fn();
    const tree = renderSwitch(<Switch aria-label="Alerts" onCheckedChange={onCheckedChange} />);
    TestRenderer.act(() => {
      pressProps(tree).onPress({ defaultPrevented: false });
    });
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(pressProps(tree).accessibilityState.checked).toBe(true);
  });

  it("blocks toggle, onPress, and onCheckedChange when disabled", () => {
    const onPress = vi.fn();
    const onCheckedChange = vi.fn();
    const tree = renderSwitch(
      <Switch aria-label="Blocked" disabled onPress={onPress} onCheckedChange={onCheckedChange} />,
    );
    expect(pressProps(tree).disabled).toBe(true);
    expect(pressProps(tree).accessibilityState).toMatchObject({ disabled: true });
    TestRenderer.act(() => {
      pressProps(tree).onPress({ defaultPrevented: false });
    });
    expect(onPress).not.toHaveBeenCalled();
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(pressProps(tree).accessibilityState.checked).toBe(false);
  });

  it("calls onPress but does not toggle when defaultPrevented", () => {
    const onPress = vi.fn();
    const onCheckedChange = vi.fn();
    const tree = renderSwitch(
      <Switch aria-label="Guarded" onPress={onPress} onCheckedChange={onCheckedChange} />,
    );
    TestRenderer.act(() => {
      pressProps(tree).onPress({ defaultPrevented: true });
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(pressProps(tree).accessibilityState.checked).toBe(false);
  });

  it("merges caller accessibilityState instead of clobbering checked/disabled", () => {
    const tree = renderSwitch(
      <Switch aria-label="Merged" accessibilityState={{ expanded: true } as any} />,
    );
    expect(pressProps(tree).accessibilityState).toMatchObject({
      expanded: true,
      checked: false,
      disabled: false,
    });
  });

  it("forwards refs to the underlying pressable and clears on unmount", () => {
    const ref = React.createRef<any>();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(<Switch ref={ref} aria-label="Ref" />);
    });
    expect(ref.current).toBeTruthy();
    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(ref.current).toBeNull();
  });
});
