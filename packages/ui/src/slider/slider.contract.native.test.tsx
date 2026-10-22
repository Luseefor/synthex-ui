import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockState = vi.hoisted(() => ({
  trackRect: { x: 0, y: 0, width: 200, height: 8, pageX: 100, pageY: 200 },
  rootRect: { x: 0, y: 0, width: 220, height: 44, pageX: 90, pageY: 190 },
  trackMeasureAvailable: true,
  panConfig: null as any,
  measureCalls: [] as Array<{ kind: string; args: number[] }>,
  deferMeasure: false,
  deferred: [] as Array<() => void>,
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
      const isTrack = typeof props.onLayout === "function";
      const isContainer = props.onMoveShouldSetPanResponderCapture !== undefined;
      ReactMock.useImperativeHandle(ref, () => {
        if (isTrack) {
          if (!mockState.trackMeasureAvailable) {
            return { __mockView: true };
          }
          return {
            __mockView: true,
            measure: (cb: (...args: number[]) => void) => {
              const r = mockState.trackRect;
              mockState.measureCalls.push({ kind: "track.measure", args: [r.x, r.y, r.width, r.height, r.pageX, r.pageY] });
              if (mockState.deferMeasure) {
                mockState.deferred.push(() => cb(r.x, r.y, r.width, r.height, r.pageX, r.pageY));
              } else {
                cb(r.x, r.y, r.width, r.height, r.pageX, r.pageY);
              }
            },
          };
        }
        if (isContainer) {
          return {
            __mockView: true,
            measure: (cb: (...args: number[]) => void) => {
              const r = mockState.rootRect;
              mockState.measureCalls.push({ kind: "root.measure", args: [r.x, r.y, r.width, r.height, r.pageX, r.pageY] });
              if (mockState.deferMeasure) {
                mockState.deferred.push(() => cb(r.x, r.y, r.width, r.height, r.pageX, r.pageY));
              } else {
                cb(r.x, r.y, r.width, r.height, r.pageX, r.pageY);
              }
            },
          };
        }
        return { __mockView: true };
      });
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-view", rest, children);
    }),
    PanResponder: {
      create: (cfg: any) => {
        mockState.panConfig = cfg;
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
import { Slider } from "./slider.native";
import { NativeDirectionContext } from "../_shared/direction-context.native";

function resetMocks() {
  mockState.trackRect = { x: 0, y: 0, width: 200, height: 8, pageX: 100, pageY: 200 };
  mockState.rootRect = { x: 0, y: 0, width: 220, height: 44, pageX: 90, pageY: 190 };
  mockState.trackMeasureAvailable = true;
  mockState.panConfig = null;
  mockState.measureCalls = [];
  mockState.deferMeasure = false;
  mockState.deferred = [];
}

function renderSlider(element: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree!;
}

function pressableProps(tree: TestRenderer.ReactTestRenderer) {
  const nodes = tree.root.findAll((n) => (n.type as unknown as string) === "mock-pressable");
  if (nodes.length === 0) throw new Error("mock-pressable not found");
  return nodes[0]!.props as any;
}

function outerProps(tree: TestRenderer.ReactTestRenderer) {
  const nodes = tree.root.findAll(
    (n) =>
      (n.type as unknown as string) === "mock-view" &&
      (n.props as any).onMoveShouldSetPanResponderCapture !== undefined,
  );
  if (nodes.length === 0) throw new Error("outer pan view not found");
  return nodes[0]!.props as any;
}

function trackProps(tree: TestRenderer.ReactTestRenderer) {
  const nodes = tree.root.findAll(
    (n) => (n.type as unknown as string) === "mock-view" && typeof (n.props as any).onLayout === "function",
  );
  if (nodes.length === 0) throw new Error("track view not found");
  return nodes[0]!.props as any;
}

function thumbs(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll(
    (n) =>
      (n.type as unknown as string) === "mock-view" &&
      (n.props as any).accessibilityRole === "adjustable",
  );
}

function fireTrackLayout(tree: TestRenderer.ReactTestRenderer, layout = { x: 0, y: 0, width: 200, height: 8 }) {
  TestRenderer.act(() => {
    trackProps(tree).onLayout({ nativeEvent: { layout } });
  });
}

function pressInAt(tree: TestRenderer.ReactTestRenderer, pageX: number, pageY = 200) {
  TestRenderer.act(() => {
    pressableProps(tree).onPressIn({ nativeEvent: { pageX, pageY } });
  });
}

function grantAt(tree: TestRenderer.ReactTestRenderer, opts: { dx?: number; dy?: number } = {}) {
  TestRenderer.act(() => {
    outerProps(tree).onPanResponderGrant({ nativeEvent: {} }, {
      dx: opts.dx ?? 10,
      dy: opts.dy ?? 0,
      x0: 9999,
      y0: 9999,
      moveX: 9999,
      moveY: 9999,
      numberActiveTouches: 1,
    });
  });
}

function moveTo(tree: TestRenderer.ReactTestRenderer, pageX: number, pageY = 200) {
  TestRenderer.act(() => {
    outerProps(tree).onPanResponderMove({ nativeEvent: {} }, {
      dx: 10,
      dy: 0,
      x0: 0,
      y0: 0,
      moveX: pageX,
      moveY: pageY,
      numberActiveTouches: 1,
    });
  });
}

function releaseAt(tree: TestRenderer.ReactTestRenderer, pageX: number, pageY = 200) {
  TestRenderer.act(() => {
    outerProps(tree).onPanResponderRelease({ nativeEvent: {} }, {
      dx: 10,
      dy: 0,
      x0: 0,
      y0: 0,
      moveX: pageX,
      moveY: pageY,
      numberActiveTouches: 1,
    });
  });
}

beforeEach(() => {
  resetMocks();
});

describe("Slider (native contract)", () => {
  it("uses capture path for axis-intent and keeps start false", () => {
    const tree = renderSlider(<Slider defaultValue={[50]} />);
    expect(mockState.panConfig).toBeTruthy();
    expect(mockState.panConfig.onStartShouldSetPanResponder()).toBe(false);
    expect(mockState.panConfig.onStartShouldSetPanResponderCapture()).toBe(false);
    expect(mockState.panConfig.onMoveShouldSetPanResponder()).toBe(false);
    const cap = mockState.panConfig.onMoveShouldSetPanResponderCapture;
    expect(cap({}, { dx: 10, dy: 2, numberActiveTouches: 1 })).toBe(true);
    expect(cap({}, { dx: 2, dy: 10, numberActiveTouches: 1 })).toBe(false);
    expect(cap({}, { dx: 3, dy: 0, numberActiveTouches: 1 })).toBe(false);
    expect(cap({}, { dx: 10, dy: 0, numberActiveTouches: 2 })).toBe(false);
    tree.unmount();
  });

  it("tap updates nearest thumb and commits once; drag does not duplicate onPress", () => {
    const onPress = vi.fn();
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = renderSlider(
      <Slider defaultValue={[50]} onPress={onPress} onValueChange={onChange} onValueCommit={onCommit} testID="s" />,
    );
    fireTrackLayout(tree);
    TestRenderer.act(() => {
      pressableProps(tree).onPress({ nativeEvent: { pageX: 150, pageY: 200, locationX: 5 }, defaultPrevented: false });
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([25]);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith([25]);

    // Drag then suppressed tap: onPress must not fire again for the drag release.
    const tree2 = renderSlider(<Slider defaultValue={[20]} onPress={onPress} testID="d" />);
    fireTrackLayout(tree2);
    pressInAt(tree2, 120);
    grantAt(tree2);
    moveTo(tree2, 160);
    releaseAt(tree2, 160);
    const callsBefore = onPress.mock.calls.length;
    TestRenderer.act(() => {
      pressableProps(tree2).onPress({ nativeEvent: { pageX: 160, pageY: 200 }, defaultPrevented: false });
    });
    expect(onPress.mock.calls.length).toBe(callsBefore);
    tree.unmount();
    tree2.unmount();
  });

  it("ignores child locationX and uses track page frame (origin independent)", () => {
    const onChange = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[0]} onValueChange={onChange} testID="o" />);
    fireTrackLayout(tree);
    TestRenderer.act(() => {
      pressableProps(tree).onPress({
        nativeEvent: { pageX: 150, pageY: 200, locationX: 999 },
        defaultPrevented: false,
      });
    });
    expect(onChange).toHaveBeenCalledWith([25]);
    expect(mockState.measureCalls.some((c) => c.kind === "track.measure")).toBe(true);
    const call = mockState.measureCalls.find((c) => c.kind === "track.measure")!;
    expect(call.args.length).toBe(6);
    tree.unmount();
  });

  it("rejects when track.measure is missing instead of container fallback", () => {
    mockState.trackMeasureAvailable = false;
    const onChange = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[0]} onValueChange={onChange} testID="f" />);
    TestRenderer.act(() => {
      trackProps(tree).onLayout({ nativeEvent: { layout: { x: 10, y: 0, width: 200, height: 8 } } });
    });
    TestRenderer.act(() => {
      pressableProps(tree).onPress({ nativeEvent: { pageX: 150, pageY: 200 }, defaultPrevented: false });
    });
    expect(onChange).not.toHaveBeenCalled();
    tree.unmount();
  });

  it("requires fresh press origin; grant without pressIn does nothing (no x0 fallback)", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[50]} onValueChange={onChange} onValueCommit={onCommit} />);
    fireTrackLayout(tree);
    grantAt(tree);
    moveTo(tree, 180);
    releaseAt(tree, 180);
    expect(onChange).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
    tree.unmount();
  });

  it("chooses thumb from stored press point to prevent jump after threshold", () => {
    const onChange = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[20, 80]} onValueChange={onChange} testID="j" />);
    fireTrackLayout(tree);
    // Press at offset 90 -> value 45, nearest lower (20). Grant centroid would be 120 -> 60 nearest upper.
    pressInAt(tree, 190);
    grantAt(tree, { dx: 10, dy: 0 });
    // Drag to offset 120 -> value 60 with fixed lower thumb -> [60,80].
    moveTo(tree, 220);
    expect(onChange).toHaveBeenLastCalledWith([60, 80]);
    tree.unmount();
  });

  it("uses capture direction for coincident thumbs when grant resets dx/dy", () => {
    const onChange = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[50, 50]} onValueChange={onChange} testID="tie" />);
    fireTrackLayout(tree);
    pressInAt(tree, 200);
    TestRenderer.act(() => {
      outerProps(tree).onMoveShouldSetPanResponderCapture({}, { dx: 10, dy: 0, numberActiveTouches: 1 } as any);
    });
    TestRenderer.act(() => {
      outerProps(tree).onPanResponderGrant({ nativeEvent: {} }, {
        dx: 0, dy: 0, x0: 9999, y0: 9999, moveX: 9999, moveY: 9999, numberActiveTouches: 1,
      });
    });
    moveTo(tree, 220);
    expect(onChange).toHaveBeenLastCalledWith([50, 60]);
    tree.unmount();
  });

  it("keeps active thumb fixed and clamps without crossing", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = renderSlider(
      <Slider defaultValue={[20, 80]} onValueChange={onChange} onValueCommit={onCommit} />,
    );
    fireTrackLayout(tree);
    pressInAt(tree, 140); // offset 40 -> 20 lower thumb
    grantAt(tree);
    moveTo(tree, 300); // offset 200 -> 100, lower clamped to neighbor 80
    moveTo(tree, 300);
    releaseAt(tree, 300);
    expect(onChange).toHaveBeenLastCalledWith([80, 80]);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith([80, 80]);
    tree.unmount();
  });

  it("mirrors RTL and keeps vertical min at bottom; inverted flips", () => {
    const rtlChange = vi.fn();
    const rtlTree = renderSlider(<Slider defaultValue={[0]} dir="rtl" onValueChange={rtlChange} />);
    fireTrackLayout(rtlTree);
    TestRenderer.act(() => {
      pressableProps(rtlTree).onPress({ nativeEvent: { pageX: 100, pageY: 200 }, defaultPrevented: false });
    });
    expect(rtlChange).toHaveBeenCalledWith([100]);

    const vertChange = vi.fn();
    const vertTree = renderSlider(<Slider defaultValue={[0]} orientation="vertical" onValueChange={vertChange} />);
    // Vertical track frame: pageY 200 height 160 in this mock still 8; override rect.
    mockState.trackRect = { x: 0, y: 0, width: 8, height: 160, pageX: 100, pageY: 100 };
    TestRenderer.act(() => {
      trackProps(vertTree).onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 8, height: 160 } } });
    });
    TestRenderer.act(() => {
      pressableProps(vertTree).onPress({ nativeEvent: { pageX: 100, pageY: 100 }, defaultPrevented: false });
    });
    expect(vertChange).toHaveBeenCalledWith([100]);

    const invChange = vi.fn();
    mockState.trackRect = { x: 0, y: 0, width: 200, height: 8, pageX: 100, pageY: 200 };
    const invTree = renderSlider(<Slider defaultValue={[0]} inverted onValueChange={invChange} />);
    fireTrackLayout(invTree);
    TestRenderer.act(() => {
      pressableProps(invTree).onPress({ nativeEvent: { pageX: 100, pageY: 200 }, defaultPrevented: false });
    });
    expect(invChange).toHaveBeenCalledWith([100]);
    rtlTree.unmount();
    vertTree.unmount();
    invTree.unmount();
  });

  it("inherits dir from NativeDirectionContext unless prop overrides", () => {
    const change = vi.fn();
    const tree = renderSlider(
      <NativeDirectionContext.Provider value={{ dir: "rtl", setDir: () => {}, toggleDir: () => {} }}>
        <Slider defaultValue={[0]} onValueChange={change} />
      </NativeDirectionContext.Provider>,
    );
    fireTrackLayout(tree);
    TestRenderer.act(() => {
      pressableProps(tree).onPress({ nativeEvent: { pageX: 100, pageY: 200 }, defaultPrevented: false });
    });
    expect(change).toHaveBeenCalledWith([100]);
    tree.unmount();
  });

  it("commits once after multiple moves; terminate cancels without commit", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[0]} onValueChange={onChange} onValueCommit={onCommit} />);
    fireTrackLayout(tree);
    pressInAt(tree, 100);
    grantAt(tree);
    moveTo(tree, 120);
    moveTo(tree, 140);
    moveTo(tree, 140);
    releaseAt(tree, 140);
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith([20]);

    const tree2 = renderSlider(<Slider defaultValue={[0]} onValueChange={vi.fn()} onValueCommit={onCommit} />);
    fireTrackLayout(tree2);
    const commitsBefore = onCommit.mock.calls.length;
    pressInAt(tree2, 100);
    grantAt(tree2);
    moveTo(tree2, 140);
    TestRenderer.act(() => {
      outerProps(tree2).onPanResponderTerminate({ nativeEvent: {} }, { numberActiveTouches: 1 } as any);
    });
    TestRenderer.act(() => {
      outerProps(tree2).onPanResponderRelease({ nativeEvent: {} }, {
        dx: 0, dy: 0, x0: 0, y0: 0, moveX: 140, moveY: 200, numberActiveTouches: 1,
      } as any);
    });
    expect(onCommit.mock.calls.length).toBe(commitsBefore);
    tree.unmount();
    tree2.unmount();
  });

  it("controlled values render props with no optimistic display", () => {
    const onChange = vi.fn();
    function Controlled() {
      return <Slider value={[50]} onValueChange={onChange} testID="c" />;
    }
    const tree = renderSlider(<Controlled />);
    fireTrackLayout(tree);
    TestRenderer.act(() => {
      pressableProps(tree).onPress({ nativeEvent: { pageX: 180, pageY: 200 }, defaultPrevented: false });
    });
    expect(onChange).toHaveBeenCalledWith([40]);
    const thumbNow = thumbs(tree).map((t) => (t.props as any).accessibilityValue.now);
    expect(thumbNow).toEqual([50]);
    tree.unmount();
  });

  it("disabled guards pressIn before caller and blocks tap/drag/actions", () => {
    const onPressIn = vi.fn();
    const onPress = vi.fn();
    const onChange = vi.fn();
    const actionCaller = vi.fn();
    const tree = renderSlider(
      <Slider defaultValue={[50]} disabled onPress={onPress} onPressIn={onPressIn} onAccessibilityAction={actionCaller} onValueChange={onChange} testID="x" />,
    );
    fireTrackLayout(tree);
    TestRenderer.act(() => {
      pressableProps(tree).onPressIn({ nativeEvent: { pageX: 150, pageY: 200 } });
    });
    expect(onPressIn).not.toHaveBeenCalled();
    TestRenderer.act(() => {
      pressableProps(tree).onPress({ nativeEvent: { pageX: 150, pageY: 200 }, defaultPrevented: false });
    });
    expect(onPress).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(mockState.panConfig.onMoveShouldSetPanResponderCapture({}, { dx: 10, dy: 0, numberActiveTouches: 1 })).toBe(false);
    TestRenderer.act(() => {
      thumbs(tree)[0]!.props.onAccessibilityAction({ nativeEvent: { actionName: "increment" }, defaultPrevented: false });
    });
    expect(actionCaller).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    tree.unmount();
  });

  it("config change cancels active drag without commit", () => {
    const onCommit = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[10]} max={100} onValueCommit={onCommit} />);
    fireTrackLayout(tree);
    pressInAt(tree, 120);
    grantAt(tree);
    moveTo(tree, 140);
    TestRenderer.act(() => {
      tree.update(<Slider defaultValue={[10]} max={50} onValueCommit={onCommit} />);
    });
    TestRenderer.act(() => {
      outerProps(tree).onPanResponderRelease({ nativeEvent: {} }, {
        dx: 0, dy: 0, x0: 0, y0: 0, moveX: 140, moveY: 200, numberActiveTouches: 1,
      } as any);
    });
    expect(onCommit).not.toHaveBeenCalled();
    tree.unmount();
  });

  it("identical taps and noop actions do not notify or commit", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[25]} onValueChange={onChange} onValueCommit={onCommit} />);
    fireTrackLayout(tree);
    TestRenderer.act(() => {
      pressableProps(tree).onPress({ nativeEvent: { pageX: 150, pageY: 200 }, defaultPrevented: false });
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();

    const maxTree = renderSlider(<Slider defaultValue={[100]} onValueChange={onChange} onValueCommit={onCommit} />);
    fireTrackLayout(maxTree);
    onChange.mockClear();
    onCommit.mockClear();
    TestRenderer.act(() => {
      thumbs(maxTree)[0]!.props.onAccessibilityAction({
        nativeEvent: { actionName: "increment" },
        defaultPrevented: false,
      });
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
    tree.unmount();
    maxTree.unmount();
  });

  it("exposes per-thumb adjustable views with labels, values, and derived testIDs", () => {
    const tree = renderSlider(
      <Slider defaultValue={[20, 80]} thumbLabels={["Minimum price", "Maximum price"]} testID="range" />,
    );
    fireTrackLayout(tree);
    const nodes = thumbs(tree);
    expect(nodes.length).toBe(2);
    expect(nodes[0]!.props.accessibilityLabel).toBe("Minimum price");
    expect(nodes[1]!.props.accessibilityLabel).toBe("Maximum price");
    expect(nodes[0]!.props.accessibilityValue).toMatchObject({ min: 0, max: 100, now: 20 });
    expect(nodes[1]!.props.accessibilityValue).toMatchObject({ min: 0, max: 100, now: 80 });
    expect(nodes[0]!.props.testID).toBe("range-thumb-0");
    expect(nodes[1]!.props.testID).toBe("range-thumb-1");
    expect(pressableProps(tree).accessible).toBe(false);
    tree.unmount();
  });

  it("falls back to caller label plus index and Value N", () => {
    const labeled = renderSlider(<Slider defaultValue={[10, 90]} accessibilityLabel="Bound" testID="l" />);
    fireTrackLayout(labeled);
    const nodes = thumbs(labeled);
    expect(nodes[0]!.props.accessibilityLabel).toBe("Bound 1");
    expect(nodes[1]!.props.accessibilityLabel).toBe("Bound 2");
    labeled.unmount();

    const bare = renderSlider(<Slider defaultValue={[10, 90]} testID="b" />);
    fireTrackLayout(bare);
    const bareNodes = thumbs(bare);
    expect(bareNodes[0]!.props.accessibilityLabel).toBe("Value 1");
    expect(bareNodes[1]!.props.accessibilityLabel).toBe("Value 2");
    bare.unmount();
  });

  it("accessibility increment/decrement use step math without crossing and commit once", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[30, 31]} onValueChange={onChange} onValueCommit={onCommit} />);
    fireTrackLayout(tree);
    TestRenderer.act(() => {
      thumbs(tree)[0]!.props.onAccessibilityAction({
        nativeEvent: { actionName: "increment" },
        defaultPrevented: false,
      });
    });
    expect(onChange).toHaveBeenCalledWith([31, 31]);
    expect(onCommit).toHaveBeenCalledTimes(1);
    tree.unmount();
  });

  it("step math handles nonaligned max endpoint (100 step 30 decrement -> 90)", () => {
    const onChange = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[100]} min={0} max={100} step={30} onValueChange={onChange} />);
    fireTrackLayout(tree);
    TestRenderer.act(() => {
      thumbs(tree)[0]!.props.onAccessibilityAction({
        nativeEvent: { actionName: "decrement" },
        defaultPrevented: false,
      });
    });
    expect(onChange).toHaveBeenCalledWith([90]);
    tree.unmount();
  });

  it("calls caller accessibility action first and honors preventDefault; forces thumb disabled", () => {
    const caller = vi.fn();
    const onChange = vi.fn();
    const tree = renderSlider(
      <Slider
        defaultValue={[50]}
        onAccessibilityAction={caller}
        accessibilityState={{ busy: true } as any}
        onValueChange={onChange}
      />,
    );
    fireTrackLayout(tree);
    const evt = { nativeEvent: { actionName: "increment" }, defaultPrevented: true };
    TestRenderer.act(() => {
      thumbs(tree)[0]!.props.onAccessibilityAction(evt);
    });
    expect(caller).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();

    const disabledTree = renderSlider(
      <Slider defaultValue={[50]} disabled accessibilityState={{ busy: true } as any} testID="d2" />,
    );
    fireTrackLayout(disabledTree);
    const state = thumbs(disabledTree)[0]!.props.accessibilityState;
    expect(state).toMatchObject({ busy: true, disabled: true });
    tree.unmount();
    disabledTree.unmount();
  });

  it("resets tap suppression on fresh pressIn so the next real tap works", () => {
    const onChange = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[0]} onValueChange={onChange} />);
    fireTrackLayout(tree);
    pressInAt(tree, 100);
    grantAt(tree);
    moveTo(tree, 140);
    releaseAt(tree, 140);
    const afterDrag = onChange.mock.calls.length;
    expect(afterDrag).toBeGreaterThan(0);
    pressInAt(tree, 160);
    TestRenderer.act(() => {
      pressableProps(tree).onPress({ nativeEvent: { pageX: 160, pageY: 200 }, defaultPrevented: false });
    });
    expect(onChange.mock.calls.length).toBeGreaterThan(afterDrag);
    tree.unmount();
  });

  it("forwards ref to Pressable, composes root onLayout, and clears ref on unmount", () => {
    const ref = React.createRef<any>();
    const onLayout = vi.fn();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(<Slider ref={ref} onLayout={onLayout} testID="r" />);
    });
    expect(ref.current).toBeTruthy();
    TestRenderer.act(() => {
      pressableProps(tree!).onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 10, height: 10 } } });
    });
    expect(onLayout).toHaveBeenCalledTimes(1);
    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(ref.current).toBeNull();
  });

  it("single thumb fill starts at min baseline and zero range stays finite", () => {
    const tree = renderSlider(<Slider defaultValue={[25]} testID="fill" />);
    fireTrackLayout(tree);
    const fill = tree.root.findAll(n => (n.type as unknown as string) === "mock-view" && n.props.style?.position === "absolute" && n.props.style?.borderRadius === 999 && n.props.accessibilityRole === undefined)[0]!;
    expect(fill.props.style).toMatchObject({ left: "0%", width: "25%" });
    const thumbLeft = thumbs(tree)[0]!.props.style.left;
    expect(thumbLeft).toBe("25%");
    tree.unmount();

    const zero = renderSlider(<Slider defaultValue={[5]} min={5} max={5} testID="z" />);
    fireTrackLayout(zero);
    expect(thumbs(zero)[0]!.props.accessibilityValue).toMatchObject({ min: 5, max: 5, now: 5 });
    zero.unmount();
  });

  it("honors React 19 callback ref cleanup without a second null detach", () => {
    const cleanup = vi.fn();
    const ref = vi.fn(() => cleanup);
    const tree = renderSlider(<Slider ref={ref} />);
    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref.mock.calls[0]).not.toEqual([null]);
    TestRenderer.act(() => tree.unmount());
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledTimes(1);
  });

  it("rebases external neighbor changes while retaining the active range thumb", () => {
    const onChange = vi.fn();
    const tree = renderSlider(<Slider value={[20, 80]} onValueChange={onChange} />);
    pressInAt(tree, 140);
    grantAt(tree);
    moveTo(tree, 180);
    expect(onChange).toHaveBeenLastCalledWith([40, 80]);
    TestRenderer.act(() => tree.update(<Slider value={[20, 50]} onValueChange={onChange} />));
    moveTo(tree, 240);
    expect(onChange).toHaveBeenLastCalledWith([50, 50]);
    TestRenderer.act(() => tree.unmount());
  });

  it("commits the latest controlled neighbors even when the final pointer value is unchanged", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = renderSlider(<Slider value={[20, 80]} onValueChange={onChange} onValueCommit={onCommit} />);
    pressInAt(tree, 140);
    grantAt(tree);
    moveTo(tree, 180);
    TestRenderer.act(() => tree.update(<Slider value={[40, 50]} onValueChange={onChange} onValueCommit={onCommit} />));
    const count = onChange.mock.calls.length;
    releaseAt(tree, 180);
    expect(onChange).toHaveBeenCalledTimes(count);
    expect(onCommit).toHaveBeenCalledExactlyOnceWith([40, 50]);
    TestRenderer.act(() => tree.unmount());
  });

  it("fresh asynchronous measurement after scroll uses the new page origin", () => {
    const onChange = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[0]} onValueChange={onChange} />);
    fireTrackLayout(tree);
    mockState.trackRect = { ...mockState.trackRect, pageX: 200 };
    mockState.deferMeasure = true;
    pressInAt(tree, 300);
    TestRenderer.act(() => pressableProps(tree).onPress({ nativeEvent: { pageX: 300, pageY: 200 } }));
    expect(onChange).not.toHaveBeenCalled();
    const callbacks = mockState.deferred.splice(0);
    TestRenderer.act(() => callbacks.forEach(cb => cb()));
    expect(onChange).toHaveBeenCalledExactlyOnceWith([50]);
    TestRenderer.act(() => tree.unmount());
  });

  it("deferred measure grant then release before callback produces no zombie updates", () => {
    mockState.deferMeasure = true;
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const tree = renderSlider(<Slider defaultValue={[20]} onValueChange={onChange} onValueCommit={onCommit} />);
    TestRenderer.act(() => {
      trackProps(tree).onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 8 } } });
    });
    // pressIn defers its warm measure; grant defers its fresh measure (pending, no activation yet).
    pressInAt(tree, 120);
    TestRenderer.act(() => {
      outerProps(tree).onPanResponderGrant({ nativeEvent: {} }, {
        dx: 10, dy: 0, x0: 9999, y0: 9999, moveX: 9999, moveY: 9999, numberActiveTouches: 1,
      });
    });
    expect(onChange).not.toHaveBeenCalled();
    // Release while grant is still pending must invalidate and suppress, not activate.
    TestRenderer.act(() => {
      outerProps(tree).onPanResponderRelease({ nativeEvent: {} }, {
        dx: 10, dy: 0, x0: 0, y0: 0, moveX: 160, moveY: 200, numberActiveTouches: 1,
      } as any);
    });
    const pending = [...mockState.deferred];
    mockState.deferred = [];
    mockState.deferMeasure = false;
    TestRenderer.act(() => {
      for (const cb of pending) cb();
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
    // Subsequent moves must not revive the cancelled gesture.
    TestRenderer.act(() => {
      outerProps(tree).onPanResponderMove({ nativeEvent: {} }, {
        dx: 10, dy: 0, x0: 0, y0: 0, moveX: 180, moveY: 200, numberActiveTouches: 1,
      } as any);
    });
    expect(onChange).not.toHaveBeenCalled();
    tree.unmount();
  });
});
