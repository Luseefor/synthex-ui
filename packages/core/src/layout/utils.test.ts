import { describe, expect, it } from "vitest";
import {
  cloneLayout,
  findNodeById,
  insertNodeAt,
  normalizeLayout,
  normalizeSplitRatios,
  removeNodeById,
  traverseLayout,
} from "./utils";
import type { LayoutNode, PanelNode, SplitNode, TabsNode } from "./types";

function panel(id: string, props?: PanelNode["props"]): PanelNode {
  return { id, type: "panel", panelType: "editor", title: id, props };
}

function tabsNode(id: string, children: PanelNode[]): TabsNode {
  return { id, type: "tabs", activePanelId: children[0]?.id ?? "", children };
}

describe("layout utils", () => {
  it("clones layouts deeply", () => {
    const original = panel("p1", { nested: { value: 1 }, list: [1, 2] });
    const cloned = cloneLayout(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.props).not.toBe(original.props);
  });

  it("clones split sizes into a new array", () => {
    const original: SplitNode = {
      id: "root",
      type: "split",
      direction: "horizontal",
      sizes: [0.5, 0.5],
      children: [panel("p1"), panel("p2")],
    };
    const cloned = cloneLayout(original);
    expect(cloned).toEqual(original);
    if (cloned.type === "split") {
      expect(cloned.sizes).not.toBe(original.sizes);
    }
  });

  it("traverses every node", () => {
    const layout: SplitNode = {
      id: "root",
      type: "split",
      direction: "horizontal",
      sizes: [0.5, 0.5],
      children: [tabsNode("t1", [panel("p1")]), panel("p2")],
    };
    const visited: string[] = [];
    traverseLayout(layout, (node) => {
      visited.push(node.id);
    });
    expect(visited.sort()).toEqual(["p1", "p2", "root", "t1"].sort());
  });

  it("finds nested nodes and returns null when missing", () => {
    const layout: SplitNode = {
      id: "root",
      type: "split",
      direction: "horizontal",
      sizes: [0.5, 0.5],
      children: [tabsNode("t1", [panel("p1")]), panel("p2")],
    };
    expect(findNodeById(layout, "p1")?.id).toBe("p1");
    expect(findNodeById(layout, "t1")?.type).toBe("tabs");
    expect(findNodeById(layout, "missing")).toBeNull();
  });

  it("removes a panel and collapses single-child splits", () => {
    const layout: SplitNode = {
      id: "root",
      type: "split",
      direction: "horizontal",
      sizes: [0.5, 0.5],
      children: [panel("p1"), panel("p2")],
    };
    const result = removeNodeById(layout, "p1");
    expect(result.removedNode?.id).toBe("p1");
    expect(result.layout).toEqual(panel("p2"));
  });

  it("returns null layout when removing the root", () => {
    const layout = panel("p1");
    const result = removeNodeById(layout, "p1");
    expect(result.removedNode?.id).toBe("p1");
    expect(result.layout).toBeNull();
  });

  it("inserts a panel into tabs", () => {
    const layout = tabsNode("t1", [panel("p1")]);
    const result = insertNodeAt(layout, "t1", panel("p2"), { kind: "tab" });
    expect(result.inserted).toBe(true);
    expect(result.layout.type).toBe("tabs");
    if (result.layout.type === "tabs") {
      expect(result.layout.children.map((child) => child.id)).toEqual(["p1", "p2"]);
    }
  });

  it("rejects inserting a non-panel as a tab", () => {
    const layout = tabsNode("t1", [panel("p1")]);
    const split: SplitNode = {
      id: "s1",
      type: "split",
      direction: "horizontal",
      sizes: [0.5, 0.5],
      children: [panel("a"), panel("b")],
    };
    const result = insertNodeAt(layout, "t1", split, { kind: "tab" });
    expect(result.inserted).toBe(false);
  });

  it("normalizes split ratios", () => {
    expect(normalizeSplitRatios([], 0)).toEqual([]);
    expect(normalizeSplitRatios([1], 2)).toEqual([0.5, 0.5]);
    expect(normalizeSplitRatios([3, 1], 2)).toEqual([0.75, 0.25]);
    expect(normalizeSplitRatios([1, 1], 2)).toEqual([0.5, 0.5]);
    expect(normalizeSplitRatios([], 2)).toEqual([0.5, 0.5]);
  });

  it("normalizes layouts by collapsing single-child splits", () => {
    const layout: SplitNode = {
      id: "root",
      type: "split",
      direction: "horizontal",
      sizes: [1],
      children: [panel("only")],
    };
    expect(normalizeLayout(layout)).toEqual(panel("only"));
  });

  it("normalizes tabs active panel fallback", () => {
    const layout: LayoutNode = {
      id: "t1",
      type: "tabs",
      activePanelId: "missing",
      children: [panel("p1")],
    };
    const normalized = normalizeLayout(layout);
    expect(normalized.type).toBe("tabs");
    if (normalized.type === "tabs") {
      expect(normalized.activePanelId).toBe("p1");
    }
  });
});
