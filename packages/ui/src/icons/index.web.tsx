import * as React from "react";
import {
  CalendarDays,
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
  LayoutTemplate,
  Moon,
  Package,
  Palette,
  Sun,
  Terminal,
  Columns2,
  Rows2,
  Activity,
  BookOpen,
  Folder,
  File,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "../_shared/theme/context";
import type { IconName, IconProps } from "./shared";

export const iconMap: Record<IconName, LucideIcon> = {
  add: Plus,
  calendar: CalendarDays,
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
  layoutTemplate: LayoutTemplate,
  package: Package,
  palette: Palette,
  terminal: Terminal,
  moon: Moon,
  sun: Sun,
  columns: Columns2,
  rows: Rows2,
  layout: LayoutTemplate,
  activity: Activity,
  bookOpen: BookOpen,
  folder: Folder,
  file: File,
};

export function Icon({ className, color, name, size = 18, strokeWidth = 1.8 }: IconProps) {
  const theme = useTheme();
  const Component = iconMap[name];

  return (
    <Component
      className={className}
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

export function CalendarIcon(props: Omit<IconProps, "name">) {
  return <Icon name="calendar" {...props} />;
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

export function LayoutTemplateIcon(props: Omit<IconProps, "name">) {
  return <Icon name="layoutTemplate" {...props} />;
}

export function PackageIcon(props: Omit<IconProps, "name">) {
  return <Icon name="package" {...props} />;
}

export function PaletteIcon(props: Omit<IconProps, "name">) {
  return <Icon name="palette" {...props} />;
}

export function TerminalIcon(props: Omit<IconProps, "name">) {
  return <Icon name="terminal" {...props} />;
}

export function MoonIcon(props: Omit<IconProps, "name">) {
  return <Icon name="moon" {...props} />;
}

export function SunIcon(props: Omit<IconProps, "name">) {
  return <Icon name="sun" {...props} />;
}

export function ColumnsIcon(props: Omit<IconProps, "name">) {
  return <Icon name="columns" {...props} />;
}

export function RowsIcon(props: Omit<IconProps, "name">) {
  return <Icon name="rows" {...props} />;
}

export function LayoutIcon(props: Omit<IconProps, "name">) {
  return <Icon name="layout" {...props} />;
}

export function ActivityIcon(props: Omit<IconProps, "name">) {
  return <Icon name="activity" {...props} />;
}

export function BookOpenIcon(props: Omit<IconProps, "name">) {
  return <Icon name="bookOpen" {...props} />;
}

export function FolderIcon(props: Omit<IconProps, "name">) {
  return <Icon name="folder" {...props} />;
}

export function FileIcon(props: Omit<IconProps, "name">) {
  return <Icon name="file" {...props} />;
}
