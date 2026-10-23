import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockState = vi.hoisted(() => ({
  panConfigs: [] as Array<any>,
}));

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  return {
    Pressable: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      ReactMock.useImperativeHandle(ref, () => ({ __mockPressable: true }));
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-pressable", rest, children);
    }),
    View: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      ReactMock.useImperativeHandle(ref, () => ({ __mockView: true }));
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-view", rest, children);
    }),
    PanResponder: {
      create: (cfg: any) => {
        mockState.panConfigs.push(cfg);
        return { panHandlers: cfg };
      },
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
    Platform: { OS: "ios", select: (o: any) => o.ios ?? o.default },
  };
});

import TestRenderer from "react-test-renderer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable.native";
import { NativeDirectionContext } from "../_shared/direction-context.native";

function resetMocks() {
  mockState.panConfigs = [];
}

function render(element: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree!;
}

function panels(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll(
    (n) =>
      (n.type as unknown as string) === "mock-view" &&
      typeof (n.props as any).testID === "string" &&
      ((n.props as any).testID === "resizable-panel" ||
        (((n.props as any).testID as string).startsWith("resizable-panel-") &&
          (n.props as any).testID !== "resizable-panel-group")),
  );
}

function handles(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll(
    (n) => (n.type as unknown as string) === "mock-pressable",
  );
}

function wrappers(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll(
    (n) =>
      (n.type as unknown as string) === "mock-view" &&
      typeof (n.props as any).onMoveShouldSetPanResponderCapture === "function",
  );
}

function groupNode(tree: TestRenderer.ReactTestRenderer) {
  const nodes = tree.root.findAll(
    (n) =>
      (n.type as unknown as string) === "mock-view" &&
      (n.props as any).testID === "resizable-panel-group",
  );
  if (nodes.length === 0) throw new Error("group not found");
  return nodes[0]!;
}

function firePanelLayouts(
  tree: TestRenderer.ReactTestRenderer,
  extents: number[],
  vertical = false,
) {
  const nodes = panels(tree);
  expect(nodes.length).toBe(extents.length);
  TestRenderer.act(() => {
    nodes.forEach((node, index) => {
      const extent = extents[index] as number;
      (node.props as any).onLayout({
        nativeEvent: {
          layout: vertical
            ? { x: 0, y: 0, width: 100, height: extent }
            : { x: 0, y: 0, width: extent, height: 100 },
        },
      });
    });
  });
}

function fireGroupLayout(
  tree: TestRenderer.ReactTestRenderer,
  extent: number,
  vertical = false,
) {
  TestRenderer.act(() => {
    (groupNode(tree).props as any).onLayout({
      nativeEvent: {
        layout: vertical
          ? { x: 0, y: 0, width: 100, height: extent }
          : { x: 0, y: 0, width: extent, height: 100 },
      },
    });
  });
}

function capture(
  tree: TestRenderer.ReactTestRenderer,
  handleIndex: number,
  dx: number,
  dy = 0,
) {
  let result: boolean | undefined;
  TestRenderer.act(() => {
    result = (wrappers(tree)[handleIndex]!.props as any)
      .onMoveShouldSetPanResponderCapture(
        {},
        { dx, dy, numberActiveTouches: 1 },
      );
  });
  return result;
}

function grant(tree: TestRenderer.ReactTestRenderer, handleIndex: number) {
  TestRenderer.act(() => {
    (wrappers(tree)[handleIndex]!.props as any).onPanResponderGrant(
      { nativeEvent: {} },
      { dx: 0, dy: 0, numberActiveTouches: 1 },
    );
  });
}

function move(
  tree: TestRenderer.ReactTestRenderer,
  handleIndex: number,
  dx: number,
  dy = 0,
) {
  TestRenderer.act(() => {
    (wrappers(tree)[handleIndex]!.props as any).onPanResponderMove(
      { nativeEvent: {} },
      { dx, dy, numberActiveTouches: 1 },
    );
  });
}

function release(
  tree: TestRenderer.ReactTestRenderer,
  handleIndex: number,
  dx: number,
  dy = 0,
) {
  TestRenderer.act(() => {
    (wrappers(tree)[handleIndex]!.props as any).onPanResponderRelease(
      { nativeEvent: {} },
      { dx, dy, numberActiveTouches: 1 },
    );
  });
}

