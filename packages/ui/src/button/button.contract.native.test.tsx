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
import { Button } from "./button.native";

function renderButton(element: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree!;
}

function findPressable(tree: TestRenderer.ReactTestRenderer) {
  const nodes = tree.root.findAll((node) => (node.type as unknown as string) === "mock-pressable");
  if (nodes.length === 0) {
    throw new Error("mock-pressable not found");
  }
  return nodes[0]!;
}

function pressableProps(tree: TestRenderer.ReactTestRenderer) {
  return findPressable(tree).props as any;
}

describe("Button (native contract)", () => {
  it("exposes role button and disabled state without relying on host enforcement", () => {
    const tree = renderButton(<Button disabled>Blocked</Button>);
    const props = pressableProps(tree);
    expect(props.accessibilityRole).toBe("button");
    expect(props.disabled).toBe(true);
    expect(props.accessibilityState).toMatchObject({ disabled: true });
  });

  it("blocks onPress when disabled even though the mock host forwards presses", () => {
    const onPress = vi.fn();
    const tree = renderButton(
      <Button disabled onPress={onPress}>
        Blocked
      </Button>,
    );
    const props = pressableProps(tree);
    expect(typeof props.onPress).toBe("function");
    TestRenderer.act(() => {
      props.onPress({ defaultPrevented: false });
    });
    expect(onPress).not.toHaveBeenCalled();
  });

  it("forwards onPress when enabled", () => {
    const onPress = vi.fn();
    const tree = renderButton(<Button onPress={onPress}>Go</Button>);
    TestRenderer.act(() => {
      pressableProps(tree).onPress({ defaultPrevented: false });
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("forwards refs to the underlying pressable and clears on unmount", () => {
    const ref = React.createRef<any>();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(<Button ref={ref}>Ref</Button>);
    });
    expect(ref.current).toBeTruthy();
    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(ref.current).toBeNull();
  });

  it("asChild composes child then parent handlers and respects defaultPrevented", () => {
    const order: string[] = [];
    const childOnPress = vi.fn(() => {
      order.push("child");
    });
    const parentOnPress = vi.fn(() => {
      order.push("parent");
    });
    const Child = React.forwardRef<any, any>(({ onPress, ...rest }: any, ref: any) =>
      React.createElement("mock-pressable", { ...rest, ref, onPress }),
    );
    const tree = renderButton(
      <Button asChild onPress={parentOnPress}>
        <Child onPress={childOnPress}>Link</Child>
      </Button>,
    );
    const props = pressableProps(tree);
    expect(props.accessibilityRole).toBe("button");
    TestRenderer.act(() => {
      props.onPress({ defaultPrevented: false });
    });
    expect(childOnPress).toHaveBeenCalledTimes(1);
    expect(parentOnPress).toHaveBeenCalledTimes(1);
    expect(order).toEqual(["child", "parent"]);
  });

  it("asChild preserves parent onPress when child does not preventDefault, skips parent when prevented", () => {
    const parentOnPress = vi.fn();
    const Child = React.forwardRef<any, any>(({ onPress, ...rest }: any, ref: any) =>
      React.createElement("mock-pressable", { ...rest, ref, onPress }),
    );
    const tree = renderButton(
      <Button asChild onPress={parentOnPress}>
        <Child
          onPress={(event: any) => {
            event.defaultPrevented = true;
          }}
        >
          Guarded
        </Child>
      </Button>,
    );
    TestRenderer.act(() => {
      pressableProps(tree).onPress({ defaultPrevented: true });
    });
    // Child ran first and marked prevented; parent must be skipped.
    expect(parentOnPress).not.toHaveBeenCalled();

    const parentOnPress2 = vi.fn();
    const childOnPress2 = vi.fn();
    const tree2 = renderButton(
      <Button asChild onPress={parentOnPress2}>
        <Child onPress={childOnPress2}>Open</Child>
      </Button>,
    );
    TestRenderer.act(() => {
      pressableProps(tree2).onPress({ defaultPrevented: false });
    });
    expect(childOnPress2).toHaveBeenCalledTimes(1);
    expect(parentOnPress2).toHaveBeenCalledTimes(1);
  });

  it("asChild blocks both handlers when parent is disabled (child enabled)", () => {
    const childOnPress = vi.fn();
    const parentOnPress = vi.fn();
    const Child = React.forwardRef<any, any>(({ onPress, ...rest }: any, ref: any) =>
      React.createElement("mock-pressable", { ...rest, ref, onPress }),
    );
    const tree = renderButton(
      <Button asChild disabled onPress={parentOnPress}>
        <Child onPress={childOnPress}>Blocked</Child>
      </Button>,
    );
    const props = pressableProps(tree);
    expect(props.disabled).toBe(true);
    expect(props.accessibilityState).toMatchObject({ disabled: true });
    TestRenderer.act(() => {
      props.onPress({ defaultPrevented: false });
    });
    expect(childOnPress).not.toHaveBeenCalled();
    expect(parentOnPress).not.toHaveBeenCalled();
  });

  it("asChild blocks both handlers when child is disabled (parent enabled)", () => {
    const childOnPress = vi.fn();
    const parentOnPress = vi.fn();
    const Child = React.forwardRef<any, any>(({ onPress, ...rest }: any, ref: any) =>
      React.createElement("mock-pressable", { ...rest, ref, onPress }),
    );
    const tree = renderButton(
      <Button asChild onPress={parentOnPress}>
        <Child disabled onPress={childOnPress}>
          Still blocked
        </Child>
      </Button>,
    );
    const props = pressableProps(tree);
    expect(props.disabled).toBe(true);
    expect(props.accessibilityState).toMatchObject({ disabled: true });
    TestRenderer.act(() => {
      props.onPress({ defaultPrevented: false });
    });
    expect(childOnPress).not.toHaveBeenCalled();
    expect(parentOnPress).not.toHaveBeenCalled();
  });

  it("asChild does not re-enable a disabled child when parent is enabled", () => {
    const Child = React.forwardRef<any, any>((rest: any, ref: any) =>
      React.createElement("mock-pressable", { ...rest, ref }),
    );
    const tree = renderButton(
      <Button asChild>
        <Child disabled>Still blocked</Child>
      </Button>,
    );
    const props = pressableProps(tree);
    expect(props.disabled).toBe(true);
    expect(props.accessibilityState).toMatchObject({ disabled: true });
  });

  it("asChild preserves child and forwarded refs, including callback cleanup", () => {
    const forwardedValues: Array<unknown> = [];
    const childValues: Array<unknown> = [];
    let childCleanupCalled = 0;
    let forwardedCleanupCalled = 0;

    const Child = React.forwardRef<any, any>((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ __childHost: true }));
      const { ref: _omit, ...rest } = props;
      return React.createElement("mock-pressable", rest);
    });
    const childRef = (node: unknown) => {
      childValues.push(node);
      return () => {
        childCleanupCalled += 1;
      };
    };
    const forwardedRef = (node: unknown) => {
      forwardedValues.push(node);
      return () => {
        forwardedCleanupCalled += 1;
      };
    };

    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Button asChild ref={forwardedRef}>
          <Child ref={childRef}>Both refs</Child>
        </Button>,
      );
    });
    expect(forwardedValues.length).toBeGreaterThan(0);
    expect(childValues.length).toBeGreaterThan(0);
    expect(forwardedValues[0]).toBeTruthy();
    expect(childValues[0]).toBeTruthy();
    // Both refs observe the same host node.
    expect(forwardedValues[0]).toBe(childValues[0]);

    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(childCleanupCalled).toBeGreaterThan(0);
    expect(forwardedCleanupCalled).toBeGreaterThan(0);
  });

  it("asChild supports object refs for child and parent with detach to null", () => {
    const childRef = React.createRef<any>();
    const parentRef = React.createRef<any>();
    const Child = React.forwardRef<any, any>((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ __childHost: true }));
      const { ref: _omit, ...rest } = props;
      return React.createElement("mock-pressable", rest);
    });
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Button asChild ref={parentRef}>
          <Child ref={childRef}>Refs</Child>
        </Button>,
      );
    });
    // With a composite child the merged ref resolves; both refs must attach
    // to the same node and detach to null together.
    expect(childRef.current).toBeTruthy();
    expect(parentRef.current).toBeTruthy();
    expect(childRef.current).toBe(parentRef.current);
    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(childRef.current).toBeNull();
    expect(parentRef.current).toBeNull();
  });
});
