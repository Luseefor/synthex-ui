import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "synthex-ui/components";
import uiPackage from "../../../../ui/package.json";

const RELEASE_NOTES = [
  {
    title: "Theme popover stability",
    body:
      "Reworked switcher placement logic for web and native so the theme panel opens with deterministic anchoring and no initial jump. The panel now measures before reveal and picks above or below based on available viewport space.",
  },
  {
    title: "Cleaner theme customization UI",
    body:
      "Updated appearance and accent controls with clearer active states and reduced visual clutter while preserving the existing trigger style. This keeps the control readable in compact sidebar and full panel layouts.",
  },
  {
    title: "Workspace release alignment",
    body:
      "All publishable packages are now aligned to v1.1.0 with synchronized internal dependency ranges across core, UI, React web adapter, CLI, and web preview surfaces.",
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
        <div className="preview-release-scroll">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
