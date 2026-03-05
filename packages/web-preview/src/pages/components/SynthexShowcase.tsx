import {
  AssistantChatPanel,
  Button,
  CadenceBarChart,
  ContactSplitForm,
  DungeonHUDShell,
  ExperienceTimeline,
  FloatingAssistantLauncher,
  KPIStatGrid,
  Marquee,
  ProjectCaseRow,
} from "synthex-ui/components";
import { useMobile } from "synthex-ui/hooks";
import { ShowcaseSection } from "./ShowcaseSection";

const marqueeItems = [
  { id: "react", label: "React", meta: "Web" },
  { id: "native", label: "React Native", meta: "Native" },
  { id: "tokens", label: "Token Theming", meta: "Design" },
  { id: "motion", label: "Motion Presets", meta: "UX" },
  { id: "layout", label: "Adaptive Layout", meta: "Responsive" },
];

const cadenceData = [
  { label: "D-14", value: 5 },
  { label: "D-13", value: 7 },
  { label: "D-12", value: 6 },
  { label: "D-11", value: 9 },
  { label: "D-10", value: 8 },
  { label: "D-09", value: 11 },
  { label: "D-08", value: 10 },
  { label: "D-07", value: 13 },
  { label: "D-06", value: 12 },
  { label: "D-05", value: 14 },
  { label: "D-04", value: 12 },
  { label: "D-03", value: 15 },
  { label: "D-02", value: 13 },
  { label: "D-01", value: 16 },
];

const timelineEntries = [
  {
    id: "studio",
    date: "2024 - Present",
    title: "Lead Product Engineer",
    organization: "Synthex Studio",
    summary: "Scaled shared design primitives across web preview and native shells.",
    tags: ["Design Systems", "Animation", "Tooling"],
  },
  {
    id: "platform",
    date: "2022 - 2024",
    title: "Platform Engineer",
    organization: "Luseefor",
    summary: "Built package pipelines and reusable component docs infrastructure.",
    tags: ["CI/CD", "Package Design", "DX"],
  },
];

const chatMessages = [
  {
    id: "m1",
    role: "assistant" as const,
    author: "Synthex Assist",
    content: "Migration pass complete for primitives and tokens.",
    meta: "2m ago",
  },
  {
    id: "m2",
    role: "user" as const,
    author: "You",
    content: "Add timeline and marquee motion polish in web preview.",
    meta: "just now",
  },
];

export function SynthexShowcase() {
  const isMobile = useMobile();

  return (
    <ShowcaseSection
      title="Synthex migration components"
      description="New migration surfaces with animation: assistant patterns, KPI and cadence modules, timeline rows, project editorial rows, contact split shell, and dungeon HUD shell."
      includes={[
        "AssistantChatPanel",
        "FloatingAssistantLauncher",
        "CadenceBarChart",
        "Marquee",
        "KPIStatGrid",
        "ExperienceTimeline",
        "ProjectCaseRow",
        "ContactSplitForm",
        "DungeonHUDShell",
      ]}
    >
      <div className="preview-section-stack">
        <Marquee items={marqueeItems} speed="normal" />
        <div className="preview-grid-2">
          <KPIStatGrid
            columns={2}
            stats={[
              { id: "throughput", label: "Throughput", value: "214", change: "+12%", tone: "positive" },
              { id: "latency", label: "Latency", value: "92ms", detail: "p95", tone: "accent" },
              { id: "quality", label: "Quality", value: "99.4%", change: "+0.6%", tone: "default" },
              { id: "risk", label: "Risk", value: "Low", detail: "4 open", tone: "warning" },
            ]}
          />
          <CadenceBarChart data={cadenceData} />
        </div>
        <ExperienceTimeline
          title="Experience timeline"
          description="Timeline rows with progressive reveal and interaction-friendly spacing."
          entries={timelineEntries}
        />
        <div className="preview-pane preview-section-stack">
          <ProjectCaseRow
            index={1}
            category="Platform"
            title="Unified cross-surface motion language"
            summary="Mapped animation timing and softness tokens to web and native components for consistent feel."
            metrics={[
              { label: "Coverage", value: "10/10 components" },
              { label: "Regression", value: "0 failed tests" },
            ]}
            href="#project-case-1"
          />
          <ProjectCaseRow
            index={2}
            category="Preview"
            title="Responsive docs migration view"
            summary="Resolved mobile clipping and added dedicated showcases for missing migration components."
            metrics={[
              { label: "Mobile issues", value: "Resolved" },
              { label: "Web visibility", value: "Added" },
            ]}
            href="#project-case-2"
          />
        </div>
        <ContactSplitForm
          title="Contact split form"
          description="Channels stay visible while users submit requests from the form shell."
          channels={[
            { id: "mail", label: "Email", value: "hello@synthex.dev", href: "mailto:hello@synthex.dev" },
            { id: "discord", label: "Discord", value: "synthex-ui", meta: "Community support" },
            { id: "response", label: "Response SLA", value: "< 24h", meta: "Business days" },
          ]}
          onSubmit={() => undefined}
        />
        <div className="preview-synthex-chat-wrap">
          <AssistantChatPanel
            className="min-h-[30rem]"
            title="Assistant chat panel"
            description="Structured chat shell for release and migration workflows."
            messages={chatMessages}
            onSubmit={() => undefined}
          />
          <div className="preview-synthex-launcher">
            <FloatingAssistantLauncher
              className="!static !right-auto !bottom-auto !z-0"
              title="Launcher"
              description="Quick access dock with animated pulse states."
              badge="new"
              defaultOpen={!isMobile}
            >
              <div className="preview-section-stack">
                <span className="text-sm text-[color:var(--sx-color-foreground-muted)]">
                  Resume your last assistant workflow.
                </span>
                <div className="preview-inline-row">
                  <Button size="sm">Open workspace</Button>
                  <Button size="sm" variant="outline">
                    Ask assistant
                  </Button>
                </div>
              </div>
            </FloatingAssistantLauncher>
          </div>
        </div>
        <DungeonHUDShell
          title="Dungeon HUD shell"
          mission="Stabilize migration quality gates and keep active release metrics visible."
          metrics={[
            { id: "nodes", label: "Active nodes", value: "24" },
            { id: "latency", label: "Command latency", value: "92ms" },
            { id: "alerts", label: "Open alerts", value: "3" },
          ]}
          actions={<Button size="sm">Run checks</Button>}
          sidebar={
            <div className="preview-section-stack">
              <span className="text-xs uppercase tracking-[0.14em] text-[color:var(--sx-color-foreground-muted)]">
                Sidebar
              </span>
              <span className="text-sm text-[color:var(--sx-color-foreground)]">Queued tasks, mission logs, and shortcuts.</span>
            </div>
          }
          footer="Latest mission checkpoint synced 4 minutes ago."
        >
          <div className="preview-section-stack">
            <span className="text-sm text-[color:var(--sx-color-foreground)]">Main mission canvas</span>
            <span className="text-sm text-[color:var(--sx-color-foreground-muted)]">
              Embed encounter maps, trace streams, or any interactive HUD content here.
            </span>
          </div>
        </DungeonHUDShell>
      </div>
    </ShowcaseSection>
  );
}
