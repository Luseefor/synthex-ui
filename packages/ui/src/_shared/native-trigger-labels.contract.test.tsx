/**
 * Native trigger labels — action-label invariant for button-like seams.
 * Mocks RN host only; validates no bare string/number outside <Text>.
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
  CloseIcon: () => null,
}));

import TestRenderer from "react-test-renderer";
import { View } from "react-native";
import { Dialog, DialogClose, DialogTrigger } from "../dialog/dialog.native";
import { Popover, PopoverTrigger } from "../popover/popover.native";
import { Collapsible, CollapsibleTrigger } from "../collapsible/collapsible.native";

function createTree(el: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(el, { createNodeMock: () => ({}) });
  });
  return tree;
}

function collectViolations(node: any, path: string): string[] {
  if (node == null || typeof node === "boolean") return [];
  if (typeof node === "string" || typeof node === "number") return [];
  const out: string[] = [];
  const children = (node as any).children;
  const type = (node as any).type as string;
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
    if (typed.type === "mock-text") texts.push(collectTextStrings(typed.children));
    if (Array.isArray(typed.children)) for (const child of typed.children) walk(child);
  };
  for (const root of roots) walk(root);
  return texts.join("|");
}

describe("native trigger action labels", () => {
  it("dialog trigger mixed interpolation has no bare strings", () => {
    const tree = createTree(
      <Dialog>
        <DialogTrigger>
          Open {"dialog"} ({String(1)})
        </DialogTrigger>
      </Dialog>,
    );
    expectNoBareStrings(tree);
    expect(allTextJoined(tree)).toContain("Open dialog (1)");
  });

  it("dialog close handles 0 and fragments", () => {
    const tree = createTree(
      <Dialog>
        <DialogClose>
          <>{"Close "}<View testID="dlg-icon" /></>
          {0}
          {" done"}
        </DialogClose>
      </Dialog>,
    );
    expectNoBareStrings(tree);
    expect(allTextJoined(tree)).toContain("Close ");
  });

  it("popover trigger mixed interpolation has no bare strings", () => {
    const tree = createTree(
      <Popover>
        <PopoverTrigger>
          Show {"info"} ({String(2)})
        </PopoverTrigger>
      </Popover>,
    );
    expectNoBareStrings(tree);
    expect(allTextJoined(tree)).toContain("Show info (2)");
  });

  it("collapsible trigger mixed interpolation with fragment has no bare strings", () => {
    const tree = createTree(
      <Collapsible>
        <CollapsibleTrigger>
          <>{"More "}</>options ({String(3)})
        </CollapsibleTrigger>
      </Collapsible>,
    );
    expectNoBareStrings(tree);
    const joined = allTextJoined(tree);
    expect(joined).toContain("More ");
    expect(joined).toContain("options (3)");
  });
});
