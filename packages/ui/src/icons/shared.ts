export const iconNames = [
  "add",
  "check",
  "close",
  "search",
  "settings",
  "undo",
  "redo",
  "chevronLeft",
  "chevronRight",
  "chevronDown",
  "chevronUp",
  "panelLeft",
  "panelRight",
  "panelTop",
  "panelBottom",
  "grid",
] as const;

export type IconName = (typeof iconNames)[number];

export interface IconProps {
  readonly color?: string;
  readonly name: IconName;
  readonly size?: number;
  readonly strokeWidth?: number;
}
