import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import mermaid from "mermaid";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "./components/AppSidebar";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDescription,
  AlertTitle,
  AspectRatio,
  Avatar,
  AvatarFallback,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Calendar,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DataTable,
  DashboardView,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DirectionProvider,
  DatePicker,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  H1,
  H2,
  H3,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  InputGroup,
  InputGroupAddon,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Item,
  ItemDescription,
  ItemTitle,
  Kbd,
  LineChart,
  BarChart,
  AreaChart,
  Label,
  Lead,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  Muted,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  NativeSelect,
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
  ScrollArea,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  Slider,
  Small,
  Spinner,
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
  ToggleGroup,
  ToggleGroupItem,
  ToastProvider,
  Toaster,
  useSonner,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  ButtonGroup,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "synthex-ui/components";
import {
  AddIcon,
  ActivityIcon,
  BookOpenIcon,
  FileIcon,
  GridIcon,
  Icon,
  iconNames,
  PaletteIcon,
  RedoIcon,
  SearchIcon,
  SettingsIcon,
  TerminalIcon,
  UndoIcon,
} from "synthex-ui/icons";
import {
  ThemeProvider,
  accentPresets,
  useTheme,
  type AccentPresetName,
  type SynthexTheme,
} from "synthex-ui/theme";
import {
  useControllableState,
  useDisclosure,
  usePlatformValue,
  useReducedMotion,
} from "synthex-ui/hooks";
import { Builder } from "./components";
import { GALLERY_COMPONENTS, DOCS_METADATA, type DocMetadata } from "./data";

// --- Custom Documentation Components ---

