import { describe, expect, it } from "vitest";
import type { LayoutNode, PanelNode, SplitNode, TabsNode } from "./types";
import { validateLayout } from "./validation";

function panel(id: string, panelType = "editor"): PanelNode {
  return { id, type: "panel", panelType, title: id };
}

function tabs(id: string, children: PanelNode[], activePanelId?: string): TabsNode {
  return {
    id,
    type: "tabs",
    activePanelId: activePanelId ?? children[0]?.id ?? "",
    children,
  };
}

function split(id: string, children: LayoutNode[], sizes: readonly number[]): SplitNode {
  return { id, type: "split", direction: "horizontal", sizes, children };
}

describe("validateLayout", () => {
  it("accepts a single panel", () => {
    const result = validateLayout(panel("p1"));
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("accepts valid tabs and split layouts", () => {
    const layout = split("root", [tabs("t1", [panel("p1"), panel("p2")]), panel("p3")], [
      0.6, 0.4,
    ]);
    const result = validateLayout(layout);
    expect(result.valid).toBe(true);
  });

  it("rejects empty node ids", () => {
    const result = validateLayout(panel(""));
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("non-empty"))).toBe(true);
  });

  it("rejects duplicate node ids", () => {
    const layout = split("root", [panel("dup"), panel("dup")], [0.5, 0.5]);
    const result = validateLayout(layout);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("unique"))).toBe(true);
  });

  it("rejects panels with missing panelType", () => {
    const result = validateLayout(panel("p1", ""));
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.nodeId === "p1")).toBe(true);
  });

  it("rejects empty tabs", () => {
    const layout: TabsNode = { id: "t1", type: "tabs", activePanelId: "missing", children: [] };
    const result = validateLayout(layout);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("at least one panel"))).toBe(
      true,
    );
  });

  it("rejects tabs with unknown activePanelId", () => {
    const layout = tabs("t1", [panel("p1")], "nope");
    const result = validateLayout(layout);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("active panel"))).toBe(true);
  });

  it("rejects empty and single-child splits", () => {
    const empty = split("s1", [], []);
    expect(validateLayout(empty).valid).toBe(false);

    const single = split("s2", [panel("p1")], [1]);
    const singleResult = validateLayout(single);
    expect(singleResult.valid).toBe(false);
    expect(singleResult.issues.some((issue) => issue.message.includes("exactly one child"))).toBe(
      true,
    );
  });

  it("rejects splits with mismatched sizes", () => {
    const layout = split("root", [panel("p1"), panel("p2")], [1]);
    const result = validateLayout(layout);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("one ratio per child"))).toBe(
      true,
    );
  });

  it("rejects non-finite and non-positive ratios", () => {
    const zero = split("root", [panel("p1"), panel("p2")], [0, 1]);
    expect(validateLayout(zero).valid).toBe(false);

    const nan = split("root", [panel("p1"), panel("p2")], [Number.NaN, 0.5]);
    expect(validateLayout(nan).valid).toBe(false);
  });

  it("rejects ratios that do not sum to 1", () => {
    const layout = split("root", [panel("p1"), panel("p2")], [0.3, 0.3]);
    const result = validateLayout(layout);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("sum to 1"))).toBe(true);
  });
});
