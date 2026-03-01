import type { PanelNode } from "@synthex/core";

export interface PreviewPanelProps {
  readonly panel: PanelNode;
  readonly isSelected: boolean;
}

interface PanelBlueprint {
  readonly badge: string;
  readonly kicker: string;
}

const panelBlueprints: Record<string, PanelBlueprint> = {
  navigator: { kicker: "Workspace", badge: "Tree" },
  search: { kicker: "Discovery", badge: "Search" },
  document: { kicker: "Editor", badge: "Draft" },
  preview: { kicker: "Preview", badge: "Live" },
  inspector: { kicker: "Context", badge: "Fields" },
  outline: { kicker: "Structure", badge: "Outline" },
  console: { kicker: "Runtime", badge: "Logs" },
  activity: { kicker: "Session", badge: "Events" },
  notes: { kicker: "Notes", badge: "Scratch" },
};

export function PreviewPanel({ panel, isSelected }: PreviewPanelProps) {
  const blueprint = panelBlueprints[panel.panelType] ?? { kicker: "Panel", badge: "Custom" };

  return (
    <div
      className={`workbench-panel workbench-panel-${panel.panelType} ${
        isSelected ? "workbench-panel-selected" : ""
      }`}
    >
      <div className="workbench-panel-header">
        <div>
          <div className="workbench-panel-kicker">{blueprint.kicker}</div>
          <h4>{panel.title ?? panel.panelType}</h4>
        </div>
        <div className="workbench-panel-pill">{blueprint.badge}</div>
      </div>

      <div className="workbench-panel-body">{renderPanelBody(panel)}</div>
    </div>
  );
}

function renderPanelBody(panel: PanelNode) {
  switch (panel.panelType) {
    case "navigator":
      return (
        <div className="workbench-stack-surface">
          <div className="workbench-section-label">Project</div>
          <div className="workbench-tree">
            <div className="workbench-tree-group">
              <div className="workbench-tree-heading">App</div>
              <button type="button" className="workbench-tree-item workbench-tree-item-active">
                dashboard.tsx
              </button>
              <button type="button" className="workbench-tree-item">
                layout.ts
              </button>
              <button type="button" className="workbench-tree-item">
                theme.ts
              </button>
            </div>
            <div className="workbench-tree-group">
              <div className="workbench-tree-heading">Data</div>
              <button type="button" className="workbench-tree-item">
                schema.json
              </button>
              <button type="button" className="workbench-tree-item">
                metrics.csv
              </button>
            </div>
          </div>
        </div>
      );

    case "search":
      return (
        <div className="workbench-stack-surface">
          <div className="workbench-search-chip">Filter: surface token</div>
          <div className="workbench-results-list">
            <div className="workbench-result-row">
              <strong>ThemeProvider</strong>
              <span>packages/ui/src/theme/index.web.ts</span>
            </div>
            <div className="workbench-result-row">
              <strong>createTheme</strong>
              <span>packages/ui/src/_shared/theme/createTheme.ts</span>
            </div>
            <div className="workbench-result-row">
              <strong>surfaceRaised</strong>
              <span>packages/ui/src/_shared/tokens/colors.ts</span>
            </div>
          </div>
        </div>
      );

    case "document":
      return (
        <div className="workbench-document-surface">
          <div className="workbench-document-toolbar">
            <span>Overview draft</span>
            <span>12 sections</span>
            <span>Synced</span>
          </div>
          <div className="workbench-document-grid">
            <div className="workbench-document-card">
              <div className="workbench-document-card-title">Header</div>
              <p>Clear hierarchy, restrained surfaces, and strong spacing rhythm.</p>
            </div>
            <div className="workbench-document-card">
              <div className="workbench-document-card-title">Content</div>
              <p>Single-column primary flow with side context, not a crowded dashboard.</p>
            </div>
            <div className="workbench-document-card workbench-document-card-wide">
              <div className="workbench-document-card-title">Notes</div>
              <p>General-purpose workspace panels remain useful across admin, docs, data, and engineering apps.</p>
            </div>
          </div>
        </div>
      );

    case "preview":
      return (
        <div className="workbench-stack-surface">
          <div className="workbench-metric-row">
            <div className="workbench-mini-stat">
              <span>Views</span>
              <strong>08</strong>
            </div>
            <div className="workbench-mini-stat">
              <span>Errors</span>
              <strong>00</strong>
            </div>
            <div className="workbench-mini-stat">
              <span>Drafts</span>
              <strong>03</strong>
            </div>
          </div>
          <div className="workbench-preview-list">
            <div>Landing route updated</div>
            <div>Accent preset stable in dark mode</div>
            <div>Sidebar scroll isolated from content</div>
          </div>
        </div>
      );

    case "inspector":
      return (
        <div className="workbench-inspector">
          <section className="workbench-inspector-section">
            <div className="workbench-section-label">Selection</div>
            <dl className="workbench-property-list">
              <div>
                <dt>Component</dt>
                <dd>Page shell</dd>
              </div>
              <div>
                <dt>Density</dt>
                <dd>Comfortable</dd>
              </div>
              <div>
                <dt>Theme</dt>
                <dd>Dark</dd>
              </div>
            </dl>
          </section>
          <section className="workbench-inspector-section">
            <div className="workbench-section-label">Tokens</div>
            <dl className="workbench-property-list">
              <div>
                <dt>Surface</dt>
                <dd>surfaceRaised</dd>
              </div>
              <div>
                <dt>Border</dt>
                <dd>borderStrong</dd>
              </div>
            </dl>
          </section>
        </div>
      );

    case "outline":
      return (
        <ol className="workbench-outline-list">
          <li>Overview</li>
          <li>Package model</li>
          <li>Support matrix</li>
          <li>Theme tokens</li>
          <li>Playground</li>
        </ol>
      );

    case "console":
      return (
        <div className="workbench-console">
          <div>[engine] layout reducer ready</div>
          <div>[preview] route switched to /playground</div>
          <div>[theme] dark graphite palette active</div>
          <div>[docs] renderer snapshot updated</div>
        </div>
      );

    case "activity":
      return (
        <div className="workbench-activity-list">
          <div className="workbench-activity-item">
            <strong>09:24</strong>
            <span>Split main workspace into editor and context columns.</span>
          </div>
          <div className="workbench-activity-item">
            <strong>09:26</strong>
            <span>Opened preview metrics for the current page shell.</span>
          </div>
          <div className="workbench-activity-item">
            <strong>09:31</strong>
            <span>Added a note surface for scratch content.</span>
          </div>
        </div>
      );

    case "notes":
      return (
        <div className="workbench-note-surface">
          <p>Keep the workbench generic enough to validate layout behavior without hardcoding one product domain.</p>
          <ul>
            <li>Clear split directions</li>
            <li>Predictable tab hosts</li>
            <li>Readable state snapshot</li>
          </ul>
        </div>
      );

    default:
      return (
        <div className="workbench-note-surface">
          <p>Inserted panel</p>
          <ul>
            <li>Use this surface to validate reducer mutations.</li>
            <li>Split, add, undo, redo, and inspect the resulting tree.</li>
          </ul>
        </div>
      );
  }
}
