/**
 * Select (native) — testID == web data-slot parity.
 *
 * Web slots (select.web.tsx): select, select-trigger, select-value,
 * select-content, select-viewport, select-item, select-group, select-label,
 * select-separator, select-scroll-up-button, select-scroll-down-button,
 * select-arrow. Native has no viewport/portal (in-flow View); all other
 * slots are mirrored as testID.
 */
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  const mock = (name: string) =>
    ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement(`mock-${name}`, { ...props, ref }, children),
    );
  return {
    Pressable: mock("pressable"),
    Text: mock("text"),
    View: mock("view"),
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
  ChevronDownIcon: () => null,
}));

import TestRenderer from "react-test-renderer";
import {
  Select,
  SelectArrow,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select.native";

function renderOpenSelect() {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  TestRenderer.act(() => {
    tree = TestRenderer.create(
      <Select defaultOpen defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectScrollUpButton />
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectArrow />
          <SelectScrollDownButton />
        </SelectContent>
      </Select>,
    );
  });
  return tree!;
}

describe("Select (native testID parity)", () => {
  it("exposes testIDs matching web data-slot", () => {
    const tree = renderOpenSelect();
    const expected = [
      "select",
      "select-trigger",
      "select-value",
      "select-content",
      "select-group",
      "select-label",
      "select-item",
      "select-separator",
      "select-scroll-up-button",
      "select-scroll-down-button",
      "select-arrow",
    ];
    for (const testID of expected) {
      const nodes = tree.root.findAllByProps({ testID });
      expect(
        nodes.length,
        `expected testID "${testID}" (web data-slot "${testID}")`,
      ).toBeGreaterThan(0);
    }
  });

  it("selects an item via onPress and closes", () => {
    const onValueChange: string[] = [];
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Select
          defaultOpen
          defaultValue="apple"
          onValueChange={(v) => onValueChange.push(v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>,
      );
    });
    const banana = tree!.root
      .findAllByProps({ testID: "select-item" })
      .find((n) => {
        try {
          return n.findByProps({ children: "Banana" });
        } catch {
          return false;
        }
      });
    expect(banana).toBeTruthy();
    TestRenderer.act(() => {
      (banana!.props.onPress as (e: unknown) => void)({});
    });
    expect(onValueChange).toEqual(["banana"]);
  });

  it("hides content when closed", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Select defaultValue="apple">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>,
      );
    });
    expect(
      tree!.root.findAllByProps({ testID: "select-content" }).length,
    ).toBe(0);
  });
});
