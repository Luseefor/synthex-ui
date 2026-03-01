export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export type LayoutNodeId = string;
export type LayoutDirection = "horizontal" | "vertical";

export interface BaseLayoutNode<TType extends LayoutNode["type"]> {
  readonly id: LayoutNodeId;
  readonly type: TType;
}

export interface PanelNode extends BaseLayoutNode<"panel"> {
  type: "panel";
  readonly panelType: string;
  readonly title?: string;
  readonly props?: JsonObject;
}

export interface TabsNode extends BaseLayoutNode<"tabs"> {
  type: "tabs";
  readonly activePanelId: LayoutNodeId;
  readonly children: readonly PanelNode[];
}

export interface SplitNode extends BaseLayoutNode<"split"> {
  type: "split";
  readonly direction: LayoutDirection;
  readonly sizes: readonly number[];
  readonly children: readonly LayoutNode[];
}

export type LayoutNode = SplitNode | TabsNode | PanelNode;
