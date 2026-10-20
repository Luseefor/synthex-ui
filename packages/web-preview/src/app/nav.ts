import type { ComponentType } from "react";
import {
  ActivityIcon,
  GridIcon,
  LayoutTemplateIcon,
  PackageIcon,
  PaletteIcon,
  SettingsIcon,
  TerminalIcon,
} from "synthex-ui/icons";

export type RoutePath =
  | "/"
  | "/installation"
  | "/components"
  | "/blocks"
  | "/theme"
  | "/engine"
  | "/docs"
  | "/playground";

export interface NavItem {
  readonly label: string;
  readonly to: RoutePath;
  readonly icon: ComponentType<{ size?: number; className?: string }>;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Overview", to: "/", icon: PackageIcon },
  { label: "Installation", to: "/installation", icon: TerminalIcon },
  { label: "Components", to: "/components", icon: LayoutTemplateIcon },
  { label: "Blocks", to: "/blocks", icon: GridIcon },
  { label: "Theme", to: "/theme", icon: PaletteIcon },
  { label: "Engine", to: "/engine", icon: SettingsIcon },
  { label: "Docs", to: "/docs", icon: TerminalIcon },
  { label: "Playground", to: "/playground", icon: ActivityIcon },
] as const;
