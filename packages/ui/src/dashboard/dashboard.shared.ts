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

export interface DashboardViewProps {
    readonly metrics: readonly DashboardMetric[];
    readonly updates: readonly DashboardUpdate[];
    readonly chartData: readonly DashboardChartData[];
    readonly searchValue: string;
    readonly onSearchChange: (value: string) => void;
    readonly onDocumentationClick?: () => void;
    readonly onRepositoryClick?: () => void;
    readonly onUpdateClick?: (update: DashboardUpdate) => void;
}
