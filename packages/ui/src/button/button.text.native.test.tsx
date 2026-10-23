import * as React from "react";
import { describe, expect, it, vi } from "vitest";
vi.mock("react-native", () => {
  const R = require("react") as typeof React;
  const host = (tag: string) =>
    R.forwardRef(({ children, ...props }: any, ref: any) => R.createElement(tag, { ...props, ref }, children));
  const flatten = (v: any): any => (Array.isArray(v) ? Object.assign({}, ...v.filter(Boolean)) : (v ?? {}));
  return {
    Pressable: host("mock-pressable"), View: host("mock-view"), Text: host("mock-text"),
    Modal: ({ children, visible, ...props }: any) => (visible ? R.createElement("mock-modal", props, children) : null),
    useWindowDimensions: () => ({ width: 400, height: 800, scale: 1, fontScale: 1 }),
    Platform: { OS: "ios", select: (o: any) => o.ios ?? o.default },
    StyleSheet: { create: (s: any) => s, flatten, absoluteFillObject: {} }, Keyboard: { dismiss: vi.fn() },
  };
});
vi.mock("../icons/index.native", () => ({}));
import TestRenderer from "react-test-renderer";
import { StyleSheet, View } from "react-native";
import { Button } from "./button.native";
import { Badge } from "../badge/badge.native";
import { Tabs, TabsTrigger } from "../tabs/tabs.native";
function tree(el: React.ReactElement) {
  let t!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => { t = TestRenderer.create(el, { createNodeMock: () => ({}) }); });
  return t;
}
type J = { type: string; children?: Array<string | number | J | null> };
function viols(n: any, p: string): string[] {
  if (n == null || typeof n === "boolean" || typeof n === "string" || typeof n === "number") return [];
  const out: string[] = []; const ch = (n as J).children; const ty = String((n as J).type);
  if (Array.isArray(ch)) for (const c of ch) {
    if (typeof c === "string" || typeof c === "number") { if (ty !== "mock-text" && String(c).length) out.push(`${p}/${ty} bare ${JSON.stringify(c)}`); }
    else if (c && typeof c === "object") out.push(...viols(c, `${p}/${ty}`));
  }
  return out;
}
function clean(t: TestRenderer.ReactTestRenderer) {
  const j: any = t.toJSON(); const roots = Array.isArray(j) ? j : j ? [j] : [];
  const v: string[] = []; for (const r of roots) v.push(...viols(r, "root"));
  expect(v).toEqual([]);
}
function texts(t: TestRenderer.ReactTestRenderer) {
  return t.root.findAll((n) => String(n.type) === "mock-text");
}
describe("button native text invariant", () => {
  it("fragment Save {count} has no bare strings", () => {
    const count = 3;
    const t = tree(<Button>Save {count}</Button>);
    expect(texts(t).length).toBeGreaterThan(0); clean(t);
    const f = tree(<Button><>Save {count}</></Button>); clean(f);
  });
  it("ordinary interpolation groups one Text continuous label, caller style wins, icon outside", () => {
    const side = "right";
    const t = tree(<Button textStyle={{ color: "rgb(255, 0, 0)" } as any}>Open sheet ({side})</Button>);
    clean(t);
    expect(texts(t).length).toBe(1);
    expect(StyleSheet.flatten(texts(t)[0]!.props.style)).toMatchObject({ color: "rgb(255, 0, 0)" });
    const joined = texts(t).map((n) => (Array.isArray(n.props.children) ? n.props.children.join("") : String(n.props.children ?? ""))).join("|");
    expect(joined).toContain("Open sheet (right)");
    const wIcon = tree(<Button>Go<View testID="btn-icon" /></Button>); clean(wIcon);
    for (const tn of wIcon.root.findAll((n) => String(n.type) === "mock-text"))
      expect(tn.findAll((n) => n.props?.testID === "btn-icon")).toHaveLength(0);
    expect(wIcon.root.findAll((n) => n.props?.testID === "btn-icon").length).toBeGreaterThan(0);
  });
  it("asChild remains untouched", () => {
    const t = tree(<Button asChild><button data-testid="raw">raw</button></Button>);
    expect(t.root.findAll((n) => n.props?.["data-testid"] === "raw").length).toBeGreaterThan(0);
  });
  it("badge fragment/mixed groups one Text, caller style wins, icon outside", () => {
    const t = tree(<Badge textStyle={{ color: "rgb(255, 0, 0)" } as any}>New ({String(4)})</Badge>);
    clean(t);
    expect(texts(t).length).toBe(1);
    expect(StyleSheet.flatten(texts(t)[0]!.props.style)).toMatchObject({ color: "rgb(255, 0, 0)" });
    const f = tree(<Badge><>New {String(5)}</></Badge>); clean(f);
    const w = tree(<Badge>Go<View testID="badge-icon" /></Badge>); clean(w);
    for (const tn of w.root.findAll((n) => String(n.type) === "mock-text"))
      expect(tn.findAll((n) => n.props?.testID === "badge-icon")).toHaveLength(0);
  });
  it("tabs trigger fragment/mixed groups one Text continuous label", () => {
    const t = tree(<Tabs value="one"><TabsTrigger value="one">Tab ({String(1)})</TabsTrigger></Tabs>);
    clean(t);
    expect(texts(t).length).toBe(1);
    const f = tree(<Tabs value="one"><TabsTrigger value="one"><>Tab {String(2)}</></TabsTrigger></Tabs>); clean(f);
  });
});
