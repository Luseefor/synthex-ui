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
    title: "Web styling and Overview",
    body:
      "Compact dashboard metrics, responsive charts, semantic borders and action colors, selected combobox labels before opening, and command lists that keep the page in place.",
  },
  {
    title: "Own and update components",
    body:
      "Vite, Next and Expo starters, framework-aware setup, platform-specific source copies, and three-way updates with recorded originals, backups and conflict protection.",
  },
  {
    title: "v1.2 milestone versions",
    body:
      "The release targets UI 2.0.0 and CLI, core and React web adapter 1.2.0. Native Carousel now exposes a native pager API rather than Embla types. Native device and screen-reader validation remains pending.",
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
