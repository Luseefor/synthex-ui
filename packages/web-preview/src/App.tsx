import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import {
  createLayoutEngine,
  findNodeById,
  serializeLayout,
  traverseLayout,
  type LayoutAction,
  type LayoutDirection,
  type LayoutEngine,
  type LayoutNode,
  type PanelNode,
} from "@synthex/core";
import { LayoutRenderer, useSynthex } from "@synthex/react-web";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  H1,
  H2,
  H3,
  Input,
  Label,
  Lead,
  Muted,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Small,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@synthex/ui/components";
import {
  AddIcon,
  GridIcon,
  Icon,
  iconNames,
  RedoIcon,
  SearchIcon,
  SettingsIcon,
  UndoIcon,
} from "@synthex/ui/icons";
import {
  ThemeProvider,
  accentPresets,
  useTheme,
  type AccentPresetName,
  type SynthexTheme,
} from "@synthex/ui/theme";
import {
  useControllableState,
  useDisclosure,
  usePlatformValue,
  useReducedMotion,
} from "@synthex/ui/hooks";
import { PreviewPanel } from "./components/PreviewPanel";
import { Toolbar } from "./components/Toolbar";
import { previewLayout } from "./previewLayout";

type SectionId =
  | "overview"
  | "packages"
  | "matrix"
  | "exports"
  | "components"
  | "theme"
  | "getting-started"
  | "playground"
  | "roadmap";

type RoutePath =
  | "/"
  | "/installation"
  | "/components"
  | "/theme"
  | "/engine"
  | "/playground";

interface NavItem {
  readonly description: string;
  readonly label: string;
  readonly to: RoutePath;
}

interface SupportRow {
  readonly area: string;
  readonly native: "Supported" | "Evolving" | "Experimental" | "Not applicable";
  readonly notes: string;
  readonly web: "Supported" | "Evolving" | "Experimental" | "Not applicable";
}

interface ExportItem {
  readonly description: string;
  readonly examples: readonly string[];
  readonly path: string;
}

interface PackageCardItem {
  readonly description: string;
  readonly title: string;
}

const navItems: readonly NavItem[] = [
  { to: "/", label: "Overview", description: "Positioning, package model, and roadmap." },
  { to: "/installation", label: "Installation", description: "Install, build, and first integration." },
  { to: "/components", label: "Components", description: "Live previews for controls and interaction patterns." },
  { to: "/theme", label: "Theme", description: "Semantic tokens, accents, and dark mode behavior." },
  { to: "/engine", label: "Engine", description: "Package boundaries, support matrix, and public exports." },
  { to: "/playground", label: "Playground", description: "Docking, reducer flow, and workbench state." },
] as const;

const supportRows: readonly SupportRow[] = [
  {
    area: "@synthex/ui root",
    web: "Supported",
    native: "Supported",
    notes: "Platform-specific entry points expose a shared consumer API.",
  },
  {
    area: "@synthex/ui/components",
    web: "Supported",
    native: "Supported",
    notes: "Core controls ship from a shared variant contract with web and native implementations.",
  },
  {
    area: "@synthex/ui/primitives",
    web: "Supported",
    native: "Supported",
    notes: "Layout primitives, surfaces, and scroll primitives are available on both targets.",
  },
  {
    area: "@synthex/ui/theme",
    web: "Supported",
    native: "Supported",
    notes: "Semantic tokens drive CSS variables on web and style-safe values on native.",
  },
  {
    area: "@synthex/ui/icons",
    web: "Supported",
    native: "Supported",
    notes: "Curated named icons wrap the Lucide adapters behind a stable library contract.",
  },
  {
    area: "@synthex/react-web",
    web: "Supported",
    native: "Not applicable",
    notes: "Web-only dockable layout renderer backed by @synthex/core.",
  },
  {
    area: "@synthex/core",
    web: "Supported",
    native: "Supported",
    notes: "Pure TypeScript engine with deterministic reducers, commands, validation, and serialization.",
  },
  {
    area: "@synthex/cli",
    web: "Not applicable",
    native: "Not applicable",
    notes: "Bun-based operational tooling for layout files, history, and scripting.",
  },
] as const;

const exportItems: readonly ExportItem[] = [
  {
    path: "@synthex/ui/components",
    description: "High-usage controls such as Button, Card, Input, Tabs, Badge, Separator, and Typography helpers.",
    examples: ["Button", "Card", "Input", "Tabs"],
  },
  {
    path: "@synthex/ui/primitives",
    description: "Cross-platform structural primitives for layout, spacing, surfaces, and scrollable regions.",
    examples: ["Box", "Stack", "Inline", "Grid"],
  },
  {
    path: "@synthex/ui/layout",
    description: "Generic app-shell helpers that stay separate from the engineering docking system.",
    examples: ["AppShell", "Pane", "PanelFrame", "Section"],
  },
  {
    path: "@synthex/ui/hooks",
    description: "Cross-platform helpers for controllable state, disclosure, platform branching, and motion preferences.",
    examples: ["useControllableState", "useDisclosure", "usePlatformValue"],
  },
  {
    path: "@synthex/ui/icons",
    description: "Named icon contract for product chrome so app teams do not import the vendor icon package directly.",
    examples: ["Icon", "AddIcon", "UndoIcon", "RedoIcon"],
  },
  {
    path: "@synthex/ui/theme",
    description: "Theme provider, token presets, theme creation utilities, and typed theme contracts.",
    examples: ["ThemeProvider", "createTheme", "lightTheme", "darkTheme"],
  },
  {
    path: "@synthex/ui/styles.css",
    description: "Base web stylesheet with reset, token variables, and component-safe defaults.",
    examples: ["styles.css"],
  },
  {
    path: "@synthex/react-web",
    description: "Dockable layout renderer, split view, tab view, and external-store hook for the web workbench layer.",
    examples: ["LayoutRenderer", "SplitView", "TabView", "useSynthex"],
  },
] as const;

