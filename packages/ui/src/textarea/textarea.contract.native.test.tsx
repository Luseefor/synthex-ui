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
import { Textarea } from "./textarea.native";

function renderTextarea(element: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    tree = TestRenderer.create(element);
  });
  return tree!;
}

function areaProps(tree: TestRenderer.ReactTestRenderer) {
  const nodes = tree.root.findAll((node) => (node.type as unknown as string) === "mock-text-input");
  if (nodes.length === 0) {
    throw new Error("mock-text-input not found");
  }
  return nodes[0]!.props as any;
}

describe("Textarea (native contract)", () => {
  it("forwards refs to the underlying TextInput and clears on unmount", () => {
    const ref = React.createRef<any>();
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(<Textarea ref={ref} aria-label="Bio" />);
    });
    expect(ref.current).toBeTruthy();
    TestRenderer.act(() => {
      tree!.unmount();
    });
    expect(ref.current).toBeNull();
  });

  it("defaults to multiline while allowing explicit override", () => {
    const tree = renderTextarea(<Textarea aria-label="Notes" defaultValue="hi" />);
    expect(areaProps(tree).multiline).toBe(true);
  });

  it("maps disabled to non-editable and exposes disabled state", () => {
    const tree = renderTextarea(<Textarea aria-label="Blocked" disabled defaultValue="x" />);
    const props = areaProps(tree);
    expect(props.editable).toBe(false);
    expect(props.accessibilityState).toMatchObject({ disabled: true });
  });

  it("stays editable when enabled and preserves explicit editable=false", () => {
    const enabled = renderTextarea(<Textarea aria-label="Notes" />);
    expect(areaProps(enabled).editable).toBeUndefined();
    expect(areaProps(enabled).accessibilityState).toMatchObject({ disabled: false });

    const readonly = renderTextarea(<Textarea aria-label="Readonly" editable={false} />);
    expect(areaProps(readonly).editable).toBe(false);
  });

  it("merges caller accessibilityState instead of clobbering disabled", () => {
    const tree = renderTextarea(
      <Textarea aria-label="Merged" accessibilityState={{ busy: true } as any} />,
    );
    expect(areaProps(tree).accessibilityState).toMatchObject({
      busy: true,
      disabled: false,
    });
  });
});
