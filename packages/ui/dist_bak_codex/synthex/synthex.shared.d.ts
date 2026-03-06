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
export interface TimelineRowSharedProps extends TimelineEntry {
}
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
    readonly onSubmit?: (values: {
        email: string;
        message: string;
        name: string;
    }) => void;
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
export declare const defaultThemeAccent: ThemeAccentName;
export declare const themeAccentPresets: Record<ThemeAccentName, ThemeAccentPreset>;
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
export declare function resolveThemeAccentTheme(accent: ThemeAccentName, mode: ThemeMode): DeepPartial<SynthexTheme>;
export declare function getCadenceMax(data: readonly CadenceDatum[]): number;
export declare function getChangeToneClass(tone?: KPIStatItem["tone"]): "default" | "accent" | "positive" | "warning";
//# sourceMappingURL=synthex.shared.d.ts.map