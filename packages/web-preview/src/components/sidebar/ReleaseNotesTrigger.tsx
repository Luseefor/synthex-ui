import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
} from "synthex-ui/components";
import uiPackage from "../../../../ui/package.json";

const RELEASE_NOTES = [
  {
    title: "Synthex migration patterns",
    body:
      "Added AssistantChatPanel, FloatingAssistantLauncher, CadenceBarChart, Marquee, KPIStatGrid, TimelineRow, ExperienceTimeline, ProjectCaseRow, ContactSplitForm, and DungeonHUDShell to the public synthex-ui surface.",
  },
  {
    title: "Cross-platform parity",
    body:
      "The new patterns ship with shared contracts plus dedicated web and native implementations, so design-system consumers can use the same API across preview and app shells.",
  },
  {
    title: "Package validation",
    body:
      "Release coverage now includes export checks, render tests for the new patterns, build emit verification, and npm pack/publish dry-run validation for synthex-ui@1.0.1.",
  },
] as const;

interface ReleaseNotesTriggerProps {
  readonly className?: string;
  readonly compact?: boolean;
}

export function ReleaseNotesTrigger({
  className,
  compact = false,
}: ReleaseNotesTriggerProps) {
  const versionLabel = `v${uiPackage.version}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={[
            "preview-release-trigger",
            compact ? "preview-release-trigger-compact" : "",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span>{versionLabel}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="preview-release-dialog">
        <DialogHeader>
          <div className="preview-release-heading">
            <Badge variant="outline">{versionLabel}</Badge>
            <DialogTitle>Release notes</DialogTitle>
          </div>
          <DialogDescription>
            Latest updates for the Synthex UI package exposed in this web preview.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="preview-release-scroll">
          <div className="preview-release-list">
            {RELEASE_NOTES.map((item, index) => (
              <article key={item.title} className="preview-release-card">
                <div className="preview-release-card-meta">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{versionLabel}</span>
                </div>
                <div className="preview-release-card-title">{item.title}</div>
                <p className="preview-release-card-body">{item.body}</p>
              </article>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
