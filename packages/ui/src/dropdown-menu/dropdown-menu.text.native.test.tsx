/**
 * DropdownMenu native — Text invariant.
 * Mocks RN host only; validates no bare string/number outside <Text>,
 * mimicking iOS redbox "Text strings must be rendered within a <Text>".
 */
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactMock = require("react") as typeof React;
  const host = (tag: string) =>
    ReactMock.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactMock.createElement(tag, { ...props, ref }, children),
    );
  const flatten = (value: any): any =>
    Array.isArray(value)
      ? Object.assign({}, ...value.filter(Boolean).map(flatten))
      : (value ?? {});
  return {
    Pressable: host("mock-pressable"),
    View: host("mock-view"),
    Text: host("mock-text"),
    TextInput: host("mock-text-input"),
    ScrollView: host("mock-scroll"),
    Modal: ({ children, visible, ...props }: any) =>
      visible ? ReactMock.createElement("mock-modal", props, children) : null,
    useWindowDimensions: () => ({ width: 400, height: 800, scale: 1, fontScale: 1 }),
    Platform: { OS: "ios", select: (o: any) => o.ios ?? o.default },
    StyleSheet: { create: (s: any) => s, flatten, absoluteFillObject: {} },
    Keyboard: { dismiss: vi.fn() },
  };
});

vi.mock("../icons/index.native", () => ({
  CheckIcon: () => null,
  ChevronRightIcon: () => null,
}));

import TestRenderer from "react-test-renderer";
import { StyleSheet, View } from "react-native";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu.native";
import { ContextMenuCheckboxItem } from "../context-menu/context-menu.native";

function createTree(el: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(el, { createNodeMock: () => ({}) });
  });
  return tree;
}

type JsonNode = { type: string; props?: any; children?: Array<string | number | JsonNode | null> };

function collectViolations(node: any, path: string): string[] {
  if (node == null || typeof node === "boolean") return [];
  if (typeof node === "string" || typeof node === "number") return [];
  const out: string[] = [];
  const children = (node as JsonNode).children;
  const type = (node as JsonNode).type as string;
  if (Array.isArray(children)) {
    for (const child of children) {
      if (typeof child === "string" || typeof child === "number") {
        if (type !== "mock-text" && String(child).length > 0) {
          out.push(`${path}/${type} bare ${JSON.stringify(child)}`);
        }
      } else if (child && typeof child === "object") {
        out.push(...collectViolations(child, `${path}/${type}`));
      }
    }
  }
  return out;
}

function expectNoBareStrings(tree: TestRenderer.ReactTestRenderer) {
  const json: any = tree.toJSON();
  const roots = Array.isArray(json) ? json : json ? [json] : [];
  const violations: string[] = [];
  for (const r of roots) violations.push(...collectViolations(r, "root"));
  expect(violations).toEqual([]);
}

function collectTextStrings(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (node == null || typeof node === "boolean") return "";
  if (Array.isArray(node)) return node.map(collectTextStrings).join("");
  const children = (node as { children?: unknown }).children;
  if (Array.isArray(children)) return children.map(collectTextStrings).join("");
  return "";
}

