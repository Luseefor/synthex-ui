import * as React from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  LayoutGrid,
  PanelBottom,
  PanelLeft,
  PanelRight,
  PanelTop,
  Plus,
  Redo2,
  Search,
  Settings,
  Undo2,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useTheme } from "../_shared/theme/context";
import type { IconName, IconProps } from "./shared";

export const iconMap: Record<IconName, LucideIcon> = {
  add: Plus,
  check: Check,
  close: X,
  search: Search,
  settings: Settings,
  undo: Undo2,
  redo: Redo2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  panelLeft: PanelLeft,
  panelRight: PanelRight,
  panelTop: PanelTop,
  panelBottom: PanelBottom,
  grid: LayoutGrid,
};

export function Icon({ color, name, size = 18, strokeWidth = 1.8 }: IconProps) {
  const theme = useTheme();
  const Component = iconMap[name];

  return (
    <Component
      color={color ?? theme.colors.foreground}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}

export function AddIcon(props: Omit<IconProps, "name">) {
  return <Icon name="add" {...props} />;
}

export function CloseIcon(props: Omit<IconProps, "name">) {
  return <Icon name="close" {...props} />;
}

export function CheckIcon(props: Omit<IconProps, "name">) {
  return <Icon name="check" {...props} />;
}

export function SearchIcon(props: Omit<IconProps, "name">) {
  return <Icon name="search" {...props} />;
}

export function GridIcon(props: Omit<IconProps, "name">) {
  return <Icon name="grid" {...props} />;
}

export function SettingsIcon(props: Omit<IconProps, "name">) {
  return <Icon name="settings" {...props} />;
}

export function UndoIcon(props: Omit<IconProps, "name">) {
  return <Icon name="undo" {...props} />;
}

export function RedoIcon(props: Omit<IconProps, "name">) {
  return <Icon name="redo" {...props} />;
}

export function PanelLeftIcon(props: Omit<IconProps, "name">) {
  return <Icon name="panelLeft" {...props} />;
}

export function PanelRightIcon(props: Omit<IconProps, "name">) {
  return <Icon name="panelRight" {...props} />;
}

export function PanelTopIcon(props: Omit<IconProps, "name">) {
  return <Icon name="panelTop" {...props} />;
}

export function PanelBottomIcon(props: Omit<IconProps, "name">) {
  return <Icon name="panelBottom" {...props} />;
}

export function ChevronLeftIcon(props: Omit<IconProps, "name">) {
  return <Icon name="chevronLeft" {...props} />;
}

export function ChevronRightIcon(props: Omit<IconProps, "name">) {
  return <Icon name="chevronRight" {...props} />;
}

export function ChevronDownIcon(props: Omit<IconProps, "name">) {
  return <Icon name="chevronDown" {...props} />;
}
