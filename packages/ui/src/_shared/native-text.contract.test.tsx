import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);

vi.mock("react-native", () => {
  const R = require("react") as typeof React;
  const host = (tag: string) =>
    R.forwardRef(({ children, ...props }: any, ref: any) => R.createElement(tag, { ...props, ref }, children));
  return {
    Pressable: host("rn-pressable"),
    View: host("rn-view"),
    Text: host("rn-text"),
    TextInput: host("rn-input"),
    ScrollView: host("rn-scroll"),
    Modal: ({ children, visible, ...props }: any) => (visible ? R.createElement("rn-modal", props, children) : null),
    Keyboard: { dismiss: vi.fn() },
    useWindowDimensions: () => ({ width: 400, height: 700, scale: 1, fontScale: 1 }),
    Platform: { OS: "ios" },
    StyleSheet: {
      flatten: (v: any) => (Array.isArray(v) ? Object.assign({}, ...v.filter(Boolean)) : (v ?? {})),
      create: (v: any) => v,
    },
  };
});

vi.mock("../icons/index.native", () => ({ CheckIcon: () => null, ChevronRightIcon: () => null, ChevronDownIcon: () => null, SearchIcon: () => null }));

import { ContextMenu, ContextMenuItem } from "../context-menu/context-menu.native";
import { Command, CommandItem } from "../command/command.native";
import { Select, SelectItem, SelectTrigger } from "../select/select.native";
import { Combobox, ComboboxItem, ComboboxTrigger } from "../combobox/combobox.native";
import { renderNativeInlineText } from "./native-text";

function createTree(element: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(element, { createNodeMock: () => ({}) });
  });
  return tree;
}

function destroy(tree: TestRenderer.ReactTestRenderer) {
  act(() => {
    tree.unmount();
  });
}

type JsonNode = { type: string; children?: Array<string | number | JsonNode | null> };