function terminate(tree: TestRenderer.ReactTestRenderer, handleIndex: number) {
  TestRenderer.act(() => {
    (wrappers(tree)[handleIndex]!.props as any).onPanResponderTerminate(
      { nativeEvent: {} },
      { numberActiveTouches: 1 },
    );
  });
}

function twoPanelGroup(props: Record<string, any> = {}) {
  return (
    <ResizablePanelGroup direction="horizontal" {...props}>
      <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
    </ResizablePanelGroup>
  );
}

beforeEach(() => {
  resetMocks();
});

describe("Resizable native contract", () => {
  it("cancels on an additional touch without committing or resuming centroid movement", () => {
    const onSizesChange = vi.fn();
    const onSizesCommit = vi.fn();
    const tree = render(twoPanelGroup({ onSizesChange, onSizesCommit }));
    firePanelLayouts(tree, [100, 100]);
    capture(tree, 0, 10);
    grant(tree, 0);
    move(tree, 0, 10);
    const calls = onSizesChange.mock.calls.length;
    expect(calls).toBe(1);
    TestRenderer.act(() => wrappers(tree)[0]!.props.onPanResponderStart({}, { numberActiveTouches: 2 }));
    move(tree, 0, 100);
    release(tree, 0, 100);
    expect(onSizesChange).toHaveBeenCalledTimes(calls);
    expect(onSizesCommit).not.toHaveBeenCalled();
    TestRenderer.act(() => tree.unmount());
  });

  it("keeps the adjustable role and exposed handle after caller props are composed", () => {
    const tree = render(<ResizablePanelGroup direction="horizontal">
      <ResizablePanel>{null}</ResizablePanel>
      <ResizableHandle accessible={false} accessibilityRole="button" accessibilityState={{ busy: true }} />
      <ResizablePanel>{null}</ResizablePanel>
    </ResizablePanelGroup>);
    expect(handles(tree)[0]!.props).toMatchObject({ accessible: true, accessibilityRole: "adjustable", accessibilityState: { busy: true, disabled: false } });
    TestRenderer.act(() => tree.unmount());
  });

  it("retains valid layout measurements when bounds change without changing panel pixels", () => {
    const onSizesChange = vi.fn();
    const content = (min: number) => <ResizablePanelGroup direction="horizontal" onSizesChange={onSizesChange}>
      <ResizablePanel defaultSize={50} minSize={min}>{null}</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
    </ResizablePanelGroup>;
    const tree = render(content(15));
    firePanelLayouts(tree, [100, 100]);
    TestRenderer.act(() => tree.update(content(10)));
    capture(tree, 0, 10);
    grant(tree, 0);
    move(tree, 0, 10);
    expect(onSizesChange).toHaveBeenCalledExactlyOnceWith([60, 40]);
    TestRenderer.act(() => tree.unmount());
  });

  it("cancels a drag when keyed panels are reordered", () => {
    const onSizesCommit = vi.fn();
    const content = (reverse: boolean) => <ResizablePanelGroup direction="horizontal" onSizesCommit={onSizesCommit}>
      <ResizablePanel key={reverse ? "b" : "a"} defaultSize={50}>{null}</ResizablePanel>
      <ResizableHandle key="handle" />
      <ResizablePanel key={reverse ? "a" : "b"} defaultSize={50}>{null}</ResizablePanel>
    </ResizablePanelGroup>;
    const tree = render(content(false));
    firePanelLayouts(tree, [100, 100]);
    capture(tree, 0, 10);
    grant(tree, 0);
    move(tree, 0, 10);
    TestRenderer.act(() => tree.update(content(true)));
    release(tree, 0, 40);
    expect(onSizesCommit).not.toHaveBeenCalled();
    TestRenderer.act(() => tree.unmount());
  });

  it("rejects stray text children instead of silently dropping them", () => {
    expect(() => render(<ResizablePanelGroup direction="horizontal">
      <ResizablePanel>{null}</ResizablePanel>{"unexpected"}
    </ResizablePanelGroup>)).toThrow(/only ResizablePanel/);
  });
  it("uses capture path for axis intent and keeps start false", () => {
    const tree = render(twoPanelGroup());
    expect(mockState.panConfigs.length).toBe(1);
    const cfg = mockState.panConfigs[0];
    expect(cfg.onStartShouldSetPanResponder()).toBe(false);
    expect(cfg.onStartShouldSetPanResponderCapture()).toBe(false);
    expect(cfg.onMoveShouldSetPanResponder()).toBe(false);
    expect(
      cfg.onMoveShouldSetPanResponderCapture(
        {},
        { dx: 10, dy: 2, numberActiveTouches: 1 },
      ),
    ).toBe(true);
    expect(
      cfg.onMoveShouldSetPanResponderCapture(
        {},
        { dx: 2, dy: 10, numberActiveTouches: 1 },
      ),
    ).toBe(false);
    expect(
      cfg.onMoveShouldSetPanResponderCapture(
        {},
        { dx: 3, dy: 0, numberActiveTouches: 1 },
      ),
    ).toBe(false);
    expect(
      cfg.onMoveShouldSetPanResponderCapture(
        {},
        { dx: 10, dy: 0, numberActiveTouches: 2 },
      ),
    ).toBe(false);
    tree.unmount();
  });

  it("stores capture delta before grant reset and applies total delta", () => {
    const onChange = vi.fn();
    const tree = render(twoPanelGroup({ onSizesChange: onChange }));
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 5, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0][0]).toBeCloseTo(57.5, 5);
    expect(onChange.mock.calls[0]![0][1]).toBeCloseTo(42.5, 5);
    tree.unmount();
  });

  it("drags the adjacent pair with min clamp and leaves other panels unchanged", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel defaultSize={40} minSize={15}>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={30} minSize={15}>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={30} minSize={15}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [80, 60, 60]);
    fireGroupLayout(tree, 224);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, -100, 0);
    release(tree, 0, -100, 0);
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(last[0]).toBeCloseTo(15, 5);
    expect(last[1]).toBeCloseTo(55, 5);
    expect(last[2]).toBeCloseTo(30, 5);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0]![0]).toEqual(last);
    tree.unmount();
  });

  it("drags vertically without dir flip and requires vertical intent", () => {
    const onChange = vi.fn();
    const tree = render(
      <ResizablePanelGroup direction="vertical" onSizesChange={onChange}>
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100], true);
    fireGroupLayout(tree, 212, true);
    expect(capture(tree, 0, 0, 10)).toBe(true);
    expect(capture(tree, 0, 10, 0)).toBe(false);
    expect(capture(tree, 0, 0, 10)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 0, 10);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0][0]).toBeCloseTo(60, 5);
    expect(onChange.mock.calls[0]![0][1]).toBeCloseTo(40, 5);
    tree.unmount();
  });

  it("flips horizontal logical delta in RTL and inherits context dir", () => {
    const onChange = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        dir="rtl"
        onSizesChange={onChange}
      >
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 10, 0);
    expect(onChange.mock.calls[0]![0][0]).toBeCloseTo(40, 5);
    tree.unmount();

    const ctxChange = vi.fn();
    const ctxTree = render(
      <NativeDirectionContext.Provider
        value={{ dir: "rtl", setDir: () => {}, toggleDir: () => {} }}
      >
        <ResizablePanelGroup direction="horizontal" onSizesChange={ctxChange}>
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        </ResizablePanelGroup>
      </NativeDirectionContext.Provider>,
    );
    firePanelLayouts(ctxTree, [100, 100]);
    fireGroupLayout(ctxTree, 212);
    expect(capture(ctxTree, 0, 10, 0)).toBe(true);
    grant(ctxTree, 0);
    move(ctxTree, 0, 10, 0);
    expect(ctxChange.mock.calls[0]![0][0]).toBeCloseTo(40, 5);
    ctxTree.unmount();
  });

  it("ignores moves before a valid positive panel span", () => {
    const onChange = vi.fn();
    const tree = render(twoPanelGroup({ onSizesChange: onChange }));
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 20, 0);
    release(tree, 0, 20, 0);
    expect(onChange).not.toHaveBeenCalled();
    tree.unmount();
  });

  it("blocks capture, press, and actions when group or self disabled", () => {
    const onPress = vi.fn();
    const onPressIn = vi.fn();
    const onChange = vi.fn();
    const tree = render(
      <ResizablePanelGroup direction="horizontal" disabled onSizesChange={onChange}>
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizableHandle onPress={onPress} onPressIn={onPressIn} />
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(false);
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onPressIn({ nativeEvent: {} });
    });
    expect(onPressIn).not.toHaveBeenCalled();
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onPress({ nativeEvent: {} });
    });
    expect(onPress).not.toHaveBeenCalled();
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onAccessibilityAction({
        nativeEvent: { actionName: "increment" },
        defaultPrevented: false,
      });
    });
    expect(onChange).not.toHaveBeenCalled();
    tree.unmount();

    const selfTree = render(twoPanelGroup({}));
    firePanelLayouts(selfTree, [100, 100]);
    fireGroupLayout(selfTree, 212);
    TestRenderer.act(() => {
      selfTree.update(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
          <ResizableHandle disabled onPress={onPress} />
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    expect(capture(selfTree, 0, 10, 0)).toBe(false);
    selfTree.unmount();
  });

  it("cancels on disable mid-drag without commit and retains reported sizes", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      twoPanelGroup({ onSizesChange: onChange, onSizesCommit: onCommit }),
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 10, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    TestRenderer.act(() => {
      tree.update(
        twoPanelGroup({
          onSizesChange: onChange,
          onSizesCommit: onCommit,
          disabled: true,
        }),
      );
    });
    move(tree, 0, 30, 0);
    release(tree, 0, 30, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
    tree.unmount();
  });

  it("cancels on group extent change but tolerates panel layout drift", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      twoPanelGroup({ onSizesChange: onChange, onSizesCommit: onCommit }),
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 10, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    firePanelLayouts(tree, [120, 80]);
    move(tree, 0, 20, 0);
    expect(onChange).toHaveBeenCalledTimes(2);
    fireGroupLayout(tree, 300);
    move(tree, 0, 30, 0);
    release(tree, 0, 30, 0);
    expect(onCommit).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(2);
    tree.unmount();
  });

  it("cancels on semantic config change without commit", () => {
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        resizeStep={5}
        onSizesChange={vi.fn()}
        onSizesCommit={onCommit}
      >
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 10, 0);
    TestRenderer.act(() => {
      tree.update(
        <ResizablePanelGroup
          direction="horizontal"
          resizeStep={10}
          onSizesChange={vi.fn()}
          onSizesCommit={onCommit}
        >
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    release(tree, 0, 10, 0);
    expect(onCommit).not.toHaveBeenCalled();
    tree.unmount();
  });

  it("renders controlled sizes only and commits proposed on release", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        sizes={[50, 50]}
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 10, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0][0]).toBeCloseTo(60, 5);
    release(tree, 0, 10, 0);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0]![0][0]).toBeCloseTo(60, 5);
    tree.unmount();
  });

  it("does not notify or commit for noops", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        sizes={[15, 85]}
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel minSize={15}>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={15}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [30, 170]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, -10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, -10, 0);
    release(tree, 0, -10, 0);
    expect(onChange).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onAccessibilityAction({
        nativeEvent: { actionName: "decrement" },
        defaultPrevented: false,
      });
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
    tree.unmount();
  });

  it("exposes adjustable handles with pair bounds and default labels", () => {
    const tree = render(twoPanelGroup({}));
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    const handle = handles(tree)[0]!;
    expect(handle.props.accessibilityRole).toBe("adjustable");
    expect(handle.props.accessibilityLabel).toBe("Resize panels 1 and 2");
    expect(handle.props.accessibilityValue).toMatchObject({
      min: 15,
      max: 85,
      now: 50,
    });
    tree.unmount();
  });

  it("supports three panels with independent second pair", () => {
    const onChange = vi.fn();
    const tree = render(
      <ResizablePanelGroup direction="horizontal" onSizesChange={onChange}>
        <ResizablePanel defaultSize={34}>{null}</ResizablePanel>
        <ResizableHandle testID="resizable-handle-0" />
        <ResizablePanel defaultSize={33}>{null}</ResizablePanel>
        <ResizableHandle testID="resizable-handle-1" />
        <ResizablePanel defaultSize={33}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [68, 66, 66]);
    fireGroupLayout(tree, 224);
    expect(wrappers(tree).length).toBe(2);
    expect(capture(tree, 1, 10, 0)).toBe(true);
    grant(tree, 1);
    move(tree, 1, 10, 0);
    const last = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(last[0]).toBeCloseTo(34, 5);
    expect(last[1]).toBeCloseTo(43, 5);
    expect(last[2]).toBeCloseTo(23, 5);
    expect(handles(tree)[1]!.props.accessibilityLabel).toBe(
      "Resize panels 2 and 3",
    );
    tree.unmount();
  });

  it("runs caller a11y first and honors preventDefault and custom actions", () => {
    const caller = vi.fn();
    const onChange = vi.fn();
    const tree = render(
      <ResizablePanelGroup direction="horizontal" onSizesChange={onChange}>
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizableHandle
          accessibilityLabel="Custom split"
          accessibilityActions={[{ name: "increment" }, { name: "activate" }]}
          onAccessibilityAction={caller}
        />
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    const handle = handles(tree)[0]!;
    expect(handle.props.accessibilityLabel).toBe("Custom split");
    expect(handle.props.accessibilityActions).toEqual([
      { name: "increment" },
      { name: "activate" },
      { name: "decrement" },
    ]);
    const prevented = { nativeEvent: { actionName: "increment" }, defaultPrevented: true };
    TestRenderer.act(() => {
      handle.props.onAccessibilityAction(prevented);
    });
    expect(caller).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onAccessibilityAction({
        nativeEvent: { actionName: "increment" },
        defaultPrevented: false,
      });
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0][0]).toBeCloseTo(55, 5);
    tree.unmount();
  });

  it("preserves taps and caller press callbacks without resizing", () => {
    const onPress = vi.fn();
    const onPressIn = vi.fn();
    const onPressOut = vi.fn();
    const onChange = vi.fn();
    const tree = render(
      <ResizablePanelGroup direction="horizontal" onSizesChange={onChange}>
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizableHandle
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <React.Fragment>grip</React.Fragment>
        </ResizableHandle>
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onPressIn({ nativeEvent: {} });
    });
    expect(onPressIn).toHaveBeenCalledTimes(1);
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onPress({ nativeEvent: {} });
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onPressOut({ nativeEvent: {} });
    });
    expect(onPressOut).toHaveBeenCalledTimes(1);
    move(tree, 0, 10, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    release(tree, 0, 10, 0);
    const calls = onPress.mock.calls.length;
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onPress({ nativeEvent: {} });
    });
    expect(onPress.mock.calls.length).toBe(calls);
    tree.unmount();
  });

  it("throws RangeError for invalid resizeStep but defaults when undefined", () => {
    expect(() =>
      render(
        <ResizablePanelGroup direction="horizontal" resizeStep={0}>
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      ),
    ).toThrow(RangeError);
    expect(() =>
      render(
        <ResizablePanelGroup direction="horizontal" resizeStep={-2}>
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      ),
    ).toThrow(RangeError);
    expect(() =>
      render(
        <ResizablePanelGroup direction="horizontal" resizeStep={Number.NaN}>
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      ),
    ).toThrow(RangeError);
    expect(() =>
      render(
        <ResizablePanelGroup direction="horizontal" resizeStep={Number.POSITIVE_INFINITY}>
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      ),
    ).toThrow(RangeError);
    const tree = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onAccessibilityAction({
        nativeEvent: { actionName: "increment" },
        defaultPrevented: false,
      });
    });
    tree.unmount();
  });

  it("commits return-to-origin when a controlled drag goes out and back", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        sizes={[50, 50]}
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 10, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0][0]).toBeCloseTo(60, 5);
    move(tree, 0, -10, 0);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.calls[1]![0][0]).toBeCloseTo(50, 5);
    release(tree, 0, -10, 0);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0]![0][0]).toBeCloseTo(50, 5);
    tree.unmount();
  });

  it("cancels when the controlled parent corrects beyond snapshot and proposal", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        sizes={[50, 50]}
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 20, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    TestRenderer.act(() => {
      tree.update(
        <ResizablePanelGroup
          direction="horizontal"
          sizes={[70, 30]}
          onSizesChange={onChange}
          onSizesCommit={onCommit}
        >
          <ResizablePanel>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    move(tree, 0, 30, 0);
    release(tree, 0, 30, 0);
    expect(onCommit).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(1);
    tree.unmount();
  });

  it("commits latest proposal when a delayed older echo arrives before release", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        sizes={[50, 50]}
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 20, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    const first = [...(onChange.mock.calls[0]![0] as number[])];
    move(tree, 0, 30, 0);
    expect(onChange).toHaveBeenCalledTimes(2);
    const second = [...(onChange.mock.calls[1]![0] as number[])];
    // Delayed echo of the older proposal arrives after the newer one.
    TestRenderer.act(() => {
      tree.update(
        <ResizablePanelGroup
          direction="horizontal"
          sizes={first}
          onSizesChange={onChange}
          onSizesCommit={onCommit}
        >
          <ResizablePanel>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    release(tree, 0, 30, 0);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0]![0]).toEqual(second);
    tree.unmount();
  });

  it("keeps dragging after an older pending echo arrives mid-gesture", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        sizes={[50, 50]}
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 20, 0);
    const first = [...(onChange.mock.calls[0]![0] as number[])];
    move(tree, 0, 30, 0);
    TestRenderer.act(() => {
      tree.update(
        <ResizablePanelGroup
          direction="horizontal"
          sizes={first}
          onSizesChange={onChange}
          onSizesCommit={onCommit}
        >
          <ResizablePanel>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    move(tree, 0, 40, 0);
    expect(onChange).toHaveBeenCalledTimes(3);
    release(tree, 0, 40, 0);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0]![0]).toEqual(onChange.mock.calls[2]![0]);
    tree.unmount();
  });

  it("still cancels when the parent corrects beyond acknowledged proposals", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        sizes={[50, 50]}
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 20, 0);
    const first = [...(onChange.mock.calls[0]![0] as number[])];
    TestRenderer.act(() => {
      tree.update(
        <ResizablePanelGroup
          direction="horizontal"
          sizes={first}
          onSizesChange={onChange}
          onSizesCommit={onCommit}
        >
          <ResizablePanel>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    TestRenderer.act(() => {
      tree.update(
        <ResizablePanelGroup
          direction="horizontal"
          sizes={[80, 20]}
          onSizesChange={onChange}
          onSizesCommit={onCommit}
        >
          <ResizablePanel>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    move(tree, 0, 30, 0);
    release(tree, 0, 30, 0);
    expect(onCommit).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(1);
    tree.unmount();
  });

  it("releases cleanly after repeated moves while props stay at acknowledged A", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        sizes={[50, 50]}
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 20, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    const first = [...(onChange.mock.calls[0]![0] as number[])];
    TestRenderer.act(() => {
      tree.update(
        <ResizablePanelGroup
          direction="horizontal"
          sizes={first}
          onSizesChange={onChange}
          onSizesCommit={onCommit}
        >
          <ResizablePanel>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    // Same totals while props stay at A: noop moves, no new proposals.
    move(tree, 0, 20, 0);
    move(tree, 0, 20, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    release(tree, 0, 20, 0);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0]![0]).toEqual(first);
    tree.unmount();
  });

  it("commits after repeated moves with no parent echo (rejected parent)", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        sizes={[50, 50]}
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 20, 0);
    move(tree, 0, 30, 0);
    expect(onChange).toHaveBeenCalledTimes(2);
    release(tree, 0, 30, 0);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit.mock.calls[0]![0]).toEqual(onChange.mock.calls[1]![0]);
    tree.unmount();
  });

  it("supports deeply nested fragments without duplicate keys", () => {
    const tree = render(
      <ResizablePanelGroup direction="horizontal">
        <React.Fragment>
          <React.Fragment>
            <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
          </React.Fragment>
        </React.Fragment>
      </ResizablePanelGroup>,
    );
    expect(panels(tree).length).toBe(2);
    expect(handles(tree).length).toBe(1);
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    tree.unmount();
  });

  it("keeps fractional controlled sizes exact across rerenders", () => {
    const fractional: readonly number[] = [28.399999999999995, 41.60000000000001, 30];
    const onChange = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        sizes={fractional}
        onSizesChange={onChange}
      >
        <ResizablePanel>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [56.8, 83.2, 60]);
    fireGroupLayout(tree, 224);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    TestRenderer.act(() => {
      tree.update(
        <ResizablePanelGroup
          direction="horizontal"
          sizes={fractional}
          onSizesChange={onChange}
        >
          <ResizablePanel>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    move(tree, 0, 10, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    tree.unmount();
  });

  it("reopens a 0% panel with minSize 0 from a zero extent", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        sizes={[0, 100]}
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel minSize={0}>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={0}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [0, 200]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 40, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0][0]).toBeCloseTo(25, 5);
    expect(onChange.mock.calls[0]![0][1]).toBeCloseTo(75, 5);
    release(tree, 0, 40, 0);
    expect(onCommit).toHaveBeenCalledTimes(1);
    tree.unmount();
  });

  it("cancels the own session without commit when self-disabled mid-drag", () => {
    const onPress = vi.fn();
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup
        direction="horizontal"
        onSizesChange={onChange}
        onSizesCommit={onCommit}
      >
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizableHandle onPress={onPress} />
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 10, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    TestRenderer.act(() => {
      tree.update(
        <ResizablePanelGroup
          direction="horizontal"
          onSizesChange={onChange}
          onSizesCommit={onCommit}
        >
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
          <ResizableHandle disabled onPress={onPress} />
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    move(tree, 0, 30, 0);
    release(tree, 0, 30, 0);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onPress({ nativeEvent: {} });
    });
    expect(onPress).not.toHaveBeenCalled();
    tree.unmount();
  });

  it("fills horizontal wrapper height while keeping width and vertical extent", () => {
    const tree = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizableHandle style={{ width: 20 } as any} />
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    const wrapperStyle = (wrappers(tree)[0]!.props as any).style;
    expect(wrapperStyle).toMatchObject({ flexShrink: 0, width: 12 });
    const handleStyle = handles(tree)[0]!.props.style;
    const resolved = (Array.isArray(handleStyle) ? handleStyle : [handleStyle]).flat();
    expect(resolved).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flexGrow: 1, flexBasis: 0, width: 12 }),
        expect.objectContaining({ width: 20 }),
      ]),
    );
    tree.unmount();

    const vertical = render(
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect((wrappers(vertical)[0]!.props as any).style).toMatchObject({
      flexShrink: 0,
      height: 12,
    });
    const verticalStyle = handles(vertical)[0]!.props.style;
    expect(
      (Array.isArray(verticalStyle) ? verticalStyle : [verticalStyle]).flat(),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ height: 12 })]));
    vertical.unmount();
  });

  it("rejects edge and duplicate handles clearly", () => {
    expect(() =>
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizableHandle />
          <ResizablePanel>{null}</ResizablePanel>
          <ResizablePanel>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      ),
    ).toThrow(/first child/i);
    expect(() =>
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>{null}</ResizablePanel>
          <ResizablePanel>{null}</ResizablePanel>
          <ResizableHandle />
        </ResizablePanelGroup>,
      ),
    ).toThrow(/last child/i);
    expect(() =>
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizableHandle />
          <ResizablePanel>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      ),
    ).toThrow(/between panels/i);
  });

  it("supports fragments and optional handles", () => {
    const tree = render(
      <ResizablePanelGroup direction="horizontal">
        <React.Fragment>
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        </React.Fragment>
      </ResizablePanelGroup>,
    );
    expect(panels(tree).length).toBe(2);
    expect(handles(tree).length).toBe(1);
    tree.unmount();

    const noHandle = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(panels(noHandle).length).toBe(2);
    expect(wrappers(noHandle).length).toBe(0);
    noHandle.unmount();
  });

  it("reports panel onResize initial and changed without duplicates", () => {
    const onResize = vi.fn();
    const tree = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={40} onResize={onResize}>{null}</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize.mock.calls[0]![1]).toBe(undefined);
    expect(onResize.mock.calls[0]![0]).toBeCloseTo(40, 5);
    firePanelLayouts(tree, [80, 120]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 20, 0);
    release(tree, 0, 20, 0);
    expect(onResize.mock.calls.length).toBeGreaterThan(1);
    const sizes = onResize.mock.calls.map((call) => call[0]);
    for (let index = 1; index < sizes.length; index += 1) {
      expect(sizes[index]).not.toBe(sizes[index - 1]);
    }
    tree.unmount();
  });

  it("keeps panel flex authoritative and composes handle style functions", () => {
    const tree = render(
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30} style={{ padding: 8, flexGrow: 999, backgroundColor: "pink" } as any}>{null}</ResizablePanel>
        <ResizableHandle style={() => ({ opacity: 0.9 })} />
        <ResizablePanel defaultSize={70}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    const panelStyle = panels(tree)[0]!.props.style;
    const flatPanel = Array.isArray(panelStyle) ? panelStyle.flat() : [panelStyle];
    const authoritative = flatPanel[flatPanel.length - 1];
    expect(Object.assign({}, ...flatPanel)).toMatchObject({ padding: 8, backgroundColor: "pink" });
    expect(authoritative).toMatchObject({
      flexBasis: 0,
      flexGrow: 30,
      flexShrink: 1,
      minWidth: 0,
      minHeight: 0,
    });
    const handleStyle = handles(tree)[0]!.props.style;
    expect(typeof handleStyle).toBe("function");
    const resolved = (handleStyle as (state: object) => unknown[])({});
    const flatHandle = resolved.flat() as Array<any>;
    expect(flatHandle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ minHeight: 12, minWidth: 12 }),
        expect.objectContaining({ width: 12 }),
        expect.objectContaining({ opacity: 0.9 }),
      ]),
    );
    tree.unmount();
  });

  it("forwards refs to all hosts and honors React 19 cleanup", () => {
    const groupRef = React.createRef<any>();
    const panelRef = React.createRef<any>();
    const handleRef = React.createRef<any>();
    const onLayout = vi.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <ResizablePanelGroup
          ref={groupRef}
          direction="horizontal"
          onLayout={onLayout}
        >
          <ResizablePanel ref={panelRef} defaultSize={50}>{null}</ResizablePanel>
          <ResizableHandle ref={handleRef} />
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    expect(groupRef.current).toBeTruthy();
    expect(panelRef.current).toBeTruthy();
    expect(handleRef.current).toBeTruthy();
    TestRenderer.act(() => {
      (groupNode(tree!).props as any).onLayout({
        nativeEvent: { layout: { x: 0, y: 0, width: 212, height: 100 } },
      });
    });
    expect(onLayout).toHaveBeenCalledTimes(1);
    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(groupRef.current).toBeNull();
    expect(panelRef.current).toBeNull();
    expect(handleRef.current).toBeNull();

    const cleanup = vi.fn();
    const callbackRef = vi.fn(() => cleanup);
    let callbackTree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      callbackTree = TestRenderer.create(
        <ResizablePanelGroup direction="horizontal" ref={callbackRef}>
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        </ResizablePanelGroup>,
      );
    });
    expect(callbackRef).toHaveBeenCalledTimes(1);
    TestRenderer.act(() => {
      callbackTree!.unmount();
    });
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("terminates without commit and suppresses the release tap", () => {    const onPress = vi.fn();
    const onCommit = vi.fn();
    const tree = render(
      <ResizablePanelGroup direction="horizontal" onSizesCommit={onCommit}>
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
        <ResizableHandle onPress={onPress} />
        <ResizablePanel defaultSize={50}>{null}</ResizablePanel>
      </ResizablePanelGroup>,
    );
    firePanelLayouts(tree, [100, 100]);
    fireGroupLayout(tree, 212);
    expect(capture(tree, 0, 10, 0)).toBe(true);
    grant(tree, 0);
    move(tree, 0, 10, 0);
    terminate(tree, 0);
    release(tree, 0, 10, 0);
    expect(onCommit).not.toHaveBeenCalled();
    TestRenderer.act(() => {
      handles(tree)[0]!.props.onPress({ nativeEvent: {} });
    });
    expect(onPress).not.toHaveBeenCalled();
    tree.unmount();
  });
});