function allTextJoined(tree: TestRenderer.ReactTestRenderer): string {
  const json: unknown = tree.toJSON();
  const roots = Array.isArray(json) ? json : json ? [json] : [];
  const texts: string[] = [];
  const walk = (node: unknown): void => {
    if (node == null || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return;
    if (Array.isArray(node)) {
      for (const child of node) walk(child);
      return;
    }
    const typed = node as { type?: unknown; children?: unknown };
    if (typed.type === "mock-text") {
      texts.push(collectTextStrings(typed.children));
    }
    if (Array.isArray(typed.children)) {
      for (const child of typed.children) walk(child);
    }
  };
  for (const root of roots) walk(root);
  return texts.join("|");
}

describe("dropdown-menu native text invariant", () => {
  it("trigger wraps interpolated labels without changing activation", () => {
    const changed = vi.fn();
    const tree = createTree(
      <DropdownMenu onOpenChange={changed}>
        <DropdownMenuTrigger>Actions: {2}</DropdownMenuTrigger>
      </DropdownMenu>,
    );
    expectNoBareStrings(tree);
    expect(allTextJoined(tree)).toContain("Actions: 2");
    TestRenderer.act(() => {
      tree.root.find((node) => String(node.type) === "mock-pressable").props.onPress({ defaultPrevented: false });
    });
    expect(changed).toHaveBeenCalledWith(true);
  });

  it("scalar string stays in a single Text with no bare nodes", () => {
    const tree = createTree(
      <DropdownMenuCheckboxItem checked={true}>Show hints</DropdownMenuCheckboxItem>,
    );
    expectNoBareStrings(tree);
    const texts = tree.root.findAll((n) => String(n.type) === "mock-text");
    expect(texts.length).toBeGreaterThan(0);
  });

  it("mixed interpolation Show hints ({String(checked)}) has no bare strings under View", () => {
    const checked = true;
    const tree = createTree(
      <DropdownMenuCheckboxItem checked={checked}>
        Show hints ({String(checked)})
      </DropdownMenuCheckboxItem>,
    );
    expectNoBareStrings(tree);
    // Contiguous primitive segments keep semantics in one Text.
    expect(allTextJoined(tree)).toContain("Show hints (true)");
  });

  it("ContextMenuCheckboxItem forwarding mixed label has no bare strings", () => {
    const checked = false;
    const tree = createTree(
      <ContextMenuCheckboxItem checked={checked}>
        Show hints ({String(checked)})
      </ContextMenuCheckboxItem>,
    );
    expectNoBareStrings(tree);
    expect(allTextJoined(tree)).toContain("Show hints (false)");
  });

  it("nested fragment with icon and shortcut keeps elements out of Text", () => {
    const tree = createTree(
      <DropdownMenuCheckboxItem checked={true}>
        <>{"Show "}<View testID="frag-icon" /></>
        {"hints ("}
        {"true"}
        {")"}
      </DropdownMenuCheckboxItem>,
    );
    expectNoBareStrings(tree);
    // No arbitrary View inside Text (invalid layout).
    for (const t of tree.root.findAll((n) => String(n.type) === "mock-text")) {
      const inside = t.findAll((n) => String(n.type) === "mock-view");
      expect(inside).toHaveLength(0);
    }
  });

  it("icon + shortcut fragment: preserves elements, no raw under View", () => {
    const tree = createTree(
      <DropdownMenu>
        <DropdownMenuItem>
          <>{"Open "}<View testID="frag-icon-2" /></>palette<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenu>,
    );
    expectNoBareStrings(tree);
    // Shortcut element preserved.
    expect(tree.root.findAll((n) => n.props?.testID === "dropdown-menu-shortcut").length).toBeGreaterThan(0);
  });

  it("radio/subtrigger/label/shortcut mixed labels have no bare strings and keep style precedence", () => {
    const radio = createTree(
      <DropdownMenuRadioItem value="a" textStyle={{ color: "rgb(255, 0, 0)" } as any}>
        Pick {"one"} ({String(1)})
      </DropdownMenuRadioItem>,
    );
    expectNoBareStrings(radio);
    const radioTexts = radio.root.findAll((n) => String(n.type) === "mock-text");
    expect(radioTexts.length).toBeGreaterThan(0);
    expect(StyleSheet.flatten(radioTexts[0]!.props.style)).toMatchObject({
      color: "rgb(255, 0, 0)",
    });

    const sub = createTree(
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          More {"options"} ({String(2)})
        </DropdownMenuSubTrigger>
      </DropdownMenuSub>,
    );
    expectNoBareStrings(sub);

    const label = createTree(
      <DropdownMenuLabel>
        Section {"name"} ({String(3)})
      </DropdownMenuLabel>,
    );
    expectNoBareStrings(label);

    const shortcut = createTree(
      <DropdownMenuShortcut>
        {"⌘"}
        {"K"}
      </DropdownMenuShortcut>,
    );
    expectNoBareStrings(shortcut);
    expect(allTextJoined(shortcut)).toContain("⌘K");
  });
});