const packageCards: readonly PackageCardItem[] = [
  {
    title: "@synthex/ui",
    description: "Main consumer-facing design-system package with root exports and subpath entry points.",
  },
  {
    title: "@synthex/core",
    description: "Framework-agnostic layout engine with commands, serialization, validation, and store abstractions.",
  },
  {
    title: "@synthex/react-web",
    description: "Thin React DOM adapter for split layouts, tabs, node selection, and workbench rendering.",
  },
  {
    title: "@synthex/web-preview",
    description: "Vite-powered documentation and verification surface used to validate the public package API.",
  },
] as const;

const roadmapItems: readonly string[] = [
  "Expand component coverage without weakening the shared cross-platform contract.",
  "Add stronger native-focused smoke tests around exports and theme behavior.",
  "Broaden layout-engine integration examples for panel plugins and engineering canvases.",
  "Continue tightening generated declaration output and package-level API guarantees.",
] as const;
const defaultAccentPreset: AccentPresetName = "blue";

export function App() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return window.localStorage.getItem("synthex-preview-mode") === "dark" ? "dark" : "light";
  });
  const [accentPreset, setAccentPreset] = useState<AccentPresetName>(() => {
    if (typeof window === "undefined") {
      return defaultAccentPreset;
    }

    const storedValue = window.localStorage.getItem("synthex-preview-accent");
    return storedValue && storedValue in accentPresets
      ? (storedValue as AccentPresetName)
      : defaultAccentPreset;
  });
  const [navQuery, setNavQuery] = useControllableState({
    defaultValue: "",
  });
  const workbench = useWorkbench();
  const filteredNavItems = useMemo(() => {
    const query = navQuery.trim().toLowerCase();

    if (!query) {
      return navItems;
    }

    return navItems.filter((item) =>
      `${item.label} ${item.description}`.toLowerCase().includes(query),
    );
  }, [navQuery]);

  useEffect(() => {
    window.localStorage.setItem("synthex-preview-mode", mode);
  }, [mode]);

  useEffect(() => {
    window.localStorage.setItem("synthex-preview-accent", accentPreset);
  }, [accentPreset]);

  return (
    <ThemeProvider mode={mode} accentPreset={accentPreset}>
      <div className="preview-site">
        <header className="preview-header">
          <div className="preview-header-inner">
            <div className="preview-brand">
              <Badge>Synthex UI</Badge>
              <Badge variant="outline">Pre-release</Badge>
              <div>
                <div className="preview-brand-title">Synthex UI</div>
                <Small>Cross-platform React UI for engineering-grade products.</Small>
              </div>
            </div>
            <div className="preview-header-actions">
              <div className="preview-accent-switcher" role="group" aria-label="Accent color">
                {Object.entries(accentPresets).map(([id, preset]) => (
                  <button
                    key={id}
                    type="button"
                    className="preview-accent-button"
                    aria-label={`Use ${preset.label} accent`}
                    aria-pressed={accentPreset === id}
                    onClick={() => setAccentPreset(id as AccentPresetName)}
                  >
                    <span
                      className="preview-accent-swatch"
                      style={{ backgroundColor: preset.swatch }}
                    />
                  </button>
                ))}
              </div>
              <Button variant="outline" onClick={() => navigate("/installation")}>
                Getting Started
              </Button>
              <Button variant="outline" onClick={() => navigate("/playground")}>
                <GridIcon size={16} />
                Playground
              </Button>
              <Button variant="ghost" onClick={() => setMode(mode === "light" ? "dark" : "light")}>
                {mode === "light" ? "Dark mode" : "Light mode"}
              </Button>
            </div>
          </div>
        </header>

        <div className="preview-shell">
          <aside className="preview-sidebar">
            <Card className="preview-sidebar-card" variant="elevated">
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  The preview app now works like a real package site instead of a raw sandbox.
                </CardDescription>
              </CardHeader>
              <CardContent className="preview-sidebar-content">
                <div className="preview-search">
                  <SearchIcon size={16} />
                  <Input
                    aria-label="Filter sections"
                    placeholder="Filter sections"
                    value={navQuery}
                    onChange={(event) => setNavQuery(event.target.value)}
                  />
                </div>

                <nav className="preview-nav">
                  {filteredNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      className="preview-nav-link"
                      to={item.to}
                    >
                      <span>{item.label}</span>
                      <small>{item.description}</small>
                    </NavLink>
                  ))}
                </nav>

                <Separator />

                <div className="preview-sidebar-meta">
                  <Badge variant="secondary">Bun-first workspace</Badge>
                  <Badge variant="secondary">Strict TypeScript</Badge>
                  <Badge variant="secondary">Engine-ready</Badge>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="preview-main">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <OverviewSection onNavigate={navigate} />
                    <PackageScopeSection />
                    <RoadmapSection />
                  </>
                }
              />
              <Route path="/installation" element={<GettingStartedSection />} />
              <Route path="/components" element={<ComponentGallerySection />} />
              <Route path="/theme" element={<ThemeSection />} />
              <Route
                path="/engine"
                element={
                  <>
                    <SupportMatrixSection />
                    <ExportsSection />
                    <PackageScopeSection />
                  </>
                }
              />
              <Route path="/playground" element={<WorkbenchSection workbench={workbench} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

function OverviewSection({
  onNavigate,
}: {
  readonly onNavigate: (to: RoutePath) => void;
}) {
  return (
    <section id="overview" className="preview-hero">
      <div className="preview-hero-copy">
        <Small>Synthex UI</Small>
        <div className="preview-chip-row">
          <Badge>Cross-platform</Badge>
          <Badge variant="outline">Design system + layout engine</Badge>
          <Badge variant="secondary">Bun monorepo</Badge>
        </div>
        <H1>One component vocabulary for serious web and native product surfaces.</H1>
        <Lead>
          Synthex UI combines a polished cross-platform component library with a deterministic layout engine for complex engineering workflows.
        </Lead>
        <div className="preview-action-row">
          <Button onClick={() => onNavigate("/installation")}>Install and build</Button>
          <Button variant="outline" onClick={() => onNavigate("/playground")}>
            Open live playground
          </Button>
          <Button variant="ghost" onClick={() => onNavigate("/components")}>
            Browse components
          </Button>
        </div>
        <div className="preview-inline-note">
          <Muted>
            Inspired by the clarity of README-first package sites, but built around an actual dockable UI engine instead of a generic component catalog alone.
          </Muted>
        </div>
      </div>

      <Card className="preview-hero-panel" variant="elevated">
        <CardHeader>
          <CardTitle>Library snapshot</CardTitle>
          <CardDescription>
            Clean package boundaries, stronger type artifacts, and a docs surface that validates the real public API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="preview-metric-grid">
            <MetricCard label="Primary package" value="@synthex/ui" />
            <MetricCard label="Engine package" value="@synthex/core" />
            <MetricCard label="Web adapter" value="@synthex/react-web" />
            <MetricCard label="Preview app" value="@synthex/web-preview" />
          </div>
          <Separator />
          <div className="preview-stack-sm">
            <Muted>
              Similar in clarity to compact package sites like CUI, but centered on a deeper architecture: shared UI, explicit adapters, and a real tiling layout kernel.
            </Muted>
            <div className="preview-chip-row">
              <Badge variant="outline">Generated declarations</Badge>
              <Badge variant="outline">Subpath exports</Badge>
              <Badge variant="outline">Reducer-backed layout</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function MetricCard({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="preview-metric-card">
      <Small>{label}</Small>
      <strong>{value}</strong>
    </div>
  );
}

function PackageScopeSection() {
  return (
    <section id="packages" className="preview-section">
      <div className="preview-section-heading">
        <H2>Package model</H2>
        <Muted>
          The repo is organized around explicit package responsibilities instead of mixing generic UI, adapters, and engine internals together.
        </Muted>
      </div>

      <div className="preview-card-grid preview-card-grid-2">
        {packageCards.map((item) => (
          <Card key={item.title} variant="interactive">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card variant="muted">
        <CardContent className="preview-stack-sm">
          <Small>Why this structure matters</Small>
          <Muted>
            `@synthex/ui` stays generic and reusable. `@synthex/react-web` owns the dockable renderer. `@synthex/core` stays framework-agnostic. That split is what keeps the repo scalable instead of collapsing into a flat UI kit.
          </Muted>
        </CardContent>
      </Card>
    </section>
  );
}

function SupportMatrixSection() {
  return (
    <section id="matrix" className="preview-section">
      <div className="preview-section-heading">
        <H2>Support matrix</H2>
        <Muted>
          Synthex UI ships a shared vocabulary across web and native, while keeping the dockable workbench renderer intentionally scoped to the web adapter.
        </Muted>
      </div>

      <Card variant="default">
        <CardContent className="preview-table-wrap">
          <table className="preview-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Web</th>
                <th>Native</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {supportRows.map((row) => (
                <tr key={row.area}>
                  <td>{row.area}</td>
                  <td><StatusBadge value={row.web} /></td>
                  <td><StatusBadge value={row.native} /></td>
                  <td>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}

function StatusBadge({
  value,
}: {
  readonly value: SupportRow["web"];
}) {
  const variant =
    value === "Supported"
      ? "secondary"
      : value === "Evolving"
        ? "outline"
        : value === "Experimental"
          ? "destructive"
          : "outline";

  return <Badge variant={variant}>{value}</Badge>;
}

function ExportsSection() {
  return (
    <section id="exports" className="preview-section">
      <div className="preview-section-heading">
        <H2>Package exports</H2>
        <Muted>
          The preview uses the same root and subpath imports that consumers will use in real applications.
        </Muted>
      </div>

      <div className="preview-card-grid preview-card-grid-2">
        {exportItems.map((item) => (
          <Card key={item.path} variant="default">
            <CardHeader>
              <CardTitle>{item.path}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="preview-chip-row">
                {item.examples.map((example) => (
                  <Badge key={example} variant="outline">
                    {example}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ComponentGallerySection() {
  return (
    <section id="components" className="preview-section">
      <div className="preview-section-heading">
        <H2>Component gallery</H2>
        <Muted>
          This page is intentionally practical: it exercises the actual exported components instead of showing a static marketing mockup.
        </Muted>
      </div>

      <div className="preview-gallery-grid">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Inputs and field composition</CardTitle>
            <CardDescription>
              The control layer now covers more of the real shadcn-style surface: labels, inputs, textareas, validation states, and shared field spacing.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <div className="preview-form-grid">
              <div className="preview-field-stack">
                <Label htmlFor="component-search">Command search</Label>
                <Input id="component-search" placeholder="Search panels, commands, or files" />
              </div>
              <div className="preview-field-stack">
                <Label htmlFor="component-title">Inspector title</Label>
                <Input id="component-title" placeholder="Inspector title" uiSize="lg" />
              </div>
              <div className="preview-field-stack preview-form-grid-span-2">
                <Label htmlFor="component-description">Description</Label>
                <Textarea
                  id="component-description"
                  placeholder="Describe the current workspace state, task intent, or panel metadata."
                />
              </div>
              <div className="preview-field-stack">
                <Label htmlFor="component-invalid">Validation example</Label>
                <Input
                  id="component-invalid"
                  invalid
                  placeholder="Missing required value"
                />
              </div>
              <div className="preview-field-stack">
                <Label htmlFor="component-notes">Notes</Label>
                <Textarea id="component-notes" uiSize="sm" placeholder="Compact note field" />
              </div>
              <div className="preview-field-stack preview-form-grid-span-2">
                <Label>Active workspace</Label>
                <Select defaultValue="schematic" placeholder="Choose a panel">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="schematic">Schematic editor</SelectItem>
                    <SelectItem value="pcb">PCB layout</SelectItem>
                    <SelectItem value="console">Command console</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Selection and state controls</CardTitle>
            <CardDescription>
              Checkbox, switch, toggle, and radio-group patterns now live in the public package instead of being improvised inside app code.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <div className="preview-selection-grid">
              <div className="preview-selection-card">
                <Small>Discrete state</Small>
                <div className="preview-stack-sm">
                  <label className="preview-inline-control">
                    <Checkbox defaultChecked aria-label="Autosave" />
                    <span>Autosave drafts</span>
                  </label>
                  <label className="preview-inline-control">
                    <Checkbox aria-label="Grid snapping" />
                    <span>Grid snapping</span>
                  </label>
                </div>
              </div>
              <div className="preview-selection-card">
                <Small>Binary toggles</Small>
                <div className="preview-stack-sm">
                  <label className="preview-inline-control">
                    <Switch defaultChecked aria-label="Inspector visibility" />
                    <span>Inspector visibility</span>
                  </label>
                  <div className="preview-chip-row">
                    <Toggle defaultPressed>Snap</Toggle>
                    <Toggle>Annotate</Toggle>
                    <Toggle variant="default">Measure</Toggle>
                  </div>
                </div>
              </div>
            </div>

            <div className="preview-stack-sm">
              <Small>Radio group</Small>
              <RadioGroup defaultValue="comfortable" className="preview-radio-grid">
                <RadioGroupItem value="compact">Compact density</RadioGroupItem>
                <RadioGroupItem value="comfortable">Comfortable density</RadioGroupItem>
                <RadioGroupItem value="focused">Focused editing</RadioGroupItem>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Buttons, tabs, and paging</CardTitle>
            <CardDescription>
              Core command surfaces and navigation patterns stay visually aligned with the rest of the system.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <div className="preview-chip-row">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="preview-chip-row">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add panel">
                <AddIcon size={16} />
              </Button>
            </div>

            <Tabs defaultValue="tabs">
              <TabsList>
                <TabsTrigger value="tabs">Tabs</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="paging">Pagination</TabsTrigger>
              </TabsList>
              <TabsContent value="tabs">
                <Muted>
                  Tabs are used both for component previews and as the base visual language for the layout workbench.
                </Muted>
              </TabsContent>
              <TabsContent value="badges">
                <div className="preview-chip-row">
                  <Badge>Overview</Badge>
                  <Badge variant="secondary">Inspector</Badge>
                  <Badge variant="outline">Console</Badge>
                </div>
              </TabsContent>
              <TabsContent value="paging">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink>2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink>3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Feedback, identity, and loading states</CardTitle>
            <CardDescription>
              Production apps need more than inputs. Alerts, progress, avatar, and skeleton states are part of the base library now.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <div className="preview-avatar-row">
              <Avatar size="lg">
                <AvatarFallback size="lg">SX</AvatarFallback>
              </Avatar>
              <div className="preview-stack-sm">
                <Small>Team presence</Small>
                <Muted>Cross-platform avatars with image/fallback behavior.</Muted>
              </div>
            </div>

            <div className="preview-stack-sm">
              <Alert variant="default">
                <AlertTitle>System status nominal</AlertTitle>
                <AlertDescription>
                  Core reducers, commands, and preview adapters are in sync.
                </AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTitle variant="warning">Review pending changes</AlertTitle>
                <AlertDescription variant="warning">
                  Serialization shape changed after the latest workbench mutation.
                </AlertDescription>
              </Alert>
            </div>

            <div className="preview-stack-sm">
              <Small>Build progress</Small>
              <Progress value={72} />
            </div>

            <div className="preview-skeleton-grid">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" variant="soft" />
              <Skeleton className="h-4 w-[82%]" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Data and disclosure</CardTitle>
            <CardDescription>
              Tables and accordions are part of the public API so dashboards and inspectors do not have to reinvent them.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <Accordion type="single" defaultValue="surface" collapsible>
              <AccordionItem value="surface">
                <AccordionTrigger>Surface model</AccordionTrigger>
                <AccordionContent>
                  Semantic surfaces, borders, shadows, and elevation all resolve from the shared theme contract.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="runtime">
                <AccordionTrigger>Runtime adapters</AccordionTrigger>
                <AccordionContent>
                  Web and native implementations remain thin over shared contracts and typed state helpers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Table>
              <TableCaption>Core package responsibilities at a glance.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>@synthex/ui</TableCell>
                  <TableCell>Cross-platform design system</TableCell>
                  <TableCell>Ready</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>@synthex/core</TableCell>
                  <TableCell>Framework-agnostic layout engine</TableCell>
                  <TableCell>Ready</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>@synthex/react-web</TableCell>
                  <TableCell>Dockable renderer adapter</TableCell>
                  <TableCell>Ready</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Overlay baseline</CardTitle>
            <CardDescription>
              The library now includes dialog, popover, sheet, and tooltip primitives so product flows can build overlays without reaching for an external UI framework.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <div className="preview-chip-row">
              <Dialog>
                <DialogTrigger className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium tracking-[-0.01em] text-[color:var(--sx-color-foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-[background-color,border-color,color] duration-150 hover:bg-[color:var(--sx-color-surface-muted)]">
                  Open release dialog
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publish preview package</DialogTitle>
                    <DialogDescription>
                      This baseline dialog is intentionally small and composable. It covers structured overlays without dragging a framework into the repo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="preview-stack-sm">
                    <Label htmlFor="release-tag">Release tag</Label>
                    <Input id="release-tag" defaultValue="0.2.0-next.1" />
                  </div>
                  <DialogFooter>
                    <Button variant="ghost">Cancel</Button>
                    <Button>Publish</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Popover>
                <PopoverTrigger className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium tracking-[-0.01em] text-[color:var(--sx-color-foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-[background-color,border-color,color] duration-150 hover:bg-[color:var(--sx-color-surface-muted)]">
                  Open popover
                </PopoverTrigger>
                <PopoverContent className="preview-stack-sm">
                  <Small>Quick actions</Small>
                  <Muted>Popover content stays lightweight for contextual actions and metadata.</Muted>
                </PopoverContent>
              </Popover>

              <Sheet>
                <SheetTrigger className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium tracking-[-0.01em] text-[color:var(--sx-color-foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-[background-color,border-color,color] duration-150 hover:bg-[color:var(--sx-color-surface-muted)]">
                  Open sheet
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Inspector pane</SheetTitle>
                    <SheetDescription>
                      Sheets are useful for inspector-style surfaces that should not fully block the underlying workspace.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetFooter>
                    <Button variant="ghost">Dismiss</Button>
                    <Button>Apply</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
            <div className="preview-chip-row">
              <Tooltip>
                <TooltipTrigger className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-dashed border-[color:var(--sx-color-border-strong)] px-4 text-sm font-medium text-[color:var(--sx-color-foreground-muted)]">
                  Hover for tooltip
                </TooltipTrigger>
                <TooltipContent>Tooltips are for short contextual hints, not full interactions.</TooltipContent>
              </Tooltip>
            </div>
            <Muted>
              This is the baseline overlay layer. Menus, sheets, and popovers can build on the same contract without polluting the core engine packages.
            </Muted>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Icons and runtime hooks</CardTitle>
            <CardDescription>
              Named icons stay behind the library contract, while hooks expose cross-platform runtime state.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <div className="preview-icon-grid">
              {iconNames.slice(0, 8).map((iconName) => (
                <div key={iconName} className="preview-icon-cell">
                  <Icon name={iconName} />
                  <Small>{iconName}</Small>
                </div>
              ))}
            </div>
            <HookStatusCard />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function HookStatusCard() {
  const runtime = usePlatformValue({
    native: "Native runtime",
    web: "Web runtime",
  });
  const reducedMotion = useReducedMotion();

  return (
    <div className="preview-hook-card">
      <div className="preview-chip-row">
        <Badge variant="secondary">{runtime}</Badge>
        <Badge variant={reducedMotion ? "outline" : "secondary"}>
          {reducedMotion ? "Reduced motion" : "Standard motion"}
        </Badge>
      </div>
      <Muted>
        The same hooks surface branches cleanly by platform while keeping the consumer API stable.
      </Muted>
    </div>
  );
}

function ThemeSection() {
  const theme = useTheme();

  return (
    <section id="theme" className="preview-section">
      <div className="preview-section-heading">
        <H2>Theme and semantic tokens</H2>
        <Muted>
          The theme layer is semantic first. Components consume meaning like surface, border, accent, and ring instead of hard-coded palette values.
        </Muted>
      </div>

      <div className="preview-card-grid preview-card-grid-2">
        <Card variant="accent">
          <CardHeader>
            <CardTitle>Token sample</CardTitle>
            <CardDescription>
              Web uses CSS variables, native uses the same resolved token values through the shared theme object.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-token-grid">
            {[
              ["background", theme.colors.background],
              ["surface", theme.colors.surface],
              ["foreground", theme.colors.foreground],
              ["primary", theme.colors.primary],
              ["accent", theme.colors.accent],
              ["destructive", theme.colors.destructive],
            ].map(([label, value]) => (
              <div key={label} className="preview-token-card">
                <div className="preview-token-meta">
                  <span className="preview-token-swatch" style={{ background: String(value) }} />
                  <strong>{label}</strong>
                </div>
                <Small>{value}</Small>
              </div>
            ))}
          </CardContent>
        </Card>

        <ThemeBehaviorCard />
      </div>
    </section>
  );
}

function ThemeBehaviorCard() {
  const disclosure = useDisclosure({ defaultOpen: true });

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>Theme behavior</CardTitle>
        <CardDescription>
          The preview keeps the theme surface interactive so token changes stay obvious while building the library.
        </CardDescription>
      </CardHeader>
      <CardContent className="preview-stack-md">
        <div className="preview-chip-row">
          <Badge>Light + dark presets</Badge>
          <Badge variant="outline">Typed overrides</Badge>
          <Badge variant="secondary">Shared token contract</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={disclosure.onToggle}>
          <SettingsIcon size={16} />
          {disclosure.isOpen ? "Hide notes" : "Show notes"}
        </Button>
        {disclosure.isOpen ? (
          <Muted>
            This is where Synthex goes beyond a flat component catalog: theme tokens, runtime hooks, and the workbench layer stay aligned instead of evolving in separate silos.
          </Muted>
        ) : null}
      </CardContent>
    </Card>
  );
}

function GettingStartedSection() {
  return (
    <section id="getting-started" className="preview-section">
      <div className="preview-section-heading">
        <H2>Getting started</H2>
        <Muted>
          The preview mirrors the real workspace flow so build, test, and docs validation happen from the same monorepo entrypoint.
        </Muted>
      </div>

      <div className="preview-code-grid">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Workspace commands</CardTitle>
            <CardDescription>
              Bun-first install, typecheck, test, build, and preview loop.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`bun install\nbun run check-types\nbun run test\nbun run build\nbun run dev`}
            />
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Minimal usage</CardTitle>
            <CardDescription>
              Import from the real public surface, not from internal package paths.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`import "@synthex/ui/styles.css";\nimport { Button } from "@synthex/ui/components";\nimport { ThemeProvider } from "@synthex/ui/theme";\n\nexport function Example() {\n  return (\n    <ThemeProvider>\n      <Button>Run</Button>\n    </ThemeProvider>\n  );\n}`}
            />
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Layout integration</CardTitle>
            <CardDescription>
              The dockable workbench stays outside the base design-system package.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`import { createLayoutEngine } from "@synthex/core";\nimport { LayoutRenderer, useSynthex } from "@synthex/react-web";\n\nconst engine = createLayoutEngine(layout);\nconst state = useSynthex(engine);`}
            />
          </CardContent>
        </Card>

        <Card variant="muted">
          <CardHeader>
            <CardTitle>Project shape</CardTitle>
            <CardDescription>
              The public package model stays obvious at the repo root.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`packages/\n  core/\n  ui/\n  react-web/\n  web-preview/\n  cli/`}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function WorkbenchSection({
  workbench,
}: {
  readonly workbench: WorkbenchController;
}) {
  const theme = useTheme();
  const rendererTheme = useMemo(() => createWorkbenchRendererTheme(theme), [theme]);
  const shellStyle = useMemo(() => createWorkbenchShellStyle(theme), [theme]);
  const selectedNode = useMemo(
    () => (workbench.selectedNodeId ? findNodeById(workbench.layout, workbench.selectedNodeId) : null),
    [workbench.layout, workbench.selectedNodeId],
  );
  const stats = useMemo(() => summarizeLayout(workbench.layout), [workbench.layout]);

  return (
    <section id="playground" className="preview-section">
      <div className="preview-section-heading">
        <H2>Live workbench</H2>
        <Muted>
          This is the part CUI-style package sites usually do not cover: Synthex validates a real tiling layout engine and command flow inside the docs app itself.
        </Muted>
      </div>

      <div className="workbench-shell" style={shellStyle}>
        <div className="workbench-shell-main">
          <div className="workbench-shell-header">
            <div className="workbench-shell-heading">
              <Small>Docking workspace</Small>
              <div className="workbench-shell-heading-row">
                <H3>Reducer-backed engineering surface</H3>
                <div className="preview-chip-row">
                  <Badge variant="outline">Split panels</Badge>
                  <Badge variant="outline">Tab hosts</Badge>
                  <Badge variant="outline">Undo / redo</Badge>
                </div>
              </div>
              <Muted>
                Toolbar actions mutate the real layout tree. The dock area, selection state, and JSON snapshot all update from the same engine state.
              </Muted>
            </div>

            <Toolbar
              canRedo={workbench.redoDepth > 0}
              canUndo={workbench.undoDepth > 0}
              lastAction={workbench.lastAction}
              selectedLabel={selectedNode ? describeWorkbenchNode(selectedNode) : "Nothing selected"}
              onAddPanel={() => void workbench.addPanel()}
              onSplitHorizontal={() => void workbench.splitSelection("vertical")}
              onSplitVertical={() => void workbench.splitSelection("horizontal")}
              onUndo={() => void workbench.undo()}
              onRedo={() => void workbench.redo()}
            />
          </div>

          <div className="workbench-frame">
            <LayoutRenderer
              layout={workbench.layout}
              theme={rendererTheme}
              selectedNodeId={workbench.selectedNodeId}
              onSelectNode={workbench.setSelectedNodeId}
              onAction={(action) => {
                void workbench.dispatch(action);
              }}
              renderTabLabel={(panel) => (
                <span className="workbench-tab-label">{panel.title ?? panel.panelType}</span>
              )}
              renderPanel={(panel) => (
                <PreviewPanel
                  panel={panel}
                  isSelected={panel.id === workbench.selectedNodeId}
                />
              )}
            />
          </div>
        </div>

        <aside className="workbench-sidebar">
          <div className="workbench-sidebar-pane">
            <div className="workbench-pane-title-row">
              <H3>Session</H3>
              <Badge variant="secondary">{workbench.lastAction}</Badge>
            </div>
            <div className="workbench-stat-grid">
              <div className="workbench-stat">
                <Small>Panels</Small>
                <strong>{stats.panels}</strong>
              </div>
              <div className="workbench-stat">
                <Small>Tab hosts</Small>
                <strong>{stats.tabs}</strong>
              </div>
              <div className="workbench-stat">
                <Small>Splits</Small>
                <strong>{stats.splits}</strong>
              </div>
              <div className="workbench-stat">
                <Small>Depth</Small>
                <strong>{stats.depth}</strong>
              </div>
            </div>
            <div className="workbench-chip-strip">
              <Badge variant="outline">Undo {workbench.undoDepth}</Badge>
              <Badge variant="outline">Redo {workbench.redoDepth}</Badge>
            </div>
          </div>

          <div className="workbench-sidebar-pane">
            <div className="workbench-pane-title-row">
              <H3>Selection</H3>
              <Small>{selectedNode ? selectedNode.id : "none"}</Small>
            </div>
            <Muted>
              {selectedNode
                ? describeWorkbenchNode(selectedNode)
                : "Select a panel, tab host, or split frame to inspect it here."}
            </Muted>
            {selectedNode ? (
              <dl className="workbench-definition-list">
                <div>
                  <dt>Node type</dt>
                  <dd>{selectedNode.type}</dd>
                </div>
                {selectedNode.type === "panel" ? (
                  <>
                    <div>
                      <dt>Panel type</dt>
                      <dd>{selectedNode.panelType}</dd>
                    </div>
                    <div>
                      <dt>Title</dt>
                      <dd>{selectedNode.title ?? "Untitled"}</dd>
                    </div>
                  </>
                ) : null}
                {selectedNode.type === "tabs" ? (
                  <>
                    <div>
                      <dt>Active panel</dt>
                      <dd>{selectedNode.activePanelId}</dd>
                    </div>
                    <div>
                      <dt>Children</dt>
                      <dd>{selectedNode.children.length}</dd>
                    </div>
                  </>
                ) : null}
                {selectedNode.type === "split" ? (
                  <>
                    <div>
                      <dt>Direction</dt>
                      <dd>{selectedNode.direction}</dd>
                    </div>
                    <div>
                      <dt>Ratios</dt>
                      <dd>{selectedNode.sizes.map((size) => size.toFixed(2)).join(" / ")}</dd>
                    </div>
                  </>
                ) : null}
              </dl>
            ) : null}
          </div>

          <div className="workbench-sidebar-pane workbench-sidebar-pane-code">
            <div className="workbench-pane-title-row">
              <H3>Serialized layout</H3>
              <Small>JSON snapshot</Small>
            </div>
            <pre className="workbench-code">
              <code>{serializeLayout(workbench.layout)}</code>
            </pre>
          </div>
        </aside>
      </div>
    </section>
  );
}

function RoadmapSection() {
  return (
    <section id="roadmap" className="preview-section preview-section-last">
      <div className="preview-section-heading">
        <H2>Roadmap</H2>
        <Muted>
          This milestone is about pre-release hardening, not a shallow component dump. The library will expand only if the package boundaries stay clean.
        </Muted>
      </div>

      <div className="preview-roadmap-grid">
        {roadmapItems.map((item) => (
          <Card key={item} variant="interactive">
            <CardContent>
              <div className="preview-roadmap-item">
                <Badge variant="secondary">Next</Badge>
                <span>{item}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function CodeBlock({ code }: { readonly code: string }) {
  return (
    <pre className="code-block">
      <code>{code}</code>
    </pre>
  );
}

interface WorkbenchController {
  readonly addPanel: () => Promise<void>;
  readonly dispatch: (action: LayoutAction) => Promise<LayoutNode>;
  readonly lastAction: string;
  readonly layout: LayoutNode;
  readonly redo: () => Promise<void>;
  readonly redoDepth: number;
  readonly selectedNodeId: string | null;
  readonly setSelectedNodeId: (nodeId: string | null) => void;
  readonly splitSelection: (direction: LayoutDirection) => Promise<void>;
  readonly undo: () => Promise<void>;
  readonly undoDepth: number;
}

interface WorkbenchStats {
  readonly depth: number;
  readonly panels: number;
  readonly splits: number;
  readonly tabs: number;
}

type PreviewMiddleware = (
  action: LayoutAction,
  prevState: LayoutNode,
  next: (action: LayoutAction) => Promise<LayoutNode>,
) => Promise<LayoutNode>;

function useWorkbench(): WorkbenchController {
  const engineRef = useRef<LayoutEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = createLayoutEngine(previewLayout);
  }

  const engine = engineRef.current;
  const layout = useSynthex(engine);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("workspace-tabs");
  const [lastAction, setLastAction] = useState<string>("INITIAL");
  const [undoDepth, setUndoDepth] = useState(0);
  const [redoDepth, setRedoDepth] = useState(0);
  const nextPanelCountRef = useRef(1);

  const middleware = useMemo<readonly PreviewMiddleware[]>(
    () => [
      async (action, prevState, next) => {
        const nextState = await next(action);
        console.log("[synthex-preview] action", action.type, {
          action,
          prevState,
          nextState,
        });
        return nextState;
      },
      async (action, _prevState, next) => {
        setLastAction(action.type);
        return next(action);
      },
    ],
    [],
  );

  const dispatch = async (action: LayoutAction): Promise<LayoutNode> => {
    const invoke = async (index: number, currentAction: LayoutAction): Promise<LayoutNode> => {
      const layer = middleware[index];

      if (!layer) {
        await engine.commands.dispatch(currentAction.type, currentAction);
        setUndoDepth((value) => value + 1);
        setRedoDepth(0);
        return engine.getState();
      }

      const previous = engine.getState();
      return layer(currentAction, previous, (nextAction) => invoke(index + 1, nextAction));
    };

    return invoke(0, action);
  };

  const addPanel = async () => {
    const panelId = `panel-${nextPanelCountRef.current}`;
    nextPanelCountRef.current += 1;

    await dispatch({
      type: "ADD_PANEL",
      targetNodeId: resolveInsertionTarget(layout, selectedNodeId),
      panel: createPanel(panelId),
    });
  };

  const splitSelection = async (direction: LayoutDirection) => {
    const targetNodeId = selectedNodeId ?? layout.id;

    await dispatch({
      type: "SPLIT_NODE",
      targetNodeId,
      direction,
      node: createPanel(`split-${nextPanelCountRef.current}`),
      position: "after",
    });

    nextPanelCountRef.current += 1;
  };

  const undo = async () => {
    const undone = await engine.commands.undo();
    setLastAction("UNDO");

    if (!undone) {
      return;
    }

    setUndoDepth((value) => Math.max(0, value - 1));
    setRedoDepth((value) => value + 1);
    console.log("[synthex-preview] undo", engine.getState());
  };

  const redo = async () => {
    const redone = await engine.commands.redo();
    setLastAction("REDO");

    if (!redone) {
      return;
    }

    setUndoDepth((value) => value + 1);
    setRedoDepth((value) => Math.max(0, value - 1));
    console.log("[synthex-preview] redo", engine.getState());
  };

  return {
    addPanel,
    dispatch,
    lastAction,
    layout,
    redo,
    redoDepth,
    selectedNodeId,
    setSelectedNodeId,
    splitSelection,
    undo,
    undoDepth,
  };
}

function resolveInsertionTarget(layout: LayoutNode, selectedNodeId: string | null): string {
  if (selectedNodeId) {
    const selected = findNodeById(layout, selectedNodeId);

    if (selected && selected.type !== "split") {
      return selected.id;
    }
  }

  let targetNodeId = layout.id;

  traverseLayout(layout, (node) => {
    if (targetNodeId !== layout.id) {
      return;
    }

    if (node.type === "tabs" || node.type === "panel") {
      targetNodeId = node.id;
    }
  });

  return targetNodeId;
}

function createPanel(panelId: string): PanelNode {
  return {
    id: panelId,
    type: "panel",
    panelType: "preview",
    title: toTitle(panelId),
  };
}

function toTitle(value: string): string {
  return value
    .split(/[-_/]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function summarizeLayout(layout: LayoutNode): WorkbenchStats {
  let panels = 0;
  let tabs = 0;
  let splits = 0;
  let depth = 0;

  const walk = (node: LayoutNode, currentDepth: number) => {
    depth = Math.max(depth, currentDepth);

    if (node.type === "panel") {
      panels += 1;
      return;
    }

    if (node.type === "tabs") {
      tabs += 1;
      node.children.forEach((child) => walk(child, currentDepth + 1));
      return;
    }

    splits += 1;
    node.children.forEach((child) => walk(child, currentDepth + 1));
  };

  walk(layout, 1);

  return { depth, panels, splits, tabs };
}

function describeWorkbenchNode(node: LayoutNode): string {
  if (node.type === "panel") {
    return `${node.title ?? toTitle(node.panelType)} panel`;
  }

  if (node.type === "tabs") {
    return `${node.children.length} tab ${node.children.length === 1 ? "panel" : "panels"} with ${node.activePanelId} active`;
  }

  return `${node.direction === "horizontal" ? "Left/right" : "Top/bottom"} split with ${node.children.length} regions`;
}

function createWorkbenchRendererTheme(theme: SynthexTheme) {
  const isDark = theme.mode === "dark";

  return {
    canvasBackground: isDark ? "#0a1019" : theme.colors.backgroundSubtle,
    surfaceBackground: isDark ? "#0f1724" : theme.colors.surface,
    surfaceMutedBackground: isDark ? "#0d1520" : theme.colors.surfaceMuted,
    surfaceRaisedBackground: isDark ? "#152033" : theme.colors.surfaceRaised,
    borderColor: isDark ? "rgba(148, 163, 184, 0.16)" : theme.colors.border,
    borderColorStrong: isDark ? "rgba(148, 163, 184, 0.28)" : theme.colors.borderStrong,
    selectedBorderColor: theme.colors.primary,
    textColor: isDark ? "#e2e8f0" : theme.colors.foreground,
    mutedTextColor: isDark ? "#93a3b8" : theme.colors.foregroundMuted,
    tabRailBackground: isDark ? "#0c1522" : theme.colors.backgroundSubtle,
    tabActiveBackground: isDark ? "#172235" : theme.colors.surfaceRaised,
    tabInactiveBackground: "transparent",
    tabActiveTextColor: isDark ? "#f8fafc" : theme.colors.foreground,
    tabInactiveTextColor: isDark ? "#94a3b8" : theme.colors.foregroundMuted,
    resizeHandleBackground: isDark ? "#0a1019" : theme.colors.backgroundSubtle,
    resizeHandleColor: isDark ? "rgba(148, 163, 184, 0.34)" : "rgba(100, 116, 139, 0.28)",
    resizeHandleHoverColor: theme.colors.primary,
  };
}

function createWorkbenchShellStyle(theme: SynthexTheme): CSSProperties {
  const isDark = theme.mode === "dark";

  return {
    ["--workbench-shell-background" as string]: isDark ? "#0b121d" : theme.colors.surface,
    ["--workbench-shell-background-muted" as string]: isDark ? "#0f1724" : theme.colors.surfaceMuted,
    ["--workbench-shell-background-raised" as string]: isDark ? "#121d2c" : theme.colors.surfaceRaised,
    ["--workbench-shell-border" as string]: isDark
      ? "rgba(148, 163, 184, 0.16)"
      : theme.colors.border,
    ["--workbench-shell-border-strong" as string]: isDark
      ? "rgba(148, 163, 184, 0.28)"
      : theme.colors.borderStrong,
    ["--workbench-shell-foreground" as string]: isDark ? "#e2e8f0" : theme.colors.foreground,
    ["--workbench-shell-foreground-muted" as string]: isDark ? "#93a3b8" : theme.colors.foregroundMuted,
    ["--workbench-shell-accent" as string]: theme.colors.primary,
    ["--workbench-shell-code-background" as string]: isDark ? "#07101c" : "#0f172a",
    ["--workbench-shell-code-foreground" as string]: isDark ? "#dbe7f7" : "#dbeafe",
    ["--workbench-shell-grid" as string]: isDark
      ? "rgba(148, 163, 184, 0.1)"
      : "rgba(148, 163, 184, 0.2)",
  };
}
