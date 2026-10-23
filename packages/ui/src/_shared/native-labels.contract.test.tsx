/**
 * Native labels contract — mixed-text invariant for owned label seams.
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
  ChevronDownIcon: () => null,
  ChevronLeftIcon: () => null,
  ChevronRightIcon: () => null,
}));

import TestRenderer from "react-test-renderer";
import { StyleSheet, View } from "react-native";
import { Accordion, AccordionItem, AccordionTrigger } from "../accordion/accordion.native";
import { PaginationLink } from "../pagination/pagination.native";
import { RadioGroup, RadioGroupItem } from "../radio-group/radio-group.native";
import { SidebarMenuButton, SidebarProvider } from "../sidebar/sidebar.native";
import { TableCell, TableHead } from "../table/table.native";
import { Toggle } from "../toggle/toggle.native";

function createTree(el: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(el, { createNodeMock: () => ({}) });
  });
  return tree;
}

type JsonNode = { type: string; children?: Array<string | number | JsonNode | null> };

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
    if (typed.type === "mock-text") texts.push(collectTextStrings(typed.children));
    if (Array.isArray(typed.children)) for (const child of typed.children) walk(child);
  };
  for (const root of roots) walk(root);
  return texts.join("|");
}

describe("native labels mixed-text invariant", () => {
  it("accordion trigger mixed interpolation has no bare strings", () => {
    const tree = createTree(
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger>
            Section {"name"} ({String(1)})
          </AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    );
    expectNoBareStrings(tree);
    expect(allTextJoined(tree)).toContain("Section name (1)");
  });

  it("accordion trigger handles 0 and fragments with icon", () => {
    const tree = createTree(
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger>
            <>{"Count "}<View testID="acc-icon" /></>
            {0}
            {" items"}
          </AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    );
    expectNoBareStrings(tree);
    expect(allTextJoined(tree)).toContain("Count ");
    expect(allTextJoined(tree)).toContain("0 items");
    for (const t of tree.root.findAll((n) => String(n.type) === "mock-text")) {
      expect(t.findAll((n) => String(n.type) === "mock-view")).toHaveLength(0);
    }
  });

  it("pagination link mixed interpolation has no bare strings", () => {
    const tree = createTree(
      <PaginationLink>
        Page {"2"} ({String(3)})
      </PaginationLink>,
    );
    expectNoBareStrings(tree);
    expect(allTextJoined(tree)).toContain("Page 2 (3)");
  });

  it("radio group item mixed interpolation has no bare strings", () => {
    const tree = createTree(
      <RadioGroup>
        <RadioGroupItem value="a">
          Option {"one"} ({String(1)})
        </RadioGroupItem>
      </RadioGroup>,
    );
    expectNoBareStrings(tree);
    expect(allTextJoined(tree)).toContain("Option one (1)");
  });

  it("sidebar menu button mixed labels with 0 and fragment preserve icon", () => {
    const tree = createTree(
      <SidebarProvider>
        <SidebarMenuButton>
          <>{"Home "}<View testID="side-icon" /></>
          {"page "}
          {0}
        </SidebarMenuButton>
      </SidebarProvider>,
    );
    expectNoBareStrings(tree);
    expect(allTextJoined(tree)).toContain("Home ");
    expect(allTextJoined(tree)).toContain("0");
    for (const t of tree.root.findAll((n) => String(n.type) === "mock-text")) {
      expect(t.findAll((n) => String(n.type) === "mock-view")).toHaveLength(0);
    }
  });

  it("table head and cell mixed labels have no bare strings", () => {
    const head = createTree(<TableHead>Qty {"(kg)"} ({String(1)})</TableHead>);
    expectNoBareStrings(head);
    expect(allTextJoined(head)).toContain("Qty (kg) (1)");
    const cell = createTree(
      <TableCell>
        <>{"Total "}<View testID="cell-icon" /></>
        {0}
      </TableCell>,
    );
    expectNoBareStrings(cell);
    expect(allTextJoined(cell)).toContain("Total ");
  });

  it("toggle mixed labels keep style precedence and no raw under pressable", () => {
    const tree = createTree(
      <Toggle textStyle={{ color: "rgb(255, 0, 0)" } as any}>
        Enabled {"state"} ({String(1)})
      </Toggle>,
    );
    expectNoBareStrings(tree);
    expect(allTextJoined(tree)).toContain("Enabled state (1)");
    const texts = tree.root.findAll((n) => String(n.type) === "mock-text");
    expect(texts.length).toBeGreaterThan(0);
    expect(StyleSheet.flatten(texts[0]!.props.style)).toMatchObject({ color: "rgb(255, 0, 0)" });
  });
});
