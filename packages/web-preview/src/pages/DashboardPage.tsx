import { useEffect, useMemo, useState } from "react";
import { DashboardView } from "synthex-ui/components";
import { GALLERY_COMPONENTS } from "../data";
import { FALLBACK_DASHBOARD } from "../dashboardData";
import { fetchGitHubDashboard } from "../githubDashboard";
import type { RoutePath } from "../app/nav";

interface DashboardPageProps {
  readonly onNavigate: (to: RoutePath) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [searchValue, setSearchValue] = useState("");
  const [dashboard, setDashboard] = useState(FALLBACK_DASHBOARD);
  const term = searchValue.toLowerCase();

  useEffect(() => {
    const controller = new AbortController();

    fetchGitHubDashboard(controller.signal)
      .then(setDashboard)
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  const filteredMetrics = useMemo(
    () => dashboard.metrics.filter((item) => item.label.toLowerCase().includes(term)),
    [dashboard.metrics, term],
  );
  const filteredUpdates = useMemo(
    () => dashboard.updates.filter((item) => `${item.title} ${item.user}`.toLowerCase().includes(term)),
    [dashboard.updates, term],
  );
  const filteredComponents = useMemo(
    () => GALLERY_COMPONENTS.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(term)),
    [term],
  );

  return (
    <DashboardView
      metrics={searchValue ? filteredMetrics : dashboard.metrics}
      chartData={dashboard.chartData}
      chartTitle={dashboard.chartTitle}
      chartDescription={dashboard.chartDescription}
      latestReleaseLabel={dashboard.latestReleaseLabel}
      updates={searchValue ? filteredUpdates : dashboard.updates}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      componentResults={searchValue ? filteredComponents : []}
      showBranding={false}
      onDocumentationClick={() => onNavigate("/docs")}
      onRepositoryClick={() => window.open(dashboard.repositoryUrl, "_blank")}
    />
  );
}
