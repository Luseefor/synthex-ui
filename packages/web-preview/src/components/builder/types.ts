export interface ComponentDef {
  readonly type: string;
  readonly label: string;
  readonly icon: string;
  readonly category: string;
}

export interface BuilderNode {
  id: string;
  type: string;
  props: Record<string, any>;
  x: number;
  y: number;
  w: number;
  h: number;
}
