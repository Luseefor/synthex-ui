import type { LayoutNode } from "../layout/types";

export function serializeLayout(layout: LayoutNode): string {
  return JSON.stringify(layout, null, 2);
}

export function deserializeLayout(serializedLayout: string): LayoutNode {
  return JSON.parse(serializedLayout) as LayoutNode;
}
