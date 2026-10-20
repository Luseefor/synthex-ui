import { describe, expect, it } from "vitest";
import { layoutReducer } from "./reducer";
import type { LayoutNode, PanelNode, SplitNode, TabsNode } from "./types";

function panel(id: string): PanelNode {
  return { id, type: "panel", panelType: "editor", title: id };
}

function tabsNode(id: string, children: PanelNode[], activePanelId?: string): TabsNode {
  return {
    id,
    type: "tabs",
    activePanelId: activePanelId ?? children[0]?.id ?? "",
    children,
  };
}

function splitNode(id: string, children: LayoutNode[], sizes: readonly number[]): SplitNode {
  return { id, type: "split", direction: "horizontal", sizes, children };
}

describe("layoutReducer", () => {
  it("replaces layout on SET_LAYOUT", () => {
    const initial = tabsNode("t1", [panel("p1")]);
    const next = tabsNode("t2", [panel("p9")]);
    const result = layoutReducer(initial, { type: "SET_LAYOUT", layout: next });
    expect(result).toEqual(next);
  });

  it("rejects invalid SET_LAYOUT and keeps fallback state", () => {
    const initial = tabsNode("t1", [panel("p1")]);
    const invalid: TabsNode = { id: "bad", type: "tabs", activePanelId: "missing", children: [] };
    const result = layoutReducer(initial, { type: "SET_LAYOUT", layout: invalid });
    expect(result).toEqual(initial);
  });

  it("sets the active panel", () => {
    const initial = tabsNode("t1", [panel("p1"), panel("p2")], "p1");
    const result = layoutReducer(initial, { type: "SET_ACTIVE_PANEL", tabsId: "t1", panelId: "p2" });
    expect(result.type).toBe("tabs");
    if (result.type === "tabs") {
      expect(result.activePanelId).toBe("p2");
    }
  });

  it("ignores SET_ACTIVE_PANEL for unknown tabs or panel", () => {
    const initial = tabsNode("t1", [panel("p1"), panel("p2")], "p1");
    const unknownTabs = layoutReducer(initial, {
      type: "SET_ACTIVE_PANEL",
      tabsId: "missing",
      panelId: "p2",
    });
    expect(unknownTabs).toEqual(initial);

    const unknownPanel = layoutReducer(initial, {
      type: "SET_ACTIVE_PANEL",
      tabsId: "t1",
      panelId: "missing",
    });
    expect(unknownPanel).toEqual(initial);
  });

  it("adds a panel to tabs", () => {
    const initial = tabsNode("t1", [panel("p1")]);
    const result = layoutReducer(initial, {
      type: "ADD_PANEL",
      targetNodeId: "t1",
      panel: panel("p2"),
    });
    expect(result.type).toBe("tabs");
    if (result.type === "tabs") {
      expect(result.children.map((child) => child.id)).toEqual(["p1", "p2"]);
      expect(result.activePanelId).toBe("p2");
    }
  });

  it("ignores ADD_PANEL for missing targets", () => {
    const initial = tabsNode("t1", [panel("p1")]);
    const result = layoutReducer(initial, {
      type: "ADD_PANEL",
      targetNodeId: "missing",
      panel: panel("p2"),
    });
    expect(result).toBe(initial);
  });

  it("removes a panel and fixes the active panel", () => {
    const initial = tabsNode("t1", [panel("p1"), panel("p2")], "p1");
    const result = layoutReducer(initial, { type: "REMOVE_PANEL", panelId: "p1" });
    expect(result.type).toBe("tabs");
    if (result.type === "tabs") {
      expect(result.children.map((child) => child.id)).toEqual(["p2"]);
      expect(result.activePanelId).toBe("p2");
    }
  });

  it("ignores REMOVE_PANEL for missing ids and non-panels", () => {
    const initial = tabsNode("t1", [panel("p1"), panel("p2")], "p1");
    expect(layoutReducer(initial, { type: "REMOVE_PANEL", panelId: "missing" })).toBe(initial);

    const split = splitNode("root", [tabsNode("t1", [panel("p1")]), panel("p2")], [0.5, 0.5]);
    expect(layoutReducer(split, { type: "REMOVE_PANEL", panelId: "t1" })).toBe(split);
  });

  it("keeps state when removing the last panel of a tabs node", () => {
    const initial = tabsNode("t1", [panel("p1")], "p1");
    expect(layoutReducer(initial, { type: "REMOVE_PANEL", panelId: "p1" })).toBe(initial);
  });

  it("splits a single panel into a split node", () => {
    const initial = panel("p1");
    const result = layoutReducer(initial, {
      type: "SPLIT_NODE",
      targetNodeId: "p1",
      direction: "vertical",
      node: panel("p2"),
      position: "after",
    });
    expect(result.type).toBe("split");
    if (result.type === "split") {
      expect(result.direction).toBe("vertical");
      expect(result.children).toHaveLength(2);
      expect(result.sizes).toEqual([0.5, 0.5]);
    }
  });

  it("ignores SPLIT_NODE for missing targets", () => {
    const initial = panel("p1");
    const result = layoutReducer(initial, {
      type: "SPLIT_NODE",
      targetNodeId: "missing",
      direction: "horizontal",
      node: panel("p2"),
    });
    expect(result).toBe(initial);
  });

  it("moves a panel between tabs", () => {
    const initial = splitNode(
      "root",
      [tabsNode("t1", [panel("p1"), panel("p1b")]), tabsNode("t2", [panel("p2")])],
      [0.5, 0.5],
    );
    const result = layoutReducer(initial, {
      type: "MOVE_NODE",
      nodeId: "p1",
      targetNodeId: "t2",
      position: { kind: "tab" },
    });
    if (result.type !== "split") {
      throw new Error("Expected split layout after move.");
    }
    const first = result.children[0];
    const second = result.children[1];
    if (first?.type !== "tabs" || second?.type !== "tabs") {
      throw new Error("Expected tabs children after move.");
    }
    expect(first.children.map((child) => child.id)).toEqual(["p1b"]);
    expect(second.children.map((child) => child.id).sort()).toEqual(["p1", "p2"]);
  });

  it("ignores no-op and invalid moves", () => {
    const initial = splitNode(
      "root",
      [tabsNode("t1", [panel("p1")]), panel("p2")],
      [0.5, 0.5],
    );
    const selfMove = layoutReducer(initial, {
      type: "MOVE_NODE",
      nodeId: "p1",
      targetNodeId: "p1",
      position: { kind: "tab" },
    });
    expect(selfMove).toBe(initial);

    const missing = layoutReducer(initial, {
      type: "MOVE_NODE",
      nodeId: "missing",
      targetNodeId: "p2",
      position: { kind: "tab" },
    });
    expect(missing).toBe(initial);

    const intoDescendant = layoutReducer(initial, {
      type: "MOVE_NODE",
      nodeId: "root",
      targetNodeId: "p1",
      position: { kind: "tab" },
    });
    expect(intoDescendant).toBe(initial);
  });

  it("resizes a split and normalizes ratios", () => {
    const initial = splitNode("root", [panel("p1"), panel("p2")], [0.5, 0.5]);
    const result = layoutReducer(initial, {
      type: "RESIZE_SPLIT",
      splitId: "root",
      sizes: [3, 1],
    });
    expect(result.type).toBe("split");
    if (result.type === "split") {
      expect(result.sizes[0]).toBeCloseTo(0.75, 5);
      expect(result.sizes[1]).toBeCloseTo(0.25, 5);
    }
  });

  it("ignores RESIZE_SPLIT for unknown splits", () => {
    const initial = splitNode("root", [panel("p1"), panel("p2")], [0.5, 0.5]);
    const result = layoutReducer(initial, {
      type: "RESIZE_SPLIT",
      splitId: "missing",
      sizes: [0.8, 0.2],
    });
    expect(result).toEqual(initial);
  });

  it("updates panel props", () => {
    const initial = tabsNode("t1", [panel("p1")]);
    const result = layoutReducer(initial, {
      type: "UPDATE_PANEL",
      panelId: "p1",
      update: { title: "Renamed" },
    });
    if (result.type !== "tabs") {
      throw new Error("Expected tabs layout.");
    }
    expect(result.children[0]?.title).toBe("Renamed");
  });

  it("ignores UPDATE_PANEL for unknown panels", () => {
    const initial = tabsNode("t1", [panel("p1")]);
    const result = layoutReducer(initial, {
      type: "UPDATE_PANEL",
      panelId: "missing",
      update: { title: "Renamed" },
    });
    expect(result).toEqual(initial);
  });
});
