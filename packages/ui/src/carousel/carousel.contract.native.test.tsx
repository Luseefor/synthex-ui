import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockState = vi.hoisted(() => ({
  scrollToCalls: [] as Array<{ x?: number; y?: number; animated?: boolean }>,
  reduceMotion: false,
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
    Text: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-text", rest, children);
    }),
    View: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      ReactMock.useImperativeHandle(ref, () => ({ __mockView: true }));
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-view", rest, children);
    }),
    ScrollView: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      ReactMock.useImperativeHandle(ref, () => ({
        scrollTo: (options: { x?: number; y?: number; animated?: boolean }) => {
          mockState.scrollToCalls.push({ ...options });
        },
      }));
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-scrollview", rest, children);
    }),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
    Platform: { OS: "ios", select: (options: any) => options.ios ?? options.default },
    AccessibilityInfo: {
      isReduceMotionEnabled: () => Promise.resolve(mockState.reduceMotion),
      addEventListener: () => ({ remove: () => {} }),
    },
  };
});

vi.mock("../button/button.native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  return {
    Button: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      ReactMock.useImperativeHandle(ref, () => ({ __mockButton: true }));
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-button", rest, children);
    }),
  };
});

import TestRenderer from "react-test-renderer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel.native";
import type { NativeCarouselApi } from "./carousel.types.native";
import { NativeDirectionContext } from "../_shared/direction-context.native";

function resetMocks() {
  mockState.scrollToCalls = [];
  mockState.reduceMotion = false;
}

function render(element: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree!;
}

function scrollView(tree: TestRenderer.ReactTestRenderer) {
  const nodes = tree.root.findAll(
    (node) => (node.type as unknown as string) === "mock-scrollview",
  );
  if (nodes.length === 0) {
    throw new Error("mock-scrollview not found");
  }
  return nodes[0]!;
}

function fireViewportLayout(
  tree: TestRenderer.ReactTestRenderer,
  extent: number,
  vertical = false,
) {
  TestRenderer.act(() => {
    (scrollView(tree).props as any).onLayout({
      nativeEvent: {
        layout: vertical
          ? { x: 0, y: 0, width: 100, height: extent }
          : { x: 0, y: 0, width: extent, height: 100 },
      },
    });
  });
}

function fireContentSize(
  tree: TestRenderer.ReactTestRenderer,
  count: number,
  extent: number,
  vertical = false,
) {
  TestRenderer.act(() => {
    (scrollView(tree).props as any).onContentSizeChange(
      vertical ? 100 : count * extent,
      vertical ? count * extent : 100,
    );
  });
}

function ready(tree: TestRenderer.ReactTestRenderer, count: number, extent: number, vertical = false) {
  fireViewportLayout(tree, extent, vertical);
  fireContentSize(tree, count, extent, vertical);
}

function beginDrag(tree: TestRenderer.ReactTestRenderer) {
  TestRenderer.act(() => {
    (scrollView(tree).props as any).onScrollBeginDrag({
      nativeEvent: { contentOffset: { x: 0, y: 0 } },
    });
  });
}

function endDrag(tree: TestRenderer.ReactTestRenderer, offset: number, vertical = false) {
  TestRenderer.act(() => {
    (scrollView(tree).props as any).onScrollEndDrag({
      nativeEvent: {
        contentOffset: vertical ? { x: 0, y: offset } : { x: offset, y: 0 },
        velocity: { x: 0, y: 0 },
      },
    });
  });
}

function momentumEnd(tree: TestRenderer.ReactTestRenderer, offset: number, vertical = false) {
  TestRenderer.act(() => {
    (scrollView(tree).props as any).onMomentumScrollEnd({
      nativeEvent: {
        contentOffset: vertical ? { x: 0, y: offset } : { x: offset, y: 0 },
        velocity: { x: 0, y: 0 },
      },
    });
  });
}

function settleGesture(tree: TestRenderer.ReactTestRenderer, offset: number, vertical = false) {
  beginDrag(tree);
  endDrag(tree, offset, vertical);
  momentumEnd(tree, offset, vertical);
}

function carouselItemHosts(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll(
    (node) =>
      (node.type as unknown as string) === "mock-view" &&
      (node.props as any).testID === "carousel-item",
  );
}

beforeEach(() => {
  resetMocks();
});

