import { useMemo, useState } from "react";
import { DashboardView } from "synthex-ui/components";
import { GALLERY_COMPONENTS } from "../data";
import type { RoutePath } from "../app/nav";

interface DashboardPageProps {
  readonly onNavigate: (to: RoutePath) => void;
}

const chartData = [
  { month: "Jan", value: 40 }, { month: "Feb", value: 30 }, { month: "Mar", value: 80 },
  { month: "Apr", value: 40 }, { month: "May", value: 60 }, { month: "Jun", value: 20 },
  { month: "Jul", value: 50 }, { month: "Aug", value: 90 }, { month: "Sep", value: 60 },
  { month: "Oct", value: 70 }, { month: "Nov", value: 85 }, { month: "Dec", value: 100 },
];

const metrics = [
  { label: "Total Components", value: 51, icon: "🧩", description: "in the latest release", trend: { value: "+3", type: "positive" as const } },
  { label: "Packages", value: 5, icon: "📦", description: "Managed by Bun workspaces" },
  { label: "Core Hooks", value: 11, icon: "🪝", description: "Cross-platform abstractions" },
  { label: "Total Commits", value: 85, icon: "🔥", description: "this week", trend: { value: "+12", type: "positive" as const } },
];

const updates = [
  { title: "feat: apply flagship preview polish", user: "Luseefor", time: "10 hours ago", initials: "LF" },
  { title: "feat: expand builder component coverage", user: "Luseefor", time: "10 hours ago", initials: "LF" },
  { title: "fix: stabilize workbench interactions", user: "Luseefor", time: "12 hours ago", initials: "LF" },
  { title: "style: simplify preview navigation", user: "Luseefor", time: "15 hours ago", initials: "LF" },
];

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [searchValue, setSearchValue] = useState("");
  const term = searchValue.toLowerCase();

  const filteredMetrics = useMemo(
    () => metrics.filter((item) => item.label.toLowerCase().includes(term)),
    [term],
  );
  const filteredUpdates = useMemo(
    () => updates.filter((item) => `${item.title} ${item.user}`.toLowerCase().includes(term)),
    [term],
  );
  const filteredComponents = useMemo(
    () => GALLERY_COMPONENTS.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(term)),
    [term],
  );

  return (
    <DashboardView
      metrics={searchValue ? filteredMetrics : metrics}
      chartData={chartData}
      updates={searchValue ? filteredUpdates : updates}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      componentResults={searchValue ? filteredComponents : []}
      onDocumentationClick={() => onNavigate("/docs")}
      onRepositoryClick={() => window.open("https://github.com/Luseefor/synthex-ui", "_blank")}
    />
  );
}
