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

vi.mock("../icons/index.native", () => ({
  CheckIcon: () => null,
}));

import TestRenderer from "react-test-renderer";
import { Checkbox } from "./checkbox.native";

function renderCheckbox(element: React.ReactElement) {
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

describe("Checkbox (native contract)", () => {
  it("exposes checkbox role and checked state", () => {
    const tree = renderCheckbox(<Checkbox aria-label="Accept" />);
    const props = pressProps(tree);
    expect(props.accessibilityRole).toBe("checkbox");
    expect(props.accessibilityState).toMatchObject({ checked: false, disabled: false });
  });

  it("toggles uncontrolled checked and notifies", () => {
    const onCheckedChange = vi.fn();
    const tree = renderCheckbox(<Checkbox aria-label="Accept" onCheckedChange={onCheckedChange} />);
    expect(pressProps(tree).accessibilityState.checked).toBe(false);
    TestRenderer.act(() => {
      pressProps(tree).onPress({ defaultPrevented: false });
    });
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(pressProps(tree).accessibilityState.checked).toBe(true);
    TestRenderer.act(() => {
      pressProps(tree).onPress({ defaultPrevented: false });
    });
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(pressProps(tree).accessibilityState.checked).toBe(false);
  });

  it("blocks toggle, onPress, and onCheckedChange when disabled", () => {
    const onPress = vi.fn();
    const onCheckedChange = vi.fn();
    const tree = renderCheckbox(
      <Checkbox aria-label="Blocked" disabled onPress={onPress} onCheckedChange={onCheckedChange} />,
    );
    const props = pressProps(tree);
    expect(props.disabled).toBe(true);
    expect(props.accessibilityState).toMatchObject({ disabled: true });
    TestRenderer.act(() => {
      props.onPress({ defaultPrevented: false });
    });
    expect(onPress).not.toHaveBeenCalled();
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(pressProps(tree).accessibilityState.checked).toBe(false);
  });

  it("reports indeterminate as mixed and advances to checked", () => {
    const onCheckedChange = vi.fn();
    const tree = renderCheckbox(
      <Checkbox aria-label="All" defaultChecked="indeterminate" onCheckedChange={onCheckedChange} />,
    );
    expect(pressProps(tree).accessibilityState.checked).toBe("mixed");
    TestRenderer.act(() => {
      pressProps(tree).onPress({ defaultPrevented: false });
    });
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(pressProps(tree).accessibilityState.checked).toBe(true);
  });

  it("calls onPress but does not toggle when defaultPrevented", () => {
    const onPress = vi.fn();
    const onCheckedChange = vi.fn();
    const tree = renderCheckbox(
      <Checkbox aria-label="Guarded" onPress={onPress} onCheckedChange={onCheckedChange} />,
    );
    TestRenderer.act(() => {
      pressProps(tree).onPress({ defaultPrevented: true });
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(pressProps(tree).accessibilityState.checked).toBe(false);
  });

  it("merges caller accessibilityState instead of clobbering checked/disabled", () => {
    const tree = renderCheckbox(
      <Checkbox aria-label="Merged" accessibilityState={{ busy: true } as any} />,
    );
    expect(pressProps(tree).accessibilityState).toMatchObject({
      busy: true,
      checked: false,
      disabled: false,
    });
  });

  it("forwards refs to the underlying pressable and clears on unmount", () => {
    const ref = React.createRef<any>();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(<Checkbox ref={ref} aria-label="Ref" />);
    });
    expect(ref.current).toBeTruthy();
    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(ref.current).toBeNull();
  });
});
