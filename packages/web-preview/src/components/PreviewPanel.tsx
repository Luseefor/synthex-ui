import type { PanelNode } from "@synthex/core";
import {
  Badge,
  Button,
  DataTable,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollArea,
  Skeleton,
  BarChart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "synthex-ui/components";
import {
  FileIcon,
  FolderIcon,
  SearchIcon,
  ActivityIcon,
  BookOpenIcon,
  LayoutIcon,
  TerminalIcon,
  PaletteIcon,
} from "synthex-ui/icons";

export interface PreviewPanelProps {
  readonly panel: PanelNode;
  readonly isSelected: boolean;
}

interface PanelBlueprint {
  readonly icon: any;
  readonly kicker: string;
}

const panelBlueprints: Record<string, PanelBlueprint> = {
  navigator: { kicker: "Explorer", icon: FolderIcon },
  search: { kicker: "Search", icon: SearchIcon },
  document: { kicker: "Editor", icon: BookOpenIcon },
  preview: { kicker: "Runtime", icon: ActivityIcon },
  inspector: { kicker: "Properties", icon: PaletteIcon },
  outline: { kicker: "Structure", icon: LayoutIcon },
  console: { kicker: "Debug", icon: TerminalIcon },
  activity: { kicker: "Session", icon: ActivityIcon },
  notes: { kicker: "Notes", icon: BookOpenIcon },
};

export function PreviewPanel({ panel, isSelected }: PreviewPanelProps) {
  const blueprint = panelBlueprints[panel.panelType] ?? { kicker: "Panel", icon: FolderIcon };
  const Icon = blueprint.icon;

  return (
    <div
      className={`flex h-full flex-col overflow-hidden bg-[color:var(--sx-color-surface)] transition-all duration-300 ${isSelected ? "ring-2 ring-inset ring-[color:var(--sx-color-primary)] shadow-[0_0_20px_rgba(var(--sx-color-primary-rgb),0.15)] z-10" : "opacity-95"
        }`}
    >
      <div className="flex items-center justify-between border-b border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-background-subtle)]/40 px-3 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className={`p-1 rounded-md transition-colors ${isSelected ? "bg-[color:var(--sx-color-primary)]/10 text-[color:var(--sx-color-primary)]" : "bg-muted/50 text-muted-foreground"}`}>
            <Icon size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[color:var(--sx-color-foreground-muted)]/70">
              {blueprint.kicker}
            </span>
            <h4 className="text-[11px] font-bold tracking-tight leading-none mt-0.5">{panel.title ?? panel.panelType}</h4>
          </div>
        </div>
        <Badge variant="secondary" className="h-4 px-1.5 text-[7px] font-black uppercase tracking-widest border-none bg-muted/50 text-muted-foreground">
          {panel.panelType}
        </Badge>
      </div>

      <div className="flex-1 overflow-hidden">{renderPanelBody(panel)}</div>
    </div>
  );
}

function renderPanelBody(panel: PanelNode) {
  switch (panel.panelType) {
    case "navigator":
      return (
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            <div className="flex items-center gap-2 rounded-md bg-[color:var(--sx-color-surface-muted)] px-2 py-1 text-[11px] font-medium">
              <FolderIcon size={12} />
              <span>src</span>
            </div>
            <div className="ml-3 space-y-0.5 border-l border-[color:var(--sx-color-border)] pl-2">
              {[
                { name: "App.tsx", active: true },
                { name: "theme.ts", active: false },
                { name: "utils.ts", active: false },
              ].map((file) => (
                <button
                  key={file.name}
                  className={`flex w-full items-center gap-2 rounded-sm px-2 py-1 text-[11px] transition-colors hover:bg-[color:var(--sx-color-surface-muted)] ${file.active ? "bg-[color:var(--sx-color-primary)]/10 text-[color:var(--sx-color-primary)]" : ""
                    }`}
                >
                  <FileIcon size={12} />
                  <span>{file.name}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      );

    case "search":
      return (
        <div className="flex h-full flex-col p-3 space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted p-1.5 rounded border border-dashed">
            <SearchIcon size={12} />
            <span>results for "surface"</span>
          </div>
          <DataTable
            columns={[
              { id: "file", header: "File", accessor: "file" },
              { id: "line", header: "Line", accessor: "line", align: "right" },
            ]}
            data={[
              { file: "colors.ts", line: 124 },
              { file: "theme.ts", line: 45 },
              { file: "button.tsx", line: 202 },
            ]}
            pageSize={3}
          />
        </div>
      );

    case "preview":
      return (
        <div className="flex h-full flex-col p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/50 p-2 text-center">
              <div className="text-[9px] font-bold text-muted-foreground uppercase">Revenue</div>
              <div className="text-sm font-bold">$12.4k</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-2 text-center">
              <div className="text-[9px] font-bold text-muted-foreground uppercase">Active</div>
              <div className="text-sm font-bold">1.2k</div>
            </div>
          </div>

          <div className="h-32">
            <BarChart
              series={[
                {
                  key: "revenue",
                  label: "Revenue",
                  data: [
                    { label: "Mon", value: 400 },
                    { label: "Tue", value: 300 },
                    { label: "Wed", value: 500 },
                    { label: "Thu", value: 200 },
                    { label: "Fri", value: 600 },
                  ],
                },
              ]}
              height={128}
            />
          </div>
        </div>
      );

    case "console":
      return (
        <ScrollArea className="h-full bg-slate-950 font-mono text-[10px] text-slate-400">
          <div className="p-3 space-y-1">
            <div className="text-emerald-500">[22:15:01] Compiled successfully</div>
            <div>[22:15:04] Engine ready - layout initialized</div>
            <div className="text-amber-500">[22:15:12] Warning: slow render in ViewPort</div>
            <div>[22:15:20] User selected node: document</div>
          </div>
        </ScrollArea>
      );

    case "inspector":
      return (
        <ScrollArea className="h-full">
          <Accordion type="multiple" defaultValue={["style"]}>
            <AccordionItem value="style">
              <AccordionTrigger className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider">Style</AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <span className="text-muted-foreground">Background</span>
                  <span className="font-mono">surface</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <span className="text-muted-foreground">Opacity</span>
                  <span className="font-mono">1.0</span>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="layout">
              <AccordionTrigger className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider">Layout</AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <Skeleton className="h-20 w-full rounded-md" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      );

    default:
      return (
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div className="space-y-4">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 mx-auto" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </div>
            <Button size="sm" variant="outline">Initialize Panel</Button>
          </div>
        </div>
      );
  }
}