function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [id] = useState(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const render = async () => {
      if (ref.current && chart) {
        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
            fontFamily: "Inter, system-ui, sans-serif",
          });
          const { svg } = await mermaid.render(id, chart.trim());
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (e) {
          console.error("Mermaid render error:", e);
          if (ref.current) {
            ref.current.innerHTML = `<div class="p-4 bg-red-900/10 border border-red-500/20 rounded-xl text-red-200/70 text-[10px] font-mono flex items-center gap-3">
              <div class="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Mermaid Syntax Error: Check diagram definition
            </div>`;
          }
        }
      }
    };
    render();
  }, [chart, id]);

  return (
    <div className="mermaid-container bg-black/10 rounded-2xl border border-border/20 p-8 my-8 overflow-x-auto shadow-inner flex justify-center min-h-[120px]">
      <div ref={ref} />
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";

  let inTable = false;
  let tableRows: string[] = [];

  const parseInline = (text: string) => {
    return text.split('`').map((part, i) => {
      if (i % 2 === 1) return <code key={i} className="bg-primary/10 px-1.5 py-0.5 rounded text-primary font-mono text-xs border border-primary/20">{part}</code>;

      const boldParts = part.split('**');
      if (boldParts.length > 1) {
        return boldParts.map((boldPart, j) => (
          j % 2 === 1 ? <strong key={j} className="text-foreground font-bold">{boldPart}</strong> : boldPart
        ));
      }
      return part;
    });
  };

  const flushTable = (key: string | number) => {
    if (tableRows.length >= 2) {
      const headerLine = tableRows[0]!;
      const dataRows = tableRows.slice(2);
      const parseCells = (row: string) => row.split("|").filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
      const headers = parseCells(headerLine);

      renderedElements.push(
        <div key={`table-${key}`} className="my-8 overflow-x-auto rounded-2xl border border-border/20 bg-black/10 shadow-2xl shadow-black/20">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 border-b border-border/10">
                {headers.map((h, i) => (
                  <th key={i} className="px-6 py-4 font-bold text-primary tracking-wider uppercase text-[10px] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/5">
              {dataRows.map((row, i) => {
                const cells = parseCells(row);
                return (
                  <tr key={i} className="hover:bg-primary/5 transition-colors">
                    {cells.map((cell, j) => (
                      <td key={j} className="px-6 py-4 text-foreground-muted whitespace-nowrap">
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    tableRows = [];
    inTable = false;
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith("```")) {
      if (inTable) flushTable(index);
      if (inCodeBlock) {
        const code = codeBuffer.join("\n").trim();
        if (codeLang === "mermaid") {
          renderedElements.push(<Mermaid key={`mermaid-${index}`} chart={code} />);
        } else {
          renderedElements.push(
            <pre key={`code-${index}`} className="p-6 bg-black/60 rounded-xl border border-border/30 overflow-x-auto shadow-inner my-6 font-mono text-sm leading-relaxed text-primary-muted group relative">
              <code className="block">{code}</code>
            </pre>
          );
        }
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (line.trim().startsWith("|")) {
      inTable = true;
      tableRows.push(line.trim());
      return;
    } else if (inTable && line.trim().length === 0) {
      flushTable(index);
    }

    if (line.startsWith("# ")) {
      renderedElements.push(<H1 key={index} className="text-4xl font-extrabold mt-12 mb-6 border-none text-foreground">{line.slice(2)}</H1>);
    } else if (line.startsWith("## ")) {
      renderedElements.push(<H2 key={index} className="text-2xl font-bold mt-10 mb-4 border-none border-b border-border/10 pb-2 text-foreground/90">{line.slice(3)}</H2>);
    } else if (line.startsWith("### ")) {
      renderedElements.push(<H3 key={index} className="text-xl font-semibold mt-8 mb-3 text-foreground/80">{line.slice(4)}</H3>);
    } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      renderedElements.push(
        <div key={index} className="flex items-start gap-3 my-3 pl-4 animate-in fade-in slide-in-from-left-2 duration-500">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0 opacity-60" />
          <div className="text-foreground-muted leading-relaxed flex-1">{parseInline(line.trim().slice(2))}</div>
        </div>
      );
    } else if (line.startsWith("> ")) {
      renderedElements.push(
        <div key={index} className="border-l-4 border-primary/30 bg-primary/5 p-6 rounded-r-xl my-8 italic text-foreground-muted/90 shadow-sm">
          {parseInline(line.slice(2))}
        </div>
      );
    } else if (line.trim().length > 0) {
      renderedElements.push(<p key={index} className="text-foreground-muted leading-relaxed my-6 text-base">{parseInline(line)}</p>);
    }
  });

  if (inTable) flushTable('final');
  return <div className="space-y-2">{renderedElements}</div>;
}

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
  | "/docs"
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
  { to: "/docs", label: "Documentation", description: "Architecture diagrams, styling guides, and theming docs." },
  { to: "/playground", label: "Playground", description: "Docking, reducer flow, and workbench state." },
] as const;



const supportRows: readonly SupportRow[] = [
  {
    area: "synthex-ui root",
    web: "Supported",
    native: "Supported",
    notes: "Platform-specific entry points expose a shared consumer API.",
  },
  {
    area: "synthex-ui/components",
    web: "Supported",
    native: "Supported",
    notes: "Core controls ship from a shared variant contract with web and native implementations.",
  },
  {
    area: "synthex-ui/primitives",
    web: "Supported",
    native: "Supported",
    notes: "Layout primitives, surfaces, and scroll primitives are available on both targets.",
  },
  {
    area: "synthex-ui/theme",
    web: "Supported",
    native: "Supported",
    notes: "Semantic tokens drive CSS variables on web and style-safe values on native.",
  },
  {
    area: "synthex-ui/icons",
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
    path: "synthex-ui/components",
    description: "High-usage controls such as Button, Card, Input, Tabs, Badge, Separator, and Typography helpers.",
    examples: ["Button", "Card", "Input", "Tabs"],
  },
  {
    path: "synthex-ui/primitives",
    description: "Cross-platform structural primitives for layout, spacing, surfaces, and scrollable regions.",
    examples: ["Box", "Stack", "Inline", "Grid"],
  },
  {
    path: "synthex-ui/layout",
    description: "Generic app-shell helpers that stay separate from the advanced docking system.",
    examples: ["AppShell", "Pane", "PanelFrame", "Section"],
  },
  {
    path: "synthex-ui/hooks",
    description: "Cross-platform helpers for controllable state, disclosure, platform branching, and motion preferences.",
    examples: ["useControllableState", "useDisclosure", "usePlatformValue"],
  },
  {
    path: "synthex-ui/icons",
    description: "Named icon contract for product chrome so app teams do not import the vendor icon package directly.",
    examples: ["Icon", "AddIcon", "UndoIcon", "RedoIcon"],
  },
  {
    path: "synthex-ui/theme",
    description: "Theme provider, token presets, theme creation utilities, and typed theme contracts.",
    examples: ["ThemeProvider", "createTheme", "lightTheme", "darkTheme"],
  },
  {
    path: "synthex-ui/styles.css",
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
    title: "synthex-ui",
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

const roadmapItems = [
  {
    title: "Component surface",
    status: "Done",
    summary: "The core shadcn-scale component surface is now in the library and visible in the web preview.",
    bullets: [
      "Inputs, overlays, navigation, data display, utility controls, charts, tables, and sidebar primitives ship from the public package.",
      "The docs gallery exercises the exported components instead of showing static placeholders.",
    ],
  },
  {
    title: "Package and release flow",
    status: "Done",
    summary: "The monorepo now has a real publish path with verified artifacts and CI enforcement.",
    bullets: [
      "Public packages have export maps, package metadata, README files, license files, and pack smoke checks.",
      "CI runs typecheck, test, build, release verification, and npm pack verification on push and pull request.",
    ],
  },
  {
    title: "Workbench integration",
    status: "Active",
    summary: "The live workbench is in place and usable, but it still has room to become more expressive and more plugin-driven.",
    bullets: [
      "The preview validates split, tab, resize, undo, redo, selection, and serialization behavior against the real engine.",
      "The next refinement is deeper panel-plugin examples and broader professional-oriented scenarios.",
    ],
  },
  {
    title: "Cross-platform confidence",
    status: "Active",
    summary: "The shared API is in place across web and native, and the next effort is to keep tightening parity and smoke coverage.",
    bullets: [
      "Native exports and theme behavior are already wired through the package surface.",
      "The next step is broader native-focused verification rather than more surface-area churn.",
    ],
  },
  {
    title: "Publish readiness",
    status: "Next",
    summary: "The repo is prepared for publication, with the final remaining step being authenticated npm release execution.",
    bullets: [
      "Run the ordered public publish command once npm credentials are available on this machine.",
      "Keep the release checks green before each public release.",
    ],
  },
] as const;
const defaultAccentPreset: AccentPresetName = "blue";

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return window.localStorage.getItem("synthex-preview-mode") === "dark" ? "dark" : "light";
  });
  const [accentPreset, setAccentPreset] = useState<AccentPresetName>(() => {
    if (typeof window === "undefined") return defaultAccentPreset;
    const storedValue = window.localStorage.getItem("synthex-preview-accent");
    return storedValue && storedValue in accentPresets
      ? (storedValue as AccentPresetName)
      : defaultAccentPreset;
  });
  const [radius, setRadius] = useState<number>(() => {
    if (typeof window === "undefined") return 1.0;
    const stored = window.localStorage.getItem("synthex-preview-radius");
    return stored ? parseFloat(stored) : 1.0;
  });
  const [navQuery, setNavQuery] = useControllableState({
    defaultValue: "",
  });

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

  useEffect(() => {
    window.localStorage.setItem("synthex-preview-radius", radius.toString());
  }, [radius]);

  const themeOverrides = useMemo(() => ({
    radius: {
      sm: Math.round(6 * radius),
      md: Math.round(8 * radius),
      lg: Math.round(12 * radius),
      xl: Math.round(16 * radius),
      pill: 999,
    }
  }), [radius]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [location.pathname]);

  return (
    <ThemeProvider mode={mode} accentPreset={accentPreset} theme={themeOverrides}>
      <div className="preview-site flex min-h-screen w-full">
        <SidebarProvider defaultOpen={true}>
          <AppSidebar
            mode={mode}
            setMode={setMode}
            accentPreset={accentPreset}
            setAccentPreset={setAccentPreset}
            radius={radius}
            setRadius={setRadius}
          />

          <SidebarInset className="preview-mobile-inset flex flex-col min-h-screen">
            {/* Topbar visible strictly on mobile */}
            <div className="preview-mobile-topbar md:hidden flex-none">
              <SidebarTrigger />
              <span className="preview-mobile-breadcrumb ml-2">
                {navItems.find((n) => n.to === location.pathname)?.label ?? "Overview"}
              </span>
            </div>

            <main className={`preview-main relative flex flex-1 w-full flex-col ${location.pathname === "/playground" ? "p-0 overflow-hidden" : "p-6 md:p-8"}`}>
              <Routes>
                <Route
                  path="/"
                  element={<Dashboard onNavigate={navigate} />}
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
                <Route path="/playground" element={<Builder />} />
                <Route path="/docs" element={<DocumentationSection />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
}

function Dashboard({ onNavigate }: { readonly onNavigate: (to: RoutePath) => void }) {
  const [searchValue, setSearchValue] = useState("");

  const metrics = [
    { label: "Total Components", value: 51, icon: "🧩", description: "in the latest release", trend: { value: "+3", type: "positive" as const } },
    { label: "Packages", value: 5, icon: "📦", description: "Managed by Bun workspaces" },
    { label: "Core Hooks", value: 11, icon: "🪝", description: "Cross-platform abstractions" },
    { label: "Total Commits", value: 85, icon: "🔥", description: "this week", trend: { value: "+12", type: "positive" as const } },
  ];

  const chartData = [
    { month: "Jan", value: 40 }, { month: "Feb", value: 30 }, { month: "Mar", value: 80 },
    { month: "Apr", value: 40 }, { month: "May", value: 60 }, { month: "Jun", value: 20 },
    { month: "Jul", value: 50 }, { month: "Aug", value: 90 }, { month: "Sep", value: 60 },
    { month: "Oct", value: 70 }, { month: "Nov", value: 85 }, { month: "Dec", value: 100 }
  ];

  const allUpdates = [
    { title: "feat: apply flagship premium UI, glassmorphism...", user: "Luseefor", time: "10 hours ago", initials: "LF" },
    { title: "feat: introduce collapsible AppSidebar", user: "Luseefor", time: "10 hours ago", initials: "LF" },
    { title: "feat: implement shared hooks, icons, and primiti...", user: "Luseefor", time: "10 hours ago", initials: "LF" },
    { title: "feat: add UPDATE_PANEL action", user: "Luseefor", time: "10 hours ago", initials: "LF" },
    { title: "style: redesign desktop sidebar", user: "Luseefor", time: "15 hours ago", initials: "LF" },
  ];

  const filteredUpdates = useMemo(() => {
    if (!searchValue) return allUpdates;
    const term = searchValue.toLowerCase();
    return allUpdates.filter(u =>
      u.title.toLowerCase().includes(term) ||
      u.user.toLowerCase().includes(term)
    );
  }, [searchValue, allUpdates]);

  const filteredMetrics = useMemo(() => {
    if (!searchValue) return metrics;
    const term = searchValue.toLowerCase();
    return metrics.filter(m => m.label.toLowerCase().includes(term));
  }, [searchValue, metrics]);

  const filteredComponents = useMemo(() => {
    if (!searchValue) return [];
    const term = searchValue.toLowerCase();
    return GALLERY_COMPONENTS.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term)
    );
  }, [searchValue]);

  return (
    <DashboardView
      metrics={filteredMetrics}
      chartData={chartData}
      updates={filteredUpdates}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      componentResults={filteredComponents}
      onDocumentationClick={() => onNavigate("/docs" as RoutePath)}
      onRepositoryClick={() => window.open("https://github.com/Luseefor/synthex-ui", "_blank")}
    />
  );
}

function DocumentationSection() {
  const [selectedDocId, setSelectedDocId] = useState<string>(DOCS_METADATA[0]?.id || "");

  const selectedDoc = useMemo(() =>
    DOCS_METADATA.find(d => d.id === selectedDocId) || DOCS_METADATA[0],
    [selectedDocId]
  );

  if (!selectedDoc) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)] gap-8 relative">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="sticky top-24 space-y-8">
          <div className="space-y-4">
            <H2 className="text-3xl font-extrabold tracking-tight border-none p-0 m-0">Documentation</H2>
            <Muted className="text-sm">Comprehensive guides and architectural system specs.</Muted>
          </div>

          <nav className="space-y-1">
            {DOCS_METADATA.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${selectedDocId === doc.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-foreground-muted hover:bg-surface-muted/50 hover:text-foreground translate-x-0 hover:translate-x-1"
                  }`}
              >
                <span className="shrink-0 opacity-70">
                  {doc.icon === "bookOpen" && <BookOpenIcon className="h-4 w-4" />}
                  {doc.icon === "activity" && <ActivityIcon className="h-4 w-4" />}
                  {doc.icon === "layout" && <GridIcon className="h-4 w-4" />}
                  {doc.icon === "file" && <FileIcon className="h-4 w-4" />}
                  {doc.icon === "palette" && <PaletteIcon className="h-4 w-4" />}
                  {doc.icon === "terminal" && <TerminalIcon className="h-4 w-4" />}
                </span>
                <span className="truncate">{doc.title}</span>
                {selectedDocId === doc.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/40 animate-pulse" />
                )}
              </button>
            ))}
          </nav>

          <Card className="glass-premium border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-primary">Need help?</p>
              <p className="text-[10px] text-foreground-muted/80 leading-relaxed">Join our discord community for live support or check our GitHub discussions.</p>
              <Button variant="outline" size="sm" className="w-full h-8 text-[10px] bg-background/50 border-primary/20 hover:bg-primary/10">Community Discord</Button>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 min-w-0">
        <ScrollArea className="h-full pr-4">
          <article className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.2em] mb-4 opacity-70">
              <span className="inline-block w-4 h-[1px] bg-primary/40 mr-1" />
              Synthex UI / Docs / {selectedDoc.id}.md
            </div>

            <div className="glass-premium border-border/40 rounded-3xl p-8 lg:p-12 shadow-2xl shadow-black/20">
              <MarkdownRenderer content={selectedDoc.content} />

              <div className="mt-16 pt-8 border-t border-border/20 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-foreground-muted">Last updated: Mar 2026</p>
                  <p className="text-[10px] text-foreground-muted/60 lowercase">commit: 54ec80d</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-surface-muted/30 border-border/40 hover:bg-primary/5 hover:border-primary/30"
                  onClick={() => window.open(`https://github.com/Luseefor/synthex-ui/edit/main/docs/${selectedDoc.id}.md`, "_blank")}
                >
                  Edit on GitHub
                </Button>
              </div>
            </div>
          </article>
        </ScrollArea>
      </main>
    </div>
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
    <div className="preview-metric-card glass-premium rounded-xl p-4 border border-border/40 hover-premium">
      <Small className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold mb-1 block">{label}</Small>
      <strong className="text-foreground tracking-tight">{value}</strong>
    </div>
  );
}

function PackageScopeSection() {
  return (
    <section id="packages" className="preview-section relative">
      <div className="preview-section-heading lg:text-center lg:items-center max-w-2xl mx-auto mb-16">
        <H2 className="text-fh-lg mb-4 border-none">Package model</H2>
        <Muted className="text-lg">
          The repo is organized around explicit package responsibilities instead of mixing generic UI, adapters, and engine internals together.
        </Muted>
      </div>

      <div className="preview-card-grid preview-card-grid-2">
        {packageCards.map((item) => (
          <Card key={item.title} variant="interactive" className="preview-package-card hover-premium glass-premium border-border-strong group">
            <CardHeader>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{item.title}</CardTitle>
              <CardDescription className="text-base text-muted-foreground/80 mt-2">{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card variant="muted" className="mt-12 glass-premium border-border/50 max-w-4xl mx-auto overflow-hidden relative">
        <div className="bg-glow-radial absolute -inset-1/2 opacity-20 pointer-events-none" />
        <CardContent className="preview-stack-sm text-center py-8 relative z-10 flex flex-col items-center">
          <Small className="uppercase tracking-widest text-primary font-bold">Why this structure matters</Small>
          <Muted className="text-base leading-relaxed mt-2 max-w-2xl">
            <code className="text-foreground/80 font-bold bg-muted/50 px-1 py-0.5 rounded">synthex-ui</code> stays generic and reusable. <code className="text-foreground/80 font-bold bg-muted/50 px-1 py-0.5 rounded">@synthex/react-web</code> owns the dockable renderer. <code className="text-foreground/80 font-bold bg-muted/50 px-1 py-0.5 rounded">@synthex/core</code> stays framework-agnostic. That split is what keeps the repo scalable instead of collapsing into a flat UI kit.
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
              <Field>
                <FieldLabel htmlFor="component-invalid">Validation example</FieldLabel>
                <FieldContent>
                  <Input
                    id="component-invalid"
                    invalid
                    placeholder="Missing required value"
                  />
                  <FieldError>This field is required before publishing.</FieldError>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="component-notes">Notes</FieldLabel>
                <FieldContent>
                  <Textarea id="component-notes" uiSize="sm" placeholder="Compact note field" />
                  <FieldDescription>Compact multiline inputs share the same field rhythm.</FieldDescription>
                </FieldContent>
              </Field>
              <Field className="preview-form-grid-span-2">
                <FieldLabel>Active workspace</FieldLabel>
                <FieldContent>
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
                  <FieldDescription>Single-line controls now share one chrome system.</FieldDescription>
                </FieldContent>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Form fields, dates, and structured input</CardTitle>
            <CardDescription>
              Calendar, date picker, OTP input, slider, and form-field composition now ship from the library instead of being assembled ad hoc in product code.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <Form className="preview-stack-md">
              <div className="preview-gallery-grid preview-gallery-grid-2">
                <FormField
                  name="release-date"
                  description="Pick the public release date shown in the changelog."
                >
                  <FormItem>
                    <FormLabel>Release date</FormLabel>
                    <FormControl>
                      <DatePicker placeholder="Select a date" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField
                  name="verification-code"
                  description="A compact OTP flow for one-time confirmations."
                >
                  <FormItem>
                    <FormLabel>Verification code</FormLabel>
                    <FormControl>
                      <InputOTP defaultValue="10">
                        <InputOTPGroup>
                          <InputOTPSlot index={0} aria-label="OTP digit 1" />
                          <InputOTPSlot index={1} aria-label="OTP digit 2" />
                          <InputOTPSeparator />
                          <InputOTPSlot index={2} aria-label="OTP digit 3" />
                          <InputOTPSlot index={3} aria-label="OTP digit 4" />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <FormField
                name="publish-threshold"
                description="Slider primitives cover fine-grained numeric controls without leaving the shared UI layer."
              >
                <FormItem>
                  <FormLabel>Publish readiness threshold</FormLabel>
                  <FormControl>
                    <Slider aria-label="Publish readiness threshold" defaultValue={[78]} />
                  </FormControl>
                  <FormDescription />
                </FormItem>
              </FormField>
            </Form>

            <div className="preview-gallery-grid preview-gallery-grid-2">
              <Card variant="muted">
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>Month navigation and date selection from the same exported surface.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar defaultValue={new Date(2026, 2, 12)} />
                </CardContent>
              </Card>

              <Card variant="muted">
                <CardHeader>
                  <CardTitle>Form validation wiring</CardTitle>
                  <CardDescription>Labels, descriptions, and errors share ids automatically through the form contract.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldSet>
                    <FieldLegend>Release package</FieldLegend>
                    <Form>
                      <FormField
                        name="package-name"
                        description="This package id will be used in generated docs and release notes."
                        error="Package name is required."
                      >
                        <FormItem>
                          <FormLabel>Package name</FormLabel>
                          <FormControl>
                            <Input placeholder="synthex-ui" />
                          </FormControl>
                          <FormDescription />
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </Form>
                  </FieldSet>
                </CardContent>
              </Card>
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
            <CardTitle>Structured navigation</CardTitle>
            <CardDescription>
              Menubar and navigation menu primitives cover app-shell navigation without pulling those patterns into custom product code.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarLabel>Workspace</MenubarLabel>
                  <MenubarItem>New design</MenubarItem>
                  <MenubarItem>Open recent</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Export netlist</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarLabel>Panels</MenubarLabel>
                  <MenubarItem>Show inspector</MenubarItem>
                  <MenubarItem>Toggle console</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>

            <NavigationMenu defaultValue="guides">
              <NavigationMenuList>
                <NavigationMenuItem value="guides">
                  <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem value="api">
                  <NavigationMenuTrigger>API</NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuLink href="#installation">Install</NavigationMenuLink>
              </NavigationMenuList>
              <NavigationMenuItem value="guides">
                <NavigationMenuContent>
                  <div className="preview-stack-sm">
                    <Small>Guides overview</Small>
                    <Muted>
                      Structure package docs, engine integration notes, and workspace setup in a consistent top-level navigation system.
                    </Muted>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem value="api">
                <NavigationMenuContent>
                  <div className="preview-stack-sm">
                    <Small>API focus</Small>
                    <Muted>
                      Navigation content panels can expose grouped entry points without collapsing the page into a giant link list.
                    </Muted>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenu>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Structural and advanced composition</CardTitle>
            <CardDescription>
              The newer composition layer includes breadcrumb, aspect ratio, collapsible regions, alert dialogs, drawers, hover cards, and grouped toggles.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#overview">Docs</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Advanced composition</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="preview-gallery-grid preview-gallery-grid-2">
              <AspectRatio ratio={16 / 9}>
                <div className="preview-context-surface h-full">
                  <div className="preview-stack-sm">
                    <Small>Aspect ratio</Small>
                    <Muted>Media and canvas placeholders can stay stable while the layout resizes around them.</Muted>
                  </div>
                </div>
              </AspectRatio>

              <div className="preview-stack-md">
                <ToggleGroup type="multiple" defaultValue={["grid", "snap"]}>
                  <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
                  <ToggleGroupItem value="snap">Snap</ToggleGroupItem>
                  <ToggleGroupItem value="guides">Guides</ToggleGroupItem>
                </ToggleGroup>

                <Collapsible defaultOpen>
                  <div className="preview-stack-sm">
                    <CollapsibleTrigger className="inline-flex w-fit items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-3 py-2 text-sm font-medium text-[color:var(--sx-color-foreground)]">
                      Release notes
                    </CollapsibleTrigger>
                    <CollapsibleContent className="preview-hook-card">
                      <Muted>
                        Collapsible regions help compress secondary guidance without losing structure inside inspectors or docs pages.
                      </Muted>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </div>
            </div>

            <div className="preview-chip-row">
              <HoverCard>
                <HoverCardTrigger className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium text-[color:var(--sx-color-foreground)]">
                  Hover card
                </HoverCardTrigger>
                <HoverCardContent className="preview-stack-sm">
                  <Small>Release metadata</Small>
                  <Muted>Use hover cards for lightweight context that should not open a full popover or dialog.</Muted>
                </HoverCardContent>
              </HoverCard>

              <Drawer>
                <DrawerTrigger className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium text-[color:var(--sx-color-foreground)]">
                  Open drawer
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Workspace settings</DrawerTitle>
                    <DrawerDescription>
                      Drawers work for broader configuration flows that still want a lighter footprint than a full page transition.
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <Button variant="ghost">Cancel</Button>
                    <Button>Save changes</Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              <AlertDialog>
                <AlertDialogTrigger className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium text-[color:var(--sx-color-foreground)]">
                  Open alert dialog
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete generated preview cache?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This confirms a destructive action while keeping the same shared overlay contract as the rest of the library.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Delete cache</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Resizable panels</CardTitle>
            <CardDescription>
              The library now ships its own resizable panel primitives, so multi-pane editing layouts do not need a separate dependency just to split space.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <ResizablePanelGroup direction="horizontal" style={{ minHeight: 280 }}>
              <ResizablePanel defaultSize={58}>
                <div className="preview-resizable-pane">
                  <Small>Primary pane</Small>
                  <H3>Editor surface</H3>
                  <Muted>
                    Use this area for the main document, canvas, or form surface.
                  </Muted>
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={42}>
                <div className="preview-resizable-pane">
                  <Small>Secondary pane</Small>
                  <H3>Inspector</H3>
                  <Muted>
                    Supporting context can stay adjacent without hardcoding a product-specific split implementation.
                  </Muted>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
            <Small className="text-[color:var(--sx-color-foreground-muted)]">
              Drag the center handle to resize the panes. This is separate from the specialized workbench renderer and belongs to the shared UI layer.
            </Small>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Carousel</CardTitle>
            <CardDescription>
              Carousel is now part of the shared surface for step-through content, release walkthroughs, and sequential previews.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <Carousel>
              <CarouselContent>
                <CarouselItem>
                  <Card variant="muted">
                    <CardHeader>
                      <CardTitle>Step 1</CardTitle>
                      <CardDescription>Install the workspace packages and base stylesheet.</CardDescription>
                    </CardHeader>
                  </Card>
                </CarouselItem>
                <CarouselItem>
                  <Card variant="muted">
                    <CardHeader>
                      <CardTitle>Step 2</CardTitle>
                      <CardDescription>Compose UI primitives and form layers from the exported design system surface.</CardDescription>
                    </CardHeader>
                  </Card>
                </CarouselItem>
                <CarouselItem>
                  <Card variant="muted">
                    <CardHeader>
                      <CardTitle>Step 3</CardTitle>
                      <CardDescription>Wire the layout engine into the workbench route once the product shell is stable.</CardDescription>
                    </CardHeader>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <div className="preview-chip-row">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Charts</CardTitle>
            <CardDescription>
              The chart family keeps lightweight visualization primitives inside the shared UI package without introducing a separate charting dependency.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <div className="preview-gallery-grid preview-gallery-grid-2">
              <ChartContainer>
                <div className="preview-stack-sm">
                  <ChartLegend
                    series={[
                      {
                        key: "usage",
                        label: "Usage",
                        data: [
                          { label: "Mon", value: 24 },
                          { label: "Tue", value: 32 },
                          { label: "Wed", value: 28 },
                          { label: "Thu", value: 36 },
                        ],
                      },
                    ]}
                  />
                  <LineChart
                    ariaLabel="Usage trend"
                    height={220}
                    series={[
                      {
                        key: "usage",
                        label: "Usage",
                        data: [
                          { label: "Mon", value: 24 },
                          { label: "Tue", value: 32 },
                          { label: "Wed", value: 28 },
                          { label: "Thu", value: 36 },
                        ],
                      },
                    ]}
                  />
                </div>
              </ChartContainer>

              <ChartContainer>
                <div className="preview-stack-sm">
                  <ChartLegend
                    series={[
                      {
                        key: "core",
                        label: "Core",
                        data: [
                          { label: "Q1", value: 12 },
                          { label: "Q2", value: 18 },
                          { label: "Q3", value: 20 },
                        ],
                      },
                      {
                        key: "ui",
                        label: "UI",
                        color: "var(--sx-color-accent)",
                        data: [
                          { label: "Q1", value: 14 },
                          { label: "Q2", value: 16 },
                          { label: "Q3", value: 22 },
                        ],
                      },
                    ]}
                  />
                  <BarChart
                    ariaLabel="Package adoption"
                    height={220}
                    series={[
                      {
                        key: "core",
                        label: "Core",
                        data: [
                          { label: "Q1", value: 12 },
                          { label: "Q2", value: 18 },
                          { label: "Q3", value: 20 },
                        ],
                      },
                      {
                        key: "ui",
                        label: "UI",
                        color: "var(--sx-color-accent)",
                        data: [
                          { label: "Q1", value: 14 },
                          { label: "Q2", value: 16 },
                          { label: "Q3", value: 22 },
                        ],
                      },
                    ]}
                  />
                </div>
              </ChartContainer>
            </div>

            <div className="preview-gallery-grid preview-gallery-grid-2">
              <ChartContainer>
                <div className="preview-stack-sm">
                  <AreaChart
                    ariaLabel="Stability area"
                    height={200}
                    series={[
                      {
                        key: "stability",
                        label: "Stability",
                        data: [
                          { label: "Jan", value: 40 },
                          { label: "Feb", value: 52 },
                          { label: "Mar", value: 58 },
                          { label: "Apr", value: 62 },
                        ],
                      },
                    ]}
                  />
                </div>
              </ChartContainer>

              <ChartTooltip>
                <ChartTooltipContent
                  label="Current slice"
                  items={[
                    { label: "UI package", value: "62%", color: "var(--sx-color-primary)" },
                    { label: "Core engine", value: "54%", color: "var(--sx-color-accent)" },
                  ]}
                />
              </ChartTooltip>
            </div>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Utility components</CardTitle>
            <CardDescription>
              Smaller building blocks matter too: grouped actions, inline keyboard hints, empty states, grouped inputs, and native-select fallbacks now live in the library.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <div className="preview-chip-row">
              <ButtonGroup>
                <Button size="sm">Build</Button>
                <Button size="sm" variant="outline">Preview</Button>
                <Button size="sm" variant="ghost">Publish</Button>
              </ButtonGroup>
              <Kbd>cmd+k</Kbd>
              <Spinner />
            </div>

            <div className="preview-gallery-grid preview-gallery-grid-2">
              <Field>
                <Label htmlFor="utility-origin">Origin</Label>
                <InputGroup>
                  <InputGroupAddon>https://</InputGroupAddon>
                  <Input
                    id="utility-origin"
                    className="border-0 shadow-none focus-visible:ring-0"
                    placeholder="synthex.dev"
                  />
                </InputGroup>
              </Field>

              <Field>
                <NativeSelect label="Native select fallback" defaultValue="stable">
                  <option value="stable">Stable channel</option>
                  <option value="next">Next channel</option>
                  <option value="nightly">Nightly channel</option>
                </NativeSelect>
              </Field>
            </div>

            <div className="preview-gallery-grid preview-gallery-grid-2">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No release snapshots</EmptyTitle>
                  <EmptyDescription>
                    Generate a preview build to inspect package output and release artifacts.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>

              <Item>
                <ItemTitle>Release checklist</ItemTitle>
                <ItemDescription>
                  Utility item rows work well for compact lists, callouts, and selection summaries.
                </ItemDescription>
              </Item>
            </div>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Scroll area</CardTitle>
            <CardDescription>
              Scroll areas are available directly from the component surface for bounded inspectors, logs, and nested documentation panes.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <ScrollArea
              background="surfaceMuted"
              border
              padding="md"
              radius="lg"
              style={{ height: 220 }}
            >
              <div className="preview-stack-sm">
                <Small>Release notes</Small>
                <Muted>Scroll areas keep dense content readable inside cards, panes, and side panels.</Muted>
                <Muted>Use them for long filters, inspector fields, console output, and schema summaries.</Muted>
                <Muted>The same primitive already powers the layout helpers, and is now visible directly in the component surface too.</Muted>
                <Muted>Because it is a shared primitive, it stays theme-aware across both light and dark routes.</Muted>
                <Muted>This is the final parity piece from the current shadcn index.</Muted>
                <Muted>Teams can also use scroll areas for dense release notes, migration steps, and compact operational logs.</Muted>
                <Muted>Unlike page-level scrolling, a bounded scroll area keeps surrounding controls and headings anchored in place.</Muted>
                <Muted>The goal is to isolate long content inside the correct surface rather than forcing the whole card or route to grow.</Muted>
                <Muted>This demo now intentionally overflows so you can verify the component interaction directly in the preview.</Muted>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Command surfaces and searchable choice</CardTitle>
            <CardDescription>
              Command and combobox primitives now ship from the library, so palette-style workflows and searchable selection controls stay aligned with the rest of the package.
            </CardDescription>
          </CardHeader>
          <CardContent className="preview-stack-md">
            <div className="preview-gallery-grid preview-gallery-grid-2">
              <Command>
                <CommandInput placeholder="Search actions, files, or panels" />
                <CommandList>
                  <CommandGroup heading="Workbench">
                    <CommandItem value="open-schematic">Open schematic editor</CommandItem>
                    <CommandItem value="show-properties">Show properties inspector</CommandItem>
                  </CommandGroup>
                  <CommandGroup heading="Navigation">
                    <CommandItem value="toggle-console">Toggle console</CommandItem>
                    <CommandItem value="export-netlist">Export netlist</CommandItem>
                  </CommandGroup>
                  <CommandEmpty>No matching action.</CommandEmpty>
                </CommandList>
              </Command>

              <div className="preview-stack-md">
                <div className="preview-field-stack">
                  <Label htmlFor="workspace-combobox">Workspace combobox</Label>
                  <Combobox defaultValue="schematic" placeholder="Choose a workspace">
                    <ComboboxTrigger id="workspace-combobox">
                      <ComboboxValue />
                    </ComboboxTrigger>
                    <ComboboxContent>
                      <ComboboxInput placeholder="Filter workspaces" />
                      <ComboboxList>
                        <ComboboxEmpty>No workspace found.</ComboboxEmpty>
                        <ComboboxItem value="schematic">Schematic editor</ComboboxItem>
                        <ComboboxItem value="pcb">PCB layout</ComboboxItem>
                        <ComboboxItem value="waveform">Waveform viewer</ComboboxItem>
                        <ComboboxItem value="console">Command console</ComboboxItem>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
                <Muted>
                  These two surfaces share the same filtering model: the command palette handles action discovery, while combobox keeps searchable selection lightweight for inspectors and toolbars.
                </Muted>
              </div>
            </div>
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
            <DataTable
              columns={[
                { id: "package", header: "Package", accessor: "package" },
                { id: "surface", header: "Surface", accessor: "surface" },
                { id: "status", header: "Status", accessor: "status", align: "right" },
              ]}
              data={[
                { package: "synthex-ui", surface: "Design system", status: "Stable" },
                { package: "@synthex/core", surface: "Layout engine", status: "Stable" },
                { package: "@synthex/react-web", surface: "Workbench adapter", status: "Ready" },
                { package: "@synthex/web-preview", surface: "Docs app", status: "Internal" },
              ]}
              pageSize={4}
              searchKey="package"
              searchPlaceholder="Filter packages"
            />

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
                  <TableCell>synthex-ui</TableCell>
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
              The library now includes dialog, popover, dropdown, context, sheet, and tooltip primitives so product flows can build overlays without reaching for an external UI framework.
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

              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border-strong)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium tracking-[-0.01em] text-[color:var(--sx-color-foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-[background-color,border-color,color] duration-150 hover:bg-[color:var(--sx-color-surface-muted)]">
                  Open dropdown
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Panel actions</DropdownMenuLabel>
                  <DropdownMenuItem>Open schematic</DropdownMenuItem>
                  <DropdownMenuItem>Focus console</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Export snapshot</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="preview-chip-row">
              <Tooltip>
                <TooltipTrigger className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-dashed border-[color:var(--sx-color-border-strong)] px-4 text-sm font-medium text-[color:var(--sx-color-foreground-muted)]">
                  Hover for tooltip
                </TooltipTrigger>
                <TooltipContent>Tooltips are for short contextual hints, not full interactions.</TooltipContent>
              </Tooltip>
            </div>
            <ContextMenu>
              <ContextMenuTrigger className="preview-context-surface">
                <div className="preview-stack-sm">
                  <Small>Context menu surface</Small>
                  <Muted>
                    Right click this surface to open contextual actions for the focused panel.
                  </Muted>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel>Selection</ContextMenuLabel>
                <ContextMenuItem>Rename panel</ContextMenuItem>
                <ContextMenuItem>Duplicate panel</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Close panel</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <Muted>
              This is the baseline overlay layer. Menus, sheets, and popovers can build on the same contract without polluting the core engine packages.
            </Muted>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Toast and sonner notifications</CardTitle>
            <CardDescription>
              Transient feedback now ships from the library too, including the provider, viewport, and a simple sonner-style hook layer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToastPreview />
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

function ToastPreview() {
  return (
    <ToastProvider>
      <ToastPreviewContent />
      <Toaster />
    </ToastProvider>
  );
}

function SidebarPreview() {
  return (
    <SidebarProvider defaultOpen>
      <SidebarPreviewContent />
    </SidebarProvider>
  );
}

function SidebarPreviewContent() {
  const { open } = useSidebar();
  const [activeItem, setActiveItem] = useState<"overview" | "packages" | "theme">("overview");

  const previewCopy = {
    overview: {
      body: "Use the sidebar shell for application-level navigation while the inset owns the primary page body.",
      eyebrow: "Overview",
      title: "Product navigation",
    },
    packages: {
      body: "Package-level sections stay navigable without binding the shell to one documentation site or workbench surface.",
      eyebrow: "Packages",
      title: "Workspace packages",
    },
    theme: {
      body: "Theme sections can live in the same shell while keeping tokens, accent presets, and mode controls within reach.",
      eyebrow: "Theme",
      title: "Theme controls",
    },
  } as const;

  const current = previewCopy[activeItem];

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        minHeight: "20rem",
      }}
    >
      <Sidebar>
        <SidebarHeader>
          <div className="preview-stack-sm">
            {open ? <Small>Navigation</Small> : null}
            <SidebarTrigger>{open ? "Collapse" : "Expand"}</SidebarTrigger>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    active={activeItem === "overview"}
                    onClick={() => setActiveItem("overview")}
                  >
                    Overview
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    active={activeItem === "packages"}
                    onClick={() => setActiveItem("packages")}
                  >
                    Packages
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    active={activeItem === "theme"}
                    onClick={() => setActiveItem("theme")}
                  >
                    Theme
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="preview-stack-md" style={{ minHeight: "100%", padding: "1.25rem" }}>
          <Small>{current.eyebrow}</Small>
          <H3>{current.title}</H3>
          <Muted>{current.body}</Muted>
        </div>
      </SidebarInset>
    </div>
  );
}

function ToastPreviewContent() {
  const { toast } = useSonner();

  return (
    <div className="preview-stack-md">
      <div className="preview-chip-row">
        <Button
          onClick={() =>
            toast({
              title: "Build finished",
              description: "Declaration files, bundles, and preview assets were generated successfully.",
              variant: "success",
            })
          }
        >
          Show success toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Review required",
              description: "One workspace package still has unpublished changes.",
              actionLabel: "Inspect",
              variant: "warning",
            })
          }
        >
          Show action toast
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            toast({
              title: "Publish blocked",
              description: "One package is missing a release tag and cannot be published yet.",
              actionLabel: "Resolve",
              variant: "destructive",
            })
          }
        >
          Show critical toast
        </Button>
      </div>
      <Muted>
        The preview uses the same exported provider and hook that consumers will use in their own app shell.
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

      <div className="preview-card-grid preview-card-grid-2">
        <Card variant="elevated" className="preview-install-card">
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

        <Card variant="default" className="preview-install-card">
          <CardHeader>
            <CardTitle>Minimal usage</CardTitle>
            <CardDescription>
              Import from the real public surface, not from internal package paths.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`import "synthex-ui/styles.css";\nimport { Button } from "synthex-ui/components";\nimport { ThemeProvider } from "synthex-ui/theme";\n\nexport function Example() {\n  return (\n    <ThemeProvider>\n      <Button>Run</Button>\n    </ThemeProvider>\n  );\n}`}
            />
          </CardContent>
        </Card>

        <Card variant="default" className="preview-install-card">
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

        <Card variant="default" className="preview-install-card">
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

function BuilderSection() {
  return (
    <section id="playground" className="flex flex-1 w-full h-full flex-col overflow-hidden m-0 p-0 absolute inset-0">
      <Builder />
    </section>
  );
}

function RoadmapSection() {
  return (
    <section id="roadmap" className="preview-section preview-section-last">
      <div className="preview-section-heading">
        <H2>Roadmap</H2>
        <Muted>
          This section now reflects the actual state of the repo: what is already done, what is actively being refined, and what remains before public release.
        </Muted>
      </div>

      <div className="preview-roadmap-grid">
        {roadmapItems.map((item) => (
          <Card key={item.title} variant="interactive">
            <CardContent className="preview-roadmap-card">
              <div className="preview-roadmap-item">
                <div className="preview-roadmap-title-row">
                  <H3>{item.title}</H3>
                  <Badge
                    variant={
                      item.status === "Done"
                        ? "default"
                        : item.status === "Active"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
                <Muted>{item.summary}</Muted>
              </div>
              <div className="preview-stack-sm">
                {item.bullets.map((bullet) => (
                  <div key={bullet} className="preview-roadmap-bullet">
                    <span className="preview-roadmap-dot" />
                    <span>{bullet}</span>
                  </div>
                ))}
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
