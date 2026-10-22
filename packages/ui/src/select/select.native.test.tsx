/**
 * Select (native) — testID == web data-slot parity.
 *
 * Web slots (select.web.tsx): select, select-trigger, select-value,
 * select-content, select-viewport, select-item, select-group, select-label,
 * select-separator, select-scroll-up-button, select-scroll-down-button,
 * select-arrow. Native renders content in a transparent Modal through the
 * shared overlay helper; all slots above are mirrored as testID.
 */
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  const host = (name: string) =>
    ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement(name, { ...props, ref }, children),
    );
  const flatten = (value: any): any =>
    Array.isArray(value)
      ? Object.assign({}, ...value.filter(Boolean).map(flatten))
      : (value ?? {});
  return {
    Pressable: host("mock-pressable"),
    Text: host("mock-text"),
    View: host("mock-view"),
    ScrollView: host("mock-scroll"),
    SafeAreaView: host("mock-safe-area"),
    KeyboardAvoidingView: host("mock-kav"),
    Modal: ({ children, visible, ...props }: any) =>
      visible ? ReactMock.createElement("mock-modal", props, children) : null,
    Keyboard: { dismiss: vi.fn() },
    useWindowDimensions: () => ({ width: 400, height: 800, scale: 1, fontScale: 1 }),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten,
      absoluteFillObject: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
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

  it("renders content inside a transparent Modal when open", () => {
    const tree = renderOpenSelect();
    const modals = tree.root.findAllByType("mock-modal" as any);
    expect(modals.length).toBeGreaterThan(0);
    const modal = modals[0];
    expect(modal).toBeTruthy();
    expect(modal?.props.transparent).toBe(true);
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
      (banana!.props.onPress as (e: unknown) => void)({ defaultPrevented: false });
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
      tree!.root.findAll((n) => typeof n.type === "string" && n.props?.testID === "select-content").length,
    ).toBe(0);
    expect(tree!.root.findAllByType("mock-modal" as any).length).toBe(0);
  });

  it("applies an explicit dir to the root and the overlay surface", () => {
    let tree: TestRenderer.ReactTestRenderer | undefined;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Select dir="rtl" defaultOpen defaultValue="apple">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>,
      );
    });
    const rootHost = tree!.root
      .findAll((n) => typeof n.type === "string" && n.props?.testID === "select")[0];
    expect(rootHost).toBeTruthy();
    const rootStyle = Array.isArray(rootHost?.props.style)
      ? Object.assign({}, ...rootHost.props.style.filter(Boolean))
      : (rootHost?.props.style ?? {});
    expect(rootStyle.direction).toBe("rtl");

    const surfaceHost = tree!.root
      .findAll((n) => typeof n.type === "string" && n.props?.testID === "select-content")[0];
    expect(surfaceHost).toBeTruthy();
    const surfaceStyle = Array.isArray(surfaceHost?.props.style)
      ? surfaceHost.props.style
      : [surfaceHost?.props.style];
    const lastStyle = surfaceStyle[surfaceStyle.length - 1] ?? {};
    expect(lastStyle.direction).toBe("rtl");
  });
});
