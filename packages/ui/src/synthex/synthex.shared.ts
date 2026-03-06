import type * as React from "react";
import type { DeepPartial, SynthexTheme, ThemeMode } from "../_shared/types";

export type AssistantChatRole = "assistant" | "user" | "system";

export interface AssistantChatMessage {
  readonly id: string;
  readonly role: AssistantChatRole;
  readonly author?: React.ReactNode;
  readonly content: React.ReactNode;
  readonly meta?: React.ReactNode;
}

export interface AssistantChatPanelSharedProps {
  readonly actions?: React.ReactNode;
  readonly composerLabel?: React.ReactNode;
  readonly defaultValue?: string;
  readonly description?: React.ReactNode;
  readonly emptyState?: React.ReactNode;
  readonly messages: readonly AssistantChatMessage[];
  readonly onSubmit?: (value: string) => void;
  readonly onValueChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly submitLabel?: React.ReactNode;
  readonly title?: React.ReactNode;
  readonly value?: string;
}

export interface FloatingAssistantLauncherSharedProps {
  readonly badge?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly defaultOpen?: boolean;
  readonly description?: React.ReactNode;
  readonly label?: React.ReactNode;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
  readonly title?: React.ReactNode;
}

export interface CadenceDatum {
  readonly id?: string;
  readonly label: string;
  readonly value: number;
}

export interface CadenceBarChartSharedProps {
  readonly data: readonly CadenceDatum[];
  readonly description?: React.ReactNode;
  readonly title?: React.ReactNode;
  readonly valueFormatter?: (value: number) => React.ReactNode;
}

export interface MarqueeItem {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly meta?: React.ReactNode;
}

export interface MarqueeSharedProps {
  readonly items: readonly MarqueeItem[];
  readonly speed?: "slow" | "normal" | "fast";
}

export interface KPIStatItem {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly value: React.ReactNode;
  readonly change?: React.ReactNode;
  readonly detail?: React.ReactNode;
  readonly tone?: "default" | "accent" | "positive" | "warning";
}

export interface KPIStatGridSharedProps {
  readonly columns?: 2 | 3 | 4;
  readonly stats: readonly KPIStatItem[];
}

export interface TimelineEntry {
  readonly id: string;
  readonly date: React.ReactNode;
  readonly title: React.ReactNode;
  readonly organization?: React.ReactNode;
  readonly summary?: React.ReactNode;
  readonly tags?: readonly React.ReactNode[];
}

export interface TimelineRowSharedProps extends TimelineEntry {}

export interface ExperienceTimelineSharedProps {
  readonly entries: readonly TimelineEntry[];
  readonly title?: React.ReactNode;
  readonly description?: React.ReactNode;
}

export interface ProjectCaseMetric {
  readonly label: React.ReactNode;
  readonly value: React.ReactNode;
}

export interface ProjectCaseRowSharedProps {
  readonly category?: React.ReactNode;
  readonly ctaLabel?: React.ReactNode;
  readonly href?: string;
  readonly index: number | string;
  readonly metrics?: readonly ProjectCaseMetric[];
  readonly summary?: React.ReactNode;
  readonly title: React.ReactNode;
}

export interface ContactChannel {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly value: React.ReactNode;
  readonly href?: string;
  readonly meta?: React.ReactNode;
}

export interface ContactSplitFormSharedProps {
  readonly channels: readonly ContactChannel[];
  readonly defaultEmail?: string;
  readonly defaultMessage?: string;
  readonly defaultName?: string;
  readonly description?: React.ReactNode;
  readonly onSubmit?: (values: { email: string; message: string; name: string }) => void;
  readonly submitLabel?: React.ReactNode;
  readonly title?: React.ReactNode;
}

export interface DungeonHUDMetric {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly value: React.ReactNode;
}

export interface DungeonHUDShellSharedProps {
  readonly actions?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly metrics: readonly DungeonHUDMetric[];
  readonly mission?: React.ReactNode;
  readonly sidebar?: React.ReactNode;
  readonly title: React.ReactNode;
}

export type ThemeAccentName = "steel" | "stone" | "bronze" | "mulberry";

export interface ThemeAccentPreset {
  readonly label: string;
  readonly swatch: string;
  readonly light: DeepPartial<SynthexTheme>;
  readonly dark: DeepPartial<SynthexTheme>;
}

export const defaultThemeAccent: ThemeAccentName = "steel";

export const themeAccentPresets: Record<ThemeAccentName, ThemeAccentPreset> = {
  steel: {
    label: "Steel",
    swatch: "#93a8bf",
    light: {
      colors: {
        primary: "#93a8bf",
        primaryHover: "#7f96af",
        primaryMuted: "#eaf0f6",
        ring: "#93a8bf",
      },
    },
    dark: {
      colors: {
        primary: "#9db1c6",
        primaryHover: "#b3c3d5",
        primaryMuted: "rgba(157, 177, 198, 0.22)",
        ring: "#9db1c6",
      },
    },
  },
  stone: {
    label: "Stone",
    swatch: "#adb9a3",
    light: {
      colors: {
        primary: "#adb9a3",
        primaryHover: "#97a38e",
        primaryMuted: "#edf2e9",
        ring: "#adb9a3",
      },
    },
    dark: {
      colors: {
        primary: "#b7c1ae",
        primaryHover: "#cad2c4",
        primaryMuted: "rgba(183, 193, 174, 0.22)",
        ring: "#b7c1ae",
      },
    },
  },
  bronze: {
    label: "Bronze",
    swatch: "#bc9972",
    light: {
      colors: {
        primary: "#bc9972",
        primaryHover: "#a8855f",
        primaryMuted: "#f6ede4",
        ring: "#bc9972",
      },
    },
    dark: {
      colors: {
        primary: "#caa27a",
        primaryHover: "#dfb891",
        primaryMuted: "rgba(202, 162, 122, 0.23)",
        ring: "#caa27a",
      },
    },
  },
  mulberry: {
    label: "Mulberry",
    swatch: "#ab91b4",
    light: {
      colors: {
        primary: "#ab91b4",
        primaryHover: "#967aa0",
        primaryMuted: "#f2edf3",
        ring: "#ab91b4",
      },
    },
    dark: {
      colors: {
        primary: "#b79bc0",
        primaryHover: "#ccafd4",
        primaryMuted: "rgba(183, 155, 192, 0.23)",
        ring: "#b79bc0",
      },
    },
  },
};

export interface ThemeAccentSwitcherSharedProps {
  readonly accent?: ThemeAccentName;
  readonly compact?: boolean;
  readonly defaultAccent?: ThemeAccentName;
  readonly defaultMode?: ThemeMode;
  readonly defaultOpen?: boolean;
  readonly mode?: ThemeMode;
  readonly onAccentChange?: (accent: ThemeAccentName) => void;
  readonly onModeChange?: (mode: ThemeMode) => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
  readonly title?: React.ReactNode;
}

export function resolveThemeAccentTheme(
  accent: ThemeAccentName,
  mode: ThemeMode,
): DeepPartial<SynthexTheme> {
  const preset = themeAccentPresets[accent] ?? themeAccentPresets[defaultThemeAccent];
  return mode === "dark" ? preset.dark : preset.light;
}

export function getCadenceMax(data: readonly CadenceDatum[]) {
  return Math.max(1, ...data.map((entry) => entry.value));
}

export function getChangeToneClass(tone?: KPIStatItem["tone"]) {
  switch (tone) {
    case "accent":
      return "accent";
    case "positive":
      return "positive";
    case "warning":
      return "warning";
    default:
      return "default";
  }
}
