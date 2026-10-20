import { describe, expect, it } from "vitest";
import type { LayoutNode, PanelNode } from "../layout/types";
import { deserializeLayout, serializeLayout } from "./serialize";

function sampleLayout(): LayoutNode {
  return {
    id: "root",
    type: "split",
    direction: "horizontal",
    sizes: [0.75, 0.25],
    children: [
      {
        id: "workspace-tabs",
        type: "tabs",
        activePanelId: "workspace",
        children: [{ id: "workspace", type: "panel", panelType: "workspace", title: "Workspace" }],
      },
      { id: "inspector", type: "panel", panelType: "inspector" },
    ],
  };
}

describe("serialization", () => {
  it("serializes to formatted JSON", () => {
    const serialized = serializeLayout(sampleLayout());
    expect(typeof serialized).toBe("string");
    expect(serialized).toContain("\n");
    expect(JSON.parse(serialized)).toEqual(JSON.parse(JSON.stringify(sampleLayout())));
  });

  it("round-trips through deserializeLayout", () => {
    const layout = sampleLayout();
    const restored = deserializeLayout(serializeLayout(layout));
    expect(restored).toEqual(layout);
    expect(restored).not.toBe(layout);
  });

  it("preserves nested children and sizes", () => {
    const restored = deserializeLayout(serializeLayout(sampleLayout()));
    expect(restored.type).toBe("split");
    if (restored.type === "split") {
      expect(restored.sizes).toEqual([0.75, 0.25]);
      expect(restored.children).toHaveLength(2);
    }
  });

  it("keeps the original independent from the restored copy", () => {
    const layout = sampleLayout();
    const restored = deserializeLayout(serializeLayout(layout));
    if (restored.type === "split") {
      const first = restored.children[0];
      if (first?.type === "tabs") {
        (first.children as unknown as PanelNode[]).push({
          id: "mutated",
          type: "panel",
          panelType: "editor",
        });
      }
    }
    expect(layout).toEqual(sampleLayout());
  });
});
