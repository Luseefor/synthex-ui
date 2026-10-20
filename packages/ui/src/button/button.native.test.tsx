import * as React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  return {
    Pressable: ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement("mock-pressable", { ...props, ref }, children),
    ),
    Text: ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement("mock-text", { ...props, ref }, children),
    ),
    View: ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement("mock-view", { ...props, ref }, children),
    ),
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

describe("Button (native smoke)", () => {
  it("renders without crashing", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(<Button>Press me</Button>);
    });
    expect(tree?.toJSON()).toBeTruthy();
    expect(tree?.root.findByProps({ children: "Press me" })).toBeTruthy();
  });

  it("renders variants without crashing", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <>
          <Button variant="secondary" size="sm">
            Secondary
          </Button>
          <Button variant="destructive" disabled>
            Destructive
          </Button>
        </>,
      );
    });
    expect(tree?.toJSON()).toBeTruthy();
  });
});