function collectViolations(node: any, path: string): string[] {
  if (node == null || typeof node === "boolean") return [];
  if (typeof node === "string" || typeof node === "number") return [];
  const out: string[] = [];
  const children = (node as JsonNode).children;
  const type = String((node as JsonNode).type);
  if (Array.isArray(children)) {
    for (const child of children) {
      if (typeof child === "string" || typeof child === "number") {
        if (type !== "rn-text" && String(child).length > 0) {
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

describe("native-text inline host invariant", () => {
  it("ContextMenuItem groups mixed interpolation into Text", () => {
    const tree = createTree(
      <ContextMenu>
        <ContextMenuItem testID="ctx-item">Checked: {String(true)}</ContextMenuItem>
      </ContextMenu>,
    );
    try {
      expectNoBareStrings(tree);
    } finally {
      destroy(tree);
    }
  });

  it("ContextMenuItem handles fragments without bare text", () => {
    const tree = createTree(
      <ContextMenu>
        <ContextMenuItem testID="ctx-frag"><>Checked: {String(false)}</></ContextMenuItem>
      </ContextMenu>,
    );
    try {
      expectNoBareStrings(tree);
    } finally {
      destroy(tree);
    }
  });

  it("CommandItem groups mixed interpolation into Text", () => {
    const tree = createTree(
      <Command>
        <CommandItem testID="cmd-item" value="run">Run: {String(1)}</CommandItem>
      </Command>,
    );
    try {
      expectNoBareStrings(tree);
    } finally {
      destroy(tree);
    }
  });

  it("SelectItem groups mixed interpolation into Text", () => {
    const tree = createTree(
      <Select>
        <SelectItem testID="sel-item" value="a">Apple: {String(1)}</SelectItem>
      </Select>,
    );
    try {
      expectNoBareStrings(tree);
    } finally {
      destroy(tree);
    }
  });

  it("ComboboxItem groups mixed interpolation into Text", () => {
    const tree = createTree(
      <Combobox>
        <ComboboxItem testID="combo-item" value="a">Apple: {String(1)}</ComboboxItem>
      </Combobox>,
    );
    try {
      expectNoBareStrings(tree);
    } finally {
      destroy(tree);
    }
  });

  it("SelectTrigger wraps bare text instead of View-direct strings", () => {
    const tree = createTree(
      <Select>
        <SelectTrigger testID="sel-trigger">Bare {String(1)}</SelectTrigger>
      </Select>,
    );
    try {
      expectNoBareStrings(tree);
    } finally {
      destroy(tree);
    }
  });

  it("ComboboxTrigger wraps bare text instead of View-direct strings", () => {
    const tree = createTree(
      <Combobox>
        <ComboboxTrigger testID="combo-trigger">Bare {String(1)}</ComboboxTrigger>
      </Combobox>,
    );
    try {
      expectNoBareStrings(tree);
    } finally {
      destroy(tree);
    }
  });

  it("helper preserves element identity and does not wrap Views in Text", () => {
    const view = <div key="v" />;
    const out = renderNativeInlineText(["a", 1, view, "b"] as any, undefined) as React.ReactNode[];
    expect(Array.isArray(out)).toBe(true);
    const arr = out as any[];
    expect(arr.length).toBe(3);
    expect(arr[1]).toBe(view);
  });

  it("helper preserves keyed fragment boundaries and icon key namespaces", () => {
    const errors: unknown[] = [];
    const orig = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args);
    };
    try {
      const out = renderNativeInlineText(
        [
          <React.Fragment key="a">A {String(1)}<span key="icon">x</span></React.Fragment>,
          <React.Fragment key="b">B {String(2)}<span key="icon">y</span></React.Fragment>,
        ] as any,
        undefined,
      ) as any[];
      expect(Array.isArray(out)).toBe(true);
      expect(out.length).toBe(2);
      expect(React.isValidElement(out[0]) && (out[0] as any).key).toBe("a");
      expect(React.isValidElement(out[1]) && (out[1] as any).key).toBe("b");
      expect(React.isValidElement(out[0]) && (out[0] as any).type).toBe(React.Fragment);
      expect(errors.filter((a) => String((a as unknown[])[0]).includes("duplicate") || String((a as unknown[])[0]).includes("key"))).toEqual([]);
    } finally {
      console.error = orig;
    }
  });

  it("preserves nested array namespaces to avoid duplicate key warnings", () => {
    const errors: unknown[] = [];
    const orig = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args);
    };
    let tree!: TestRenderer.ReactTestRenderer;
    try {
      const nested = [
        [<span key="icon">x</span>],
        [<span key="icon">y</span>],
      ] as any;
      const out = renderNativeInlineText(nested, undefined);
      act(() => {
        tree = TestRenderer.create(React.createElement("div", null, out as any));
      });
      const keyErrors = errors.filter((a) =>
        String((a as unknown[])[0]).includes("duplicate") ||
        (String((a as unknown[])[0]).includes("key") && String((a as unknown[])[0]).includes("unique")),
      );
      expect(keyErrors).toEqual([]);
    } finally {
      console.error = orig;
      if (tree!) act(() => tree.unmount());
    }
  });

  it("generated Text keys skip caller element keys at the same level", () => {
    const errors: unknown[] = [];
    const orig = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args);
    };
    let tree!: TestRenderer.ReactTestRenderer;
    try {
      const caller = <span key="inline-text-0">icon</span>;
      const out = renderNativeInlineText(["hi", caller] as any, undefined) as any[];
      expect(Array.isArray(out)).toBe(true);
      expect(out.length).toBe(2);
      const textKey = React.isValidElement(out[0]) ? String((out[0] as any).key) : "";
      expect(textKey).not.toBe("inline-text-0");
      act(() => {
        tree = TestRenderer.create(React.createElement("div", null, out as any));
      });
      const keyErrors = errors.filter((a) =>
        String((a as unknown[])[0]).includes("duplicate") ||
        (String((a as unknown[])[0]).includes("key") && String((a as unknown[])[0]).includes("unique")),
      );
      expect(keyErrors).toEqual([]);
    } finally {
      console.error = orig;
      if (tree!) act(() => tree.unmount());
    }
  });
});
