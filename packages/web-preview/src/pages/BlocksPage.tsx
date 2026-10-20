import { AssistantChatPanel, Badge, ContactSplitForm, H2, KPIStatGrid, Marquee, Muted, TimelineRow } from "synthex-ui/components";
import { ShowcaseSection } from "./components/ShowcaseSection";

export function BlocksPage() {
  return (
    <section className="preview-page-stack">
      <div className="preview-page-heading">
        <Badge variant="outline">Blocks</Badge>
        <H2>Blocks</H2>
        <Muted>Pre-composed patterns built from synthex-ui primitives.</Muted>
      </div>
      <ShowcaseSection
          title="Assistant chat"
          description="Static preview of the assistant pattern."
          includes={["AssistantChatPanel"]}
        >
          <AssistantChatPanel
            title="Copilot"
            description="Static preview of the assistant pattern."
            messages={[
              { id: "a1", role: "assistant", content: "Drafting an onboarding summary." },
              { id: "u1", role: "user", content: "Include migration status." },
            ]}
          />
        </ShowcaseSection>
        <ShowcaseSection
          title="KPI stats"
          description="Metric cards with tone variants."
          includes={["KPIStatGrid"]}
        >
          <KPIStatGrid
            columns={3}
            stats={[
              { id: "mrr", label: "MRR", value: "$48k", change: "+12%" },
              { id: "users", label: "Active users", value: "18.2k", detail: "14-day" },
              { id: "uptime", label: "Uptime", value: "99.99%", tone: "positive" },
            ]}
          />
        </ShowcaseSection>
        <ShowcaseSection
          title="Marquee"
          description="Scrolling item strip with pause on hover."
          includes={["Marquee"]}
        >
          <Marquee
            items={[
              { id: "one", label: "Research ops", meta: "workflow" },
              { id: "two", label: "Prompt systems", meta: "skill" },
              { id: "three", label: "Design tokens", meta: "figma" },
            ]}
          />
        </ShowcaseSection>
        <ShowcaseSection
          title="Contact"
          description="Static preview of the contact split pattern."
          includes={["ContactSplitForm"]}
        >
          <ContactSplitForm
            title="Contact sales"
            description="Static preview of the contact split pattern."
            channels={[
              { id: "email", label: "Email", value: "hello@example.com", meta: "Replies in 1 day" },
              { id: "office", label: "Office", value: "San Francisco, CA" },
            ]}
          />
        </ShowcaseSection>
        <ShowcaseSection
          title="Timeline"
          description="Static preview of the timeline row pattern."
          includes={["TimelineRow", "ExperienceTimeline"]}
        >
          <TimelineRow
            id="role-1"
            date="2024 — Present"
            title="Senior Engineer"
            organization="Example Co"
            summary="Static preview of the timeline row pattern."
            tags={["React", "Design systems"]}
          />
        </ShowcaseSection>
      </section>
    );
}
