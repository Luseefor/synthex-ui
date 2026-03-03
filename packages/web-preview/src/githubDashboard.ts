import type { DashboardSnapshot } from "./dashboardData";

export async function fetchGitHubDashboard(signal?: AbortSignal): Promise<DashboardSnapshot> {
  const response = await fetch("/api/github-dashboard", { signal });

  if (!response.ok) {
    throw new Error(`GitHub dashboard request failed with ${response.status}`);
  }

  return response.json() as Promise<DashboardSnapshot>;
}