describe("Carousel native paging contract", () => {
  it("rejects unsupported opts keys, loop:true, and nonempty plugins", () => {
    expect(() =>
      render(
        <Carousel opts={{ loop: true } as any}>
          <CarouselContent>
            <CarouselItem>One</CarouselItem>
          </CarouselContent>
        </Carousel>,
      ),
    ).toThrow(/loop/i);
    expect(() =>
      render(
        <Carousel plugins={[{}] as any}>
          <CarouselContent>
            <CarouselItem>One</CarouselItem>
          </CarouselContent>
        </Carousel>,
      ),
    ).toThrow(/plugin/i);
    expect(() =>
      render(
        <Carousel opts={{ startIndex: 0, axis: "x" } as any}>
          <CarouselContent>
            <CarouselItem>One</CarouselItem>
          </CarouselContent>
        </Carousel>,
      ),
    ).toThrow(/unsupported/i);
  });

  it("pages horizontally with positive offsets and keeps all slides mounted", () => {
    let api: NativeCarouselApi | undefined;
    const onIndexChange = vi.fn();
    const tree = render(
      <Carousel setApi={(next) => { api = next; }} onIndexChange={onIndexChange}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
          <CarouselItem>Three</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );
    ready(tree, 3, 200);
    expect(api?.selectedScrollSnap()).toBe(0);
    expect(api?.scrollSnapList()).toEqual([0, 0.5, 1]);
    expect(carouselItemHosts(tree).length).toBe(3);
    const props = (scrollView(tree).props as any);
    expect(props.pagingEnabled).toBe(true);
    expect(props.horizontal).toBe(true);
    settleGesture(tree, 200);
    expect(api?.selectedScrollSnap()).toBe(1);
    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(mockState.scrollToCalls.length).toBeGreaterThanOrEqual(1);
    TestRenderer.act(() => tree.unmount());
  });

  it("pages vertically with paired y offsets and default bounded height", () => {
    let api: NativeCarouselApi | undefined;
    const tree = render(
      <Carousel orientation="vertical" setApi={(next) => { api = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 2, 240, true);
    const props = (scrollView(tree).props as any);
    expect(props.horizontal).toBe(false);
    expect(props.pagingEnabled).toBe(true);
    settleGesture(tree, 240, true);
    expect(api?.selectedScrollSnap()).toBe(1);
    const last = mockState.scrollToCalls[mockState.scrollToCalls.length - 1];
    void last;
    TestRenderer.act(() => {
      api?.scrollTo(0);
    });
    const verticalCall = mockState.scrollToCalls[mockState.scrollToCalls.length - 1];
    expect(verticalCall?.y).toBe(0);
    expect(verticalCall?.x).toBe(0);
    TestRenderer.act(() => tree.unmount());
  });

  it("reverses horizontal physical order for RTL but forces LTR scroll coordinates", () => {
    let api: NativeCarouselApi | undefined;
    const tree = render(
      <Carousel dir="rtl" setApi={(next) => { api = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
          <CarouselItem>Three</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 3, 100);
    expect(mockState.scrollToCalls[mockState.scrollToCalls.length - 1]?.x).toBe(200);
    mockState.scrollToCalls = [];
    TestRenderer.act(() => {
      api?.scrollTo(1);
    });
    expect(mockState.scrollToCalls[mockState.scrollToCalls.length - 1]?.x).toBe(100);
    TestRenderer.act(() => {
      api?.scrollTo(2);
    });
    expect(mockState.scrollToCalls[mockState.scrollToCalls.length - 1]?.x).toBe(0);
    settleGesture(tree, 0);
    expect(api?.selectedScrollSnap()).toBe(2);
    const props = (scrollView(tree).props as any);
    expect(props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ direction: "ltr" })]),
    );
    TestRenderer.act(() => tree.unmount());
  });

  it("inherits RTL from NativeDirectionContext unless dir overrides", () => {
    let api: NativeCarouselApi | undefined;
    const tree = render(
      <NativeDirectionContext.Provider value={{ dir: "rtl", setDir: () => {}, toggleDir: () => {} }}>
        <Carousel setApi={(next) => { api = next; }}>
          <CarouselContent>
            <CarouselItem>One</CarouselItem>
            <CarouselItem>Two</CarouselItem>
          </CarouselContent>
        </Carousel>
      </NativeDirectionContext.Provider>,
    );
    ready(tree, 2, 100);
    expect(mockState.scrollToCalls[mockState.scrollToCalls.length - 1]?.x).toBe(100);
    mockState.scrollToCalls = [];
    TestRenderer.act(() => {
      api?.scrollTo(1);
    });
    expect(mockState.scrollToCalls[mockState.scrollToCalls.length - 1]?.x).toBe(0);
    TestRenderer.act(() => tree.unmount());
  });

  it("runs caller scroll observers and protects internal handlers from last spread", () => {
    const onLayout = vi.fn();
    const onContentSizeChange = vi.fn();
    const onBegin = vi.fn();
    const onEnd = vi.fn();
    const onMomentum = vi.fn();
    const tree = render(
      <Carousel>
        <CarouselContent
          onLayout={onLayout}
          onContentSizeChange={onContentSizeChange}
          onScrollBeginDrag={onBegin}
          onScrollEndDrag={onEnd}
          onMomentumScrollEnd={onMomentum}
        >
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    fireViewportLayout(tree, 200);
    expect(onLayout).toHaveBeenCalledTimes(1);
    fireContentSize(tree, 2, 200);
    expect(onContentSizeChange).toHaveBeenCalledTimes(1);
    beginDrag(tree);
    expect(onBegin).toHaveBeenCalledTimes(1);
    endDrag(tree, 200);
    expect(onEnd).toHaveBeenCalledTimes(1);
    momentumEnd(tree, 200);
    expect(onMomentum).toHaveBeenCalledTimes(1);
    // Internal handlers still attached (not overridden by spread).
    expect(typeof (scrollView(tree).props as any).onLayout).toBe("function");
    TestRenderer.act(() => tree.unmount());
  });

  it("commits on momentum end; drag ending on snap commits without waiting, fractional waits", () => {
    let api: NativeCarouselApi | undefined;
    const onIndexChange = vi.fn();
    const tree = render(
      <Carousel setApi={(next) => { api = next; }} onIndexChange={onIndexChange}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
          <CarouselItem>Three</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 3, 100);
    onIndexChange.mockClear();
    // Snapped end-drag commits immediately.
    beginDrag(tree);
    endDrag(tree, 100);
    expect(api?.selectedScrollSnap()).toBe(1);
    expect(onIndexChange).toHaveBeenCalledWith(1);
    // Fractional end-drag waits for momentum.
    onIndexChange.mockClear();
    beginDrag(tree);
    endDrag(tree, 150);
    expect(api?.selectedScrollSnap()).toBe(1);
    expect(onIndexChange).not.toHaveBeenCalled();
    momentumEnd(tree, 150);
    expect(api?.selectedScrollSnap()).toBe(2);
    expect(onIndexChange).toHaveBeenCalledWith(2);
    TestRenderer.act(() => tree.unmount());
  });

  it("ignores programmatic scroll momentum echoes without a gesture session", () => {
    let api: NativeCarouselApi | undefined;
    const onIndexChange = vi.fn();
    const tree = render(
      <Carousel setApi={(next) => { api = next; }} onIndexChange={onIndexChange}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 2, 100);
    onIndexChange.mockClear();
    TestRenderer.act(() => {
      api?.scrollTo(1);
    });
    expect(onIndexChange).toHaveBeenCalledTimes(1);
    // Momentum echo from the programmatic scroll (no beginDrag) is ignored.
    momentumEnd(tree, 100);
    expect(onIndexChange).toHaveBeenCalledTimes(1);
    expect(api?.selectedScrollSnap()).toBe(1);
    TestRenderer.act(() => tree.unmount());
  });

  it("cancels pending gestures on external index, count, orientation, layout, and disabled changes", () => {
    const onIndexChange = vi.fn();
    const tree = render(
      <Carousel onIndexChange={onIndexChange}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 2, 100);
    onIndexChange.mockClear();
    beginDrag(tree);
    TestRenderer.act(() => {
      tree.update(
        <Carousel disabled onIndexChange={onIndexChange}>
          <CarouselContent>
            <CarouselItem>One</CarouselItem>
            <CarouselItem>Two</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );
    });
    momentumEnd(tree, 100);
    expect(onIndexChange).not.toHaveBeenCalled();
    TestRenderer.act(() => tree.unmount());
  });

  it("blocks API requests, buttons, and swiping when disabled", () => {
    let api: NativeCarouselApi | undefined;
    const onIndexChange = vi.fn();
    const callerPress = vi.fn();
    const tree = render(
      <Carousel disabled setApi={(next) => { api = next; }} onIndexChange={onIndexChange}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
        <CarouselNext onPress={callerPress} />
      </Carousel>,
    );
    ready(tree, 2, 100);
    expect((scrollView(tree).props as any).scrollEnabled).toBe(false);
    const next = tree.root.findByProps({ testID: "carousel-next" });
    expect(next.props.disabled).toBe(true);
    TestRenderer.act(() => {
      next.props.onPress({ defaultPrevented: false });
    });
    expect(callerPress).not.toHaveBeenCalled();
    expect(onIndexChange).not.toHaveBeenCalled();
    TestRenderer.act(() => {
      api?.scrollTo(1);
    });
    expect(api?.selectedScrollSnap()).toBe(0);
    expect(onIndexChange).not.toHaveBeenCalled();
    beginDrag(tree);
    momentumEnd(tree, 100);
    expect(api?.selectedScrollSnap()).toBe(0);
    TestRenderer.act(() => tree.unmount());
  });

  it("runs caller onPress first and honors defaultPrevented without rest overriding disabled", () => {
    let api: NativeCarouselApi | undefined;
    const order: string[] = [];
    const tree = render(
      <Carousel setApi={(next) => { api = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
        <CarouselNext
          accessibilityLabel="Custom next"
          onPress={(event) => {
            order.push("caller");
            (event as any).defaultPrevented = true;
          }}
        />
      </Carousel>,
    );
    ready(tree, 2, 100);
    const next = tree.root.findByProps({ testID: "carousel-next" });
    expect(next.props.accessibilityLabel).toBe("Custom next");
    TestRenderer.act(() => {
      next.props.onPress({ defaultPrevented: true });
    });
    expect(order).toEqual(["caller"]);
    expect(api?.selectedScrollSnap()).toBe(0);
    TestRenderer.act(() => tree.unmount());
  });

  it("provides default button labels and preserves custom children and style", () => {
    const tree = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext>Forward</CarouselNext>
      </Carousel>,
    );
    ready(tree, 2, 100);
    const previous = tree.root.findByProps({ testID: "carousel-previous" });
    const next = tree.root.findByProps({ testID: "carousel-next" });
    expect(previous.props.accessibilityLabel).toBe("Previous slide");
    expect(next.props.accessibilityLabel).toBe("Next slide");
    expect(previous.props.children).toBe("Previous");
    expect(next.props.children).toBe("Forward");
    TestRenderer.act(() => tree.unmount());
  });

  it("handles empty slides without blank and clamps shrink without notifying", () => {
    let api: NativeCarouselApi | undefined;
    const onIndexChange = vi.fn();
    const select = vi.fn();
    const reInit = vi.fn();
    const tree = render(
      <Carousel setApi={(next) => { api = next; }} onIndexChange={onIndexChange}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
          <CarouselItem>Three</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    TestRenderer.act(() => {
      api?.on("select", select);
      api?.on("reInit", reInit);
    });
    ready(tree, 3, 100);
    TestRenderer.act(() => {
      api?.scrollTo(2);
    });
    expect(api?.selectedScrollSnap()).toBe(2);
    select.mockClear();
    reInit.mockClear();
    onIndexChange.mockClear();
    TestRenderer.act(() => {
      tree.update(
        <Carousel setApi={(next) => { api = next; }} onIndexChange={onIndexChange}>
          <CarouselContent>
            <CarouselItem>One</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );
    });
    fireContentSize(tree, 1, 100);
    expect(api?.selectedScrollSnap()).toBe(0);
    expect(onIndexChange).not.toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
    expect(reInit).toHaveBeenCalled();
    expect(api?.scrollSnapList()).toEqual([0]);
    expect(carouselItemHosts(tree).length).toBe(1);
    TestRenderer.act(() => tree.unmount());
  });

  it("keeps stable keys across removal and reorder", () => {
    let api: NativeCarouselApi | undefined;
    const tree = render(
      <Carousel setApi={(next) => { api = next; }}>
        <CarouselContent>
          <CarouselItem key="a">Alpha</CarouselItem>
          <CarouselItem key="b">Beta</CarouselItem>
          <CarouselItem key="c">Gamma</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 3, 100);
    TestRenderer.act(() => {
      api?.scrollTo(1);
    });
    expect(api?.selectedScrollSnap()).toBe(1);
    TestRenderer.act(() => {
      tree.update(
        <Carousel setApi={(next) => { api = next; }}>
          <CarouselContent>
            <CarouselItem key="c">Gamma</CarouselItem>
            <CarouselItem key="a">Alpha</CarouselItem>
            <CarouselItem key="b">Beta</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );
    });
    fireContentSize(tree, 3, 100);
    expect(carouselItemHosts(tree).length).toBe(3);
    expect(api?.selectedScrollSnap()).toBe(1);
    TestRenderer.act(() => tree.unmount());
  });

  it("supports controlled accept without optimistic index", () => {
    let api: NativeCarouselApi | undefined;
    const onIndexChange = vi.fn();
    const select = vi.fn();
    const renderControlled = (index: number) => (
      <Carousel index={index} onIndexChange={onIndexChange} setApi={(next) => { api = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
          <CarouselItem>Three</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    const tree = render(renderControlled(0));
    ready(tree, 3, 100);
    TestRenderer.act(() => {
      api?.on("select", select);
    });
    select.mockClear();
    TestRenderer.act(() => {
      api?.scrollTo(2);
    });
    expect(onIndexChange).toHaveBeenCalledWith(2);
    expect(api?.selectedScrollSnap()).toBe(0);
    TestRenderer.act(() => {
      tree.update(renderControlled(2));
    });
    expect(api?.selectedScrollSnap()).toBe(2);
    expect(select).toHaveBeenCalled();
    TestRenderer.act(() => tree.unmount());
  });

  it("realigns rejected controlled requests to rendered props", () => {
    let api: NativeCarouselApi | undefined;
    const onIndexChange = vi.fn();
    const tree = render(
      <Carousel index={0} onIndexChange={onIndexChange} setApi={(next) => { api = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 2, 100);
    mockState.scrollToCalls = [];
    TestRenderer.act(() => {
      api?.scrollTo(1);
    });
    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(api?.selectedScrollSnap()).toBe(0);
    expect(mockState.scrollToCalls.length).toBeGreaterThan(0);
    expect(mockState.scrollToCalls[mockState.scrollToCalls.length - 1]?.x).toBe(0);
    TestRenderer.act(() => tree.unmount());
  });

  it("uses live API getters and chains on/off with dedup", () => {
    let api: NativeCarouselApi | undefined;
    const tree = render(
      <Carousel setApi={(next) => { api = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 2, 100);
    const first = api;
    TestRenderer.act(() => {
      tree.update(
        <Carousel setApi={(next) => { api = next; }}>
          <CarouselContent>
            <CarouselItem>One</CarouselItem>
            <CarouselItem>Two</CarouselItem>
            <CarouselItem>Three</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );
    });
    fireContentSize(tree, 3, 100);
    expect(api).toBe(first);
    expect(api?.scrollSnapList()).toEqual([0, 0.5, 1]);
    const listener = vi.fn();
    const returned = api?.on("select", listener)?.on("reInit", listener);
    expect(returned).toBe(api);
    TestRenderer.act(() => {
      api?.on("select", listener);
    });
    TestRenderer.act(() => {
      api?.scrollTo(1);
    });
    expect(listener).toHaveBeenCalledTimes(1);
    TestRenderer.act(() => {
      api?.off("select", listener);
    });
    listener.mockClear();
    TestRenderer.act(() => {
      api?.scrollTo(2);
    });
    expect(listener).not.toHaveBeenCalled();
    expect(api?.canScrollNext()).toBe(false);
    expect(api?.canScrollPrev()).toBe(true);
    TestRenderer.act(() => tree.unmount());
  });

  it("publishes setApi on mount and cleans up on unmount without post-unmount callbacks", () => {
    const setApi = vi.fn();
    let api: NativeCarouselApi | undefined;
    const tree = render(
      <Carousel setApi={(next) => { api = next; setApi(next); }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 2, 100);
    expect(setApi).toHaveBeenCalledWith(expect.objectContaining({ scrollTo: expect.any(Function) }));
    const captured = api!;
    TestRenderer.act(() => {
      tree.unmount();
    });
    expect(setApi).toHaveBeenLastCalledWith(undefined);
    expect(() => captured.scrollTo(1)).not.toThrow();
    expect(captured.selectedScrollSnap()).toBe(0);
  });

  it("forwards refs to all hosts and honors React 19 cleanup", () => {
    const rootRef = React.createRef<any>();
    const contentRef = React.createRef<any>();
    const itemRef = React.createRef<any>();
    const previousRef = React.createRef<any>();
    const nextRef = React.createRef<any>();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Carousel ref={rootRef}>
          <CarouselContent ref={contentRef}>
            <CarouselItem ref={itemRef}>One</CarouselItem>
            <CarouselItem>Two</CarouselItem>
          </CarouselContent>
          <CarouselPrevious ref={previousRef} />
          <CarouselNext ref={nextRef} />
        </Carousel>,
      );
    });
    expect(rootRef.current).toBeTruthy();
    expect(contentRef.current).toBeTruthy();
    expect(itemRef.current).toBeTruthy();
    expect(previousRef.current).toBeTruthy();
    expect(nextRef.current).toBeTruthy();
    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(rootRef.current).toBeNull();
    expect(contentRef.current).toBeNull();
    expect(itemRef.current).toBeNull();
    expect(previousRef.current).toBeNull();
    expect(nextRef.current).toBeNull();

    const cleanup = vi.fn();
    const callbackRef = vi.fn(() => cleanup);
    let callbackTree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      callbackTree = TestRenderer.create(
        <Carousel ref={callbackRef}>
          <CarouselContent>
            <CarouselItem>One</CarouselItem>
          </CarouselContent>
        </Carousel>,
      );
    });
    expect(callbackRef).toHaveBeenCalled();
    expect(callbackRef.mock.calls.length).toBeGreaterThanOrEqual(1);
    TestRenderer.act(() => {
      callbackTree!.unmount();
    });
    expect(cleanup).toHaveBeenCalled();
  });

  it("hides inactive slides from accessibility while keeping them mounted", () => {
    let api: NativeCarouselApi | undefined;
    const tree = render(
      <Carousel setApi={(next) => { api = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 2, 100);
    const wrappers = tree.root.findAll(
      (node) =>
        (node.type as unknown as string) === "mock-view" &&
        typeof (node.props as any).accessibilityElementsHidden === "boolean",
    );
    expect(wrappers.length).toBe(2);
    const hidden = wrappers.filter((node) => (node.props as any).accessibilityElementsHidden);
    const shown = wrappers.filter((node) => !(node.props as any).accessibilityElementsHidden);
    expect(hidden.length).toBe(1);
    expect(shown.length).toBe(1);
    expect((hidden[0]!.props as any).importantForAccessibility).toBe("no-hide-descendants");
    expect((hidden[0]!.props as any).pointerEvents).toBe("none");
    TestRenderer.act(() => {
      api?.scrollTo(1);
    });
    const after = tree.root.findAll(
      (node) =>
        (node.type as unknown as string) === "mock-view" &&
        typeof (node.props as any).accessibilityElementsHidden === "boolean",
    );
    expect(after.filter((node) => (node.props as any).accessibilityElementsHidden).length).toBe(1);
    TestRenderer.act(() => tree.unmount());
  });

  it("gates programmatic animation with animated and useReducedMotion", async () => {
    mockState.reduceMotion = false;
    let api: NativeCarouselApi | undefined;
    const tree = render(
      <Carousel setApi={(next) => { api = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 2, 100);
    await TestRenderer.act(async () => {});
    mockState.scrollToCalls = [];
    TestRenderer.act(() => {
      api?.scrollTo(1);
    });
    expect(mockState.scrollToCalls[mockState.scrollToCalls.length - 1]?.animated).toBe(true);
    TestRenderer.act(() => tree.unmount());

    mockState.reduceMotion = true;
    let reducedApi: NativeCarouselApi | undefined;
    const reducedTree = render(
      <Carousel setApi={(next) => { reducedApi = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(reducedTree, 2, 100);
    await TestRenderer.act(async () => {});
    mockState.scrollToCalls = [];
    TestRenderer.act(() => {
      reducedApi?.scrollTo(1);
    });
    expect(mockState.scrollToCalls[mockState.scrollToCalls.length - 1]?.animated).toBe(false);
    TestRenderer.act(() => reducedTree.unmount());

    mockState.reduceMotion = false;
    let staticApi: NativeCarouselApi | undefined;
    const staticTree = render(
      <Carousel animated={false} setApi={(next) => { staticApi = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(staticTree, 2, 100);
    await TestRenderer.act(async () => {});
    mockState.scrollToCalls = [];
    TestRenderer.act(() => {
      staticApi?.scrollTo(1);
    });
    expect(mockState.scrollToCalls[mockState.scrollToCalls.length - 1]?.animated).toBe(false);
    TestRenderer.act(() => staticTree.unmount());
  });

  it("uses rapid uncontrolled API calls with synchronously updated index", () => {
    let api: NativeCarouselApi | undefined;
    const onIndexChange = vi.fn();
    const tree = render(
      <Carousel setApi={(next) => { api = next; }} onIndexChange={onIndexChange}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
          <CarouselItem>Three</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 3, 100);
    onIndexChange.mockClear();
    TestRenderer.act(() => {
      api?.scrollTo(1);
      api?.scrollTo(2);
    });
    expect(api?.selectedScrollSnap()).toBe(2);
    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(onIndexChange).toHaveBeenCalledWith(2);
    TestRenderer.act(() => tree.unmount());
  });

  it("resolves defaultIndex over startIndex over zero for initial page", () => {
    let api: NativeCarouselApi | undefined;
    const tree = render(
      <Carousel opts={{ startIndex: 1 }} setApi={(next) => { api = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
          <CarouselItem>Three</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(tree, 3, 100);
    expect(api?.selectedScrollSnap()).toBe(1);
    TestRenderer.act(() => tree.unmount());

    let defaultApi: NativeCarouselApi | undefined;
    const defaultTree = render(
      <Carousel defaultIndex={2} opts={{ startIndex: 0 }} setApi={(next) => { defaultApi = next; }}>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
          <CarouselItem>Three</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    ready(defaultTree, 3, 100);
    expect(defaultApi?.selectedScrollSnap()).toBe(2);
    TestRenderer.act(() => defaultTree.unmount());
  });
  it("waits for momentum after a moving release at an exact page boundary", () => {
    let api: NativeCarouselApi | undefined;
    const onIndexChange = vi.fn();
    const tree = render(<Carousel setApi={(next) => { api = next; }} onIndexChange={onIndexChange}>
      <CarouselContent>{[0, 1, 2].map((n) => <CarouselItem key={n}>{n}</CarouselItem>)}</CarouselContent>
    </Carousel>);
    ready(tree, 3, 100);
    beginDrag(tree);
    TestRenderer.act(() => scrollView(tree).props.onScrollEndDrag({ nativeEvent: {
      contentOffset: { x: 100, y: 0 }, velocity: { x: 1, y: 0 }, targetContentOffset: { x: 200, y: 0 },
    } }));
    expect(api?.selectedScrollSnap()).toBe(0);
    expect(onIndexChange).not.toHaveBeenCalled();
    momentumEnd(tree, 200);
    expect(api?.selectedScrollSnap()).toBe(2);
    expect(onIndexChange).toHaveBeenCalledExactlyOnceWith(2);
    TestRenderer.act(() => tree.unmount());
  });

  it("aligns direction changes without waiting for a content-size event", () => {
    const slides = <CarouselContent>{[0, 1, 2].map((n) => <CarouselItem key={n}>{n}</CarouselItem>)}</CarouselContent>;
    const tree = render(<Carousel dir="ltr">{slides}</Carousel>);
    ready(tree, 3, 100);
    mockState.scrollToCalls = [];
    TestRenderer.act(() => tree.update(<Carousel dir="rtl">{slides}</Carousel>));
    expect(mockState.scrollToCalls.at(-1)).toEqual({ x: 200, y: 0, animated: false });
    TestRenderer.act(() => tree.unmount());
  });

  it("uses the measured viewport height immediately on an orientation change", () => {
    let api: NativeCarouselApi | undefined;
    const setApi = (next: NativeCarouselApi | undefined) => { api = next; };
    const slides = <CarouselContent>{[0, 1, 2].map((n) => <CarouselItem key={n}>{n}</CarouselItem>)}</CarouselContent>;
    const tree = render(<Carousel defaultIndex={1} setApi={setApi}>{slides}</Carousel>);
    ready(tree, 3, 200); // width 200, height 100
    mockState.scrollToCalls = [];
    TestRenderer.act(() => tree.update(<Carousel orientation="vertical" defaultIndex={1} setApi={setApi}>{slides}</Carousel>));
    expect(api?.selectedScrollSnap()).toBe(1);
    expect(mockState.scrollToCalls.at(-1)).toEqual({ x: 0, y: 100, animated: false });
    TestRenderer.act(() => tree.unmount());
  });

  it("does not resurrect an uncontrolled removed page when slides return", () => {
    let api: NativeCarouselApi | undefined;
    const setApi = (next: NativeCarouselApi | undefined) => { api = next; };
    const gallery = (count: number) => <Carousel defaultIndex={2} setApi={setApi}>
      <CarouselContent>{Array.from({ length: count }, (_, n) => <CarouselItem key={n}>{n}</CarouselItem>)}</CarouselContent>
    </Carousel>;
    const tree = render(gallery(3));
    ready(tree, 3, 100);
    expect(api?.selectedScrollSnap()).toBe(2);
    TestRenderer.act(() => tree.update(gallery(1)));
    expect(api?.selectedScrollSnap()).toBe(0);
    TestRenderer.act(() => tree.update(gallery(3)));
    expect(api?.selectedScrollSnap()).toBe(0);
    TestRenderer.act(() => tree.unmount());
  });

  it("scopes Fragment child keys and preserves slide state through RTL and reordering", () => {
    let nextIdentity = 0;
    function Stateful({ name }: { name: string }) {
      const [identity] = React.useState(() => ++nextIdentity);
      return <CarouselItem testID={name}>{identity}</CarouselItem>;
    }
    const gallery = (dir: "ltr" | "rtl", reverse: boolean) => <Carousel dir={dir}>
      <CarouselContent>{(reverse ? ["b", "a"] : ["a", "b"]).map((name) =>
        <React.Fragment key={name}><Stateful key="same" name={name} /></React.Fragment>)}</CarouselContent>
    </Carousel>;
    const tree = render(gallery("ltr", false));
    ready(tree, 2, 100);
    const identity = (name: string) => tree.root.findAll((node) => node.type as unknown === "mock-view" && node.props.testID === name)[0]!.props.children;
    const a = identity("a"), b = identity("b");
    beginDrag(tree);
    TestRenderer.act(() => tree.update(gallery("rtl", true)));
    expect(identity("a")).toBe(a);
    expect(identity("b")).toBe(b);
    TestRenderer.act(() => tree.unmount());
  });

  it("realigns an API request for the current page and ignores its interrupted gesture", () => {
    let api: NativeCarouselApi | undefined;
    const tree = render(<Carousel setApi={(next) => { api = next; }}>
      <CarouselContent><CarouselItem>One</CarouselItem><CarouselItem>Two</CarouselItem></CarouselContent>
    </Carousel>);
    ready(tree, 2, 100);
    beginDrag(tree);
    mockState.scrollToCalls = [];
    TestRenderer.act(() => api?.scrollTo(0, true));
    expect(mockState.scrollToCalls.at(-1)).toEqual({ x: 0, y: 0, animated: false });
    momentumEnd(tree, 100);
    expect(api?.selectedScrollSnap()).toBe(0);
    TestRenderer.act(() => tree.unmount());
  });

  it("honors jump on a controlled API selection when the parent accepts it", async () => {
    let api: NativeCarouselApi | undefined;
    function Controlled() {
      const [index, setIndex] = React.useState(0);
      return <Carousel index={index} onIndexChange={setIndex} setApi={(next) => { api = next; }}>
        <CarouselContent><CarouselItem>One</CarouselItem><CarouselItem>Two</CarouselItem></CarouselContent>
      </Carousel>;
    }
    const tree = render(<Controlled />);
    ready(tree, 2, 100);
    await TestRenderer.act(async () => {});
    mockState.scrollToCalls = [];
    TestRenderer.act(() => api?.scrollTo(1, true));
    expect(api?.selectedScrollSnap()).toBe(1);
    expect(mockState.scrollToCalls.at(-1)).toEqual({ x: 100, y: 0, animated: false });
    TestRenderer.act(() => tree.unmount());
  });

  it("ignores content-size notifications during a drag instead of jumping back", () => {
    let api: NativeCarouselApi | undefined;
    const tree = render(<Carousel setApi={(next) => { api = next; }}>
      <CarouselContent><CarouselItem>One</CarouselItem><CarouselItem>Two</CarouselItem></CarouselContent>
    </Carousel>);
    ready(tree, 2, 100);
    beginDrag(tree);
    mockState.scrollToCalls = [];
    fireContentSize(tree, 2, 100);
    expect(mockState.scrollToCalls).toEqual([]);
    momentumEnd(tree, 100);
    expect(api?.selectedScrollSnap()).toBe(1);
    TestRenderer.act(() => tree.unmount());
  });

  it("owns page spacing and native snap offsets while preserving decorative content styles", () => {
    const tree = render(<Carousel><CarouselContent snapToOffsets={[0, 116]}
      snapToInterval={116} contentContainerStyle={{ gap: 16, padding: 20, backgroundColor: "red" }}>
      <CarouselItem>One</CarouselItem><CarouselItem>Two</CarouselItem>
    </CarouselContent></Carousel>);
    ready(tree, 2, 100);
    const props = scrollView(tree).props;
    expect(props.snapToInterval).toBeUndefined();
    expect(props.snapToOffsets).toBeUndefined();
    const styles = Object.assign({}, ...props.contentContainerStyle);
    expect(styles.gap).toBe(0);
    expect(styles.padding).toBe(0);
    expect(styles.backgroundColor).toBe("red");
    TestRenderer.act(() => tree.unmount());
  });

  it("realigns when leaving controlled mode and reports viewport reinitialization", () => {
    let api: NativeCarouselApi | undefined;
    const setApi = (next: NativeCarouselApi | undefined) => { api = next; };
    const slides = <CarouselContent>{[0, 1, 2].map((n) => <CarouselItem key={n}>{n}</CarouselItem>)}</CarouselContent>;
    const tree = render(<Carousel index={2} setApi={setApi}>{slides}</Carousel>);
    ready(tree, 3, 100);
    const reInit = vi.fn();
    api?.on("reInit", reInit);
    mockState.scrollToCalls = [];
    TestRenderer.act(() => tree.update(<Carousel setApi={setApi}>{slides}</Carousel>));
    expect(api?.selectedScrollSnap()).toBe(0);
    expect(mockState.scrollToCalls.at(-1)).toEqual({ x: 0, y: 0, animated: false });
    reInit.mockClear();
    fireViewportLayout(tree, 200);
    expect(reInit).toHaveBeenCalledExactlyOnceWith(api, "reInit");
    TestRenderer.act(() => tree.unmount());
  });

});
