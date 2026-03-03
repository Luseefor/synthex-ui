export interface DashboardMetric {
  readonly label: string;
  readonly value: string | number;
  readonly icon: string;
  readonly description?: string;
  readonly trend?: {
    readonly value: string;
    readonly type: "positive" | "negative" | "neutral";
  };
}

export interface DashboardUpdate {
  readonly title: string;
  readonly user: string;
  readonly time: string;
  readonly initials: string;
}

export interface DashboardChartData {
  readonly month: string;
  readonly value: number;
}

export interface DashboardSnapshot {
  readonly metrics: readonly DashboardMetric[];
  readonly updates: readonly DashboardUpdate[];
  readonly chartData: readonly DashboardChartData[];
  readonly chartTitle: string;
  readonly chartDescription: string;
  readonly latestReleaseLabel: string;
  readonly repositoryUrl: string;
}

export const FALLBACK_DASHBOARD: DashboardSnapshot = {
  metrics: [
    { label: "GitHub Stars", value: "…", icon: "★", description: "Loading repository data" },
    { label: "Forks", value: "…", icon: "⑂", description: "Loading repository data" },
    { label: "Open Issues", value: "…", icon: "◌", description: "Loading repository data" },
    { label: "Recent Commits", value: "…", icon: "⎇", description: "Loading repository data" },
  ],
  updates: [
    { title: "Loading GitHub activity…", user: "github", time: "now", initials: "GH" },
  ],
  chartData: [
    { month: "Jan", value: 0 }, { month: "Feb", value: 0 }, { month: "Mar", value: 0 },
    { month: "Apr", value: 0 }, { month: "May", value: 0 }, { month: "Jun", value: 0 },
    { month: "Jul", value: 0 }, { month: "Aug", value: 0 }, { month: "Sep", value: 0 },
    { month: "Oct", value: 0 }, { month: "Nov", value: 0 }, { month: "Dec", value: 0 },
  ],
  chartTitle: "Repository Activity",
  chartDescription: "Monthly GitHub commits over the current year.",
  latestReleaseLabel: "GitHub",
  repositoryUrl: "https://github.com/Luseefor/synthex-ui",
};
