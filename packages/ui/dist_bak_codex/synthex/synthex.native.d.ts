import * as React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import type { AssistantChatPanelSharedProps, CadenceBarChartSharedProps, ContactSplitFormSharedProps, DungeonHUDShellSharedProps, ExperienceTimelineSharedProps, FloatingAssistantLauncherSharedProps, KPIStatGridSharedProps, MarqueeSharedProps, ProjectCaseRowSharedProps, ThemeAccentSwitcherSharedProps, TimelineRowSharedProps } from "./synthex.shared";
export interface ThemeAccentSwitcherProps extends Omit<ViewProps, keyof ThemeAccentSwitcherSharedProps>, ThemeAccentSwitcherSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const ThemeAccentSwitcher: React.ForwardRefExoticComponent<ThemeAccentSwitcherProps & React.RefAttributes<View>>;
export interface AssistantChatPanelProps extends Omit<ViewProps, keyof AssistantChatPanelSharedProps>, AssistantChatPanelSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const AssistantChatPanel: React.ForwardRefExoticComponent<AssistantChatPanelProps & React.RefAttributes<View>>;
export interface FloatingAssistantLauncherProps extends Omit<ViewProps, keyof FloatingAssistantLauncherSharedProps>, FloatingAssistantLauncherSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const FloatingAssistantLauncher: React.ForwardRefExoticComponent<FloatingAssistantLauncherProps & React.RefAttributes<View>>;
export interface CadenceBarChartProps extends Omit<ViewProps, keyof CadenceBarChartSharedProps>, CadenceBarChartSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const CadenceBarChart: React.ForwardRefExoticComponent<CadenceBarChartProps & React.RefAttributes<View>>;
export interface MarqueeProps extends Omit<ViewProps, keyof MarqueeSharedProps>, MarqueeSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const Marquee: React.ForwardRefExoticComponent<MarqueeProps & React.RefAttributes<View>>;
export interface KPIStatGridProps extends Omit<ViewProps, keyof KPIStatGridSharedProps>, KPIStatGridSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const KPIStatGrid: React.ForwardRefExoticComponent<KPIStatGridProps & React.RefAttributes<View>>;
export interface TimelineRowProps extends Omit<ViewProps, keyof TimelineRowSharedProps>, TimelineRowSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const TimelineRow: React.ForwardRefExoticComponent<TimelineRowProps & React.RefAttributes<View>>;
export interface ExperienceTimelineProps extends Omit<ViewProps, keyof ExperienceTimelineSharedProps>, ExperienceTimelineSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const ExperienceTimeline: React.ForwardRefExoticComponent<ExperienceTimelineProps & React.RefAttributes<View>>;
export interface ProjectCaseRowProps extends Omit<ViewProps, keyof ProjectCaseRowSharedProps>, ProjectCaseRowSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const ProjectCaseRow: React.ForwardRefExoticComponent<ProjectCaseRowProps & React.RefAttributes<View>>;
export interface ContactSplitFormProps extends Omit<ViewProps, keyof ContactSplitFormSharedProps>, ContactSplitFormSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const ContactSplitForm: React.ForwardRefExoticComponent<ContactSplitFormProps & React.RefAttributes<View>>;
export interface DungeonHUDShellProps extends Omit<ViewProps, keyof DungeonHUDShellSharedProps>, DungeonHUDShellSharedProps {
    readonly style?: StyleProp<ViewStyle>;
}
export declare const DungeonHUDShell: React.ForwardRefExoticComponent<DungeonHUDShellProps & React.RefAttributes<View>>;
//# sourceMappingURL=synthex.native.d.ts.map