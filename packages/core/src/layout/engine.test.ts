import { describe, expect, it } from "vitest";
import { createLayoutEngine } from "./engine";
import type { LayoutNode, PanelNode, SplitNode, TabsNode } from "./types";

function panel(id: string): PanelNode {
  return { id, type: "panel", panelType: "editor", title: id };
}

function initialTabs(): TabsNode {
  return {
    id: "t1",
    type: "tabs",
    activePanelId: "p1",
    children: [panel("p1")],
  };
}

function initialSplit(): SplitNode {
  return {
    id: "root",
    type: "split",
    direction: "horizontal",
    sizes: [0.5, 0.5],
    children: [
      { id: "t1", type: "tabs", activePanelId: "p1", children: [panel("p1")] },
      { id: "t2", type: "tabs", activePanelId: "p2", children: [panel("p2")] },
    ],
  };
}

describe("createLayoutEngine", () => {
  it("exposes the initial state and serializes it", () => {
    const engine = createLayoutEngine(initialTabs());
    expect(engine.getState()).toEqual(initialTabs());
    const parsed = JSON.parse(engine.serialize()) as LayoutNode;
    expect(parsed).toEqual(initialTabs());
  });

  it("clones the initial layout", () => {
    const input = initialTabs();
    const engine = createLayoutEngine(input);
    const state = engine.getState();
    expect(state).toEqual(input);
    expect(state).not.toBe(input);
  });

  it("dispatches actions and publishes layout.changed", () => {
    const engine = createLayoutEngine(initialTabs());
    const seen: LayoutNode[] = [];
    const unsubscribe = engine.events.subscribe("layout.changed", (layout) => {
      seen.push(layout);
    });

    engine.dispatch({ type: "ADD_PANEL", targetNodeId: "t1", panel: panel("p2") });

    expect(seen).toHaveLength(1);
    const current = engine.getState();
    expect(current.type).toBe("tabs");
    if (current.type === "tabs") {
      expect(current.children.map((child) => child.id)).toEqual(["p1", "p2"]);
    }
    unsubscribe();
  });

  it("supports command undo and redo", async () => {
    const engine = createLayoutEngine(initialTabs());
    const before = engine.getState();

    await engine.commands.dispatch("ADD_PANEL", {
      type: "ADD_PANEL",
      targetNodeId: "t1",
      panel: panel("p2"),
    });
    expect(engine.getState()).not.toEqual(before);
    const afterAdd = engine.getState();

    expect(engine.commands.getHistoryState().undoDepth).toBe(1);
    expect(await engine.commands.undo()).toBe(true);
    expect(engine.getState()).toEqual(before);

    expect(await engine.commands.redo()).toBe(true);
    expect(engine.getState()).toEqual(afterAdd);
  });

  it("returns false when undoing or redoing with empty history", async () => {
    const engine = createLayoutEngine(initialTabs());
    expect(await engine.commands.undo()).toBe(false);
    expect(await engine.commands.redo()).toBe(false);
  });

  it("merges consecutive resize commands for the same split", async () => {
    const engine = createLayoutEngine(initialSplit());
    const before = engine.getState();

    await engine.commands.dispatch("RESIZE_SPLIT", {
      type: "RESIZE_SPLIT",
      splitId: "root",
      sizes: [0.7, 0.3],
    });
    await engine.commands.dispatch("RESIZE_SPLIT", {
      type: "RESIZE_SPLIT",
      splitId: "root",
      sizes: [0.8, 0.2],
    });

    expect(engine.commands.getHistoryState().undoDepth).toBe(1);

    const resized = engine.getState();
    expect(resized.type).toBe("split");
    if (resized.type === "split") {
      expect(resized.sizes[0]).toBeCloseTo(0.8, 5);
    }

    expect(await engine.commands.undo()).toBe(true);
    expect(engine.getState()).toEqual(before);

    expect(await engine.commands.redo()).toBe(true);
    expect(engine.getState()).toEqual(resized);
  });

  it("keeps separate history entries for different splits", async () => {
    const layout: SplitNode = {
      id: "root",
      type: "split",
      direction: "horizontal",
      sizes: [0.5, 0.5],
      children: [
        {
          id: "left",
          type: "split",
          direction: "vertical",
          sizes: [0.5, 0.5],
          children: [panel("a"), panel("b")],
        },
        panel("c"),
      ],
    };
    const engine = createLayoutEngine(layout);

    await engine.commands.dispatch("RESIZE_SPLIT", {
      type: "RESIZE_SPLIT",
      splitId: "root",
      sizes: [0.6, 0.4],
    });
    await engine.commands.dispatch("RESIZE_SPLIT", {
      type: "RESIZE_SPLIT",
      splitId: "left",
      sizes: [0.9, 0.1],
    });

    expect(engine.commands.getHistoryState().undoDepth).toBe(2);
  });
});
