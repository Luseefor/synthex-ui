import * as React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  return {
    TextInput: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
      ReactMock.useImperativeHandle(ref, () => ({ __mockTextInput: true }));
      const { ref: _omit, ...rest } = props;
      return ReactMock.createElement("mock-text-input", rest, children);
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
import { Input } from "./input.native";

function renderInput(element: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree!;
}

function inputProps(tree: TestRenderer.ReactTestRenderer) {
  const nodes = tree.root.findAll((node) => (node.type as unknown as string) === "mock-text-input");
  if (nodes.length === 0) {
    throw new Error("mock-text-input not found");
  }
  return nodes[0]!.props as any;
}

describe("Input (native contract)", () => {
  it("forwards refs to the underlying TextInput and clears on unmount", () => {
    const ref = React.createRef<any>();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(<Input ref={ref} aria-label="Username" />);
    });
    expect(ref.current).toBeTruthy();
    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(ref.current).toBeNull();
  });

  it("maps disabled to non-editable and exposes disabled state", () => {
    const tree = renderInput(<Input aria-label="Blocked" disabled defaultValue="x" />);
    const props = inputProps(tree);
    expect(props.editable).toBe(false);
    expect(props.accessibilityState).toMatchObject({ disabled: true });
  });

  it("stays editable when enabled and preserves explicit editable=false", () => {
    const enabled = renderInput(<Input aria-label="Name" defaultValue="ada" />);
    // Undefined preserves RN default (editable) instead of forcing true.
    expect(inputProps(enabled).editable).toBeUndefined();
    expect(inputProps(enabled).accessibilityState).toMatchObject({ disabled: false });

    const readonly = renderInput(<Input aria-label="Readonly" editable={false} />);
    expect(inputProps(readonly).editable).toBe(false);
  });

  it("merges caller accessibilityState instead of clobbering disabled", () => {
    const tree = renderInput(
      <Input aria-label="Merged" accessibilityState={{ busy: true } as any} />,
    );
    expect(inputProps(tree).accessibilityState).toMatchObject({
      busy: true,
      disabled: false,
    });
  });

  it("forwards value and placeholder without altering them", () => {
    const tree = renderInput(
      <Input aria-label="Email" value="a@example.com" placeholder="you@example.com" />,
    );
    const props = inputProps(tree);
    expect(props.value).toBe("a@example.com");
    expect(props.placeholder).toBe("you@example.com");
  });
});
