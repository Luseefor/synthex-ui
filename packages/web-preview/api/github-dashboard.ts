const REPO_SLUG = process.env.GITHUB_REPO ?? "Luseefor/synthex-ui";
const GITHUB_API = `https://api.github.com/repos/${REPO_SLUG}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "synthex-ui-preview",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };
}

function formatRelativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const hour = 1000 * 60 * 60;
  const day = hour * 24;
  if (diff < day) return `${Math.max(1, Math.round(diff / hour))} hours ago`;
  return `${Math.max(1, Math.round(diff / day))} days ago`;
}

function buildChartData(commits: Array<{ commit: { author: { date: string } } }>) {
  const now = new Date();
  const totals = new Array<number>(12).fill(0);
  for (const item of commits) {
    const date = new Date(item.commit.author.date);
    if (date.getUTCFullYear() === now.getUTCFullYear()) totals[date.getUTCMonth()] += 1;
  }
  const peak = Math.max(...totals, 1);
  return MONTHS.map((month, index) => ({ month, value: Math.round((totals[index] / peak) * 100) }));
}

export default async function handler(_req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }) {
  const headers = githubHeaders();
  const [repoRes, commitsRes, releaseRes] = await Promise.all([
    fetch(GITHUB_API, { headers }),
    fetch(`${GITHUB_API}/commits?per_page=100`, { headers }),
    fetch(`${GITHUB_API}/releases/latest`, { headers }),
  ]);

  if (!repoRes.ok || !commitsRes.ok) {
    return res.status(502).json({ message: `GitHub data unavailable for ${REPO_SLUG}. Set GITHUB_REPO/GITHUB_TOKEN in Vercel.` });
  }

  const repo = await repoRes.json();
  const commits = await commitsRes.json();
  const now = Date.now();
  const recent = commits.filter((item: { commit: { author: { date: string } } }) => now - new Date(item.commit.author.date).getTime() <= 1000 * 60 * 60 * 24 * 30).length;
  const previous = commits.filter((item: { commit: { author: { date: string } } }) => {
    const age = now - new Date(item.commit.author.date).getTime();
    return age > 1000 * 60 * 60 * 24 * 30 && age <= 1000 * 60 * 60 * 24 * 60;
  }).length;
  const trendDelta = recent - previous;
  const release = releaseRes.ok ? await releaseRes.json() : null;

  return res.status(200).json({
    metrics: [
      { label: "GitHub Stars", value: repo.stargazers_count, icon: "★", description: "Public repository stars" },
      { label: "Forks", value: repo.forks_count, icon: "⑂", description: "Repository forks" },
      { label: "Open Issues", value: repo.open_issues_count, icon: "◌", description: "Tracked on GitHub" },
      {
        label: "Recent Commits",
        value: recent,
        icon: "⎇",
        description: "last 30 days",
        ...(trendDelta ? { trend: { value: `${trendDelta > 0 ? "+" : ""}${trendDelta}`, type: trendDelta > 0 ? "positive" : "negative" } } : {}),
      },
    ],
    updates: commits.slice(0, 5).map((item: { commit: { message: string; author: { date: string; name: string } }; author?: { login?: string } }) => ({
      title: item.commit.message.split("\n")[0],
      user: item.author?.login ?? item.commit.author.name,
      time: formatRelativeTime(item.commit.author.date),
      initials: (item.author?.login ?? item.commit.author.name).slice(0, 2).toUpperCase(),
    })),
    chartData: buildChartData(commits),
    chartTitle: "Commit Activity",
    chartDescription: "Monthly GitHub commits over the current year.",
    latestReleaseLabel: release?.tag_name ?? repo.default_branch,
    repositoryUrl: repo.html_url,
  });
}
