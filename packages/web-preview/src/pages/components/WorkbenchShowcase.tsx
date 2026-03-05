import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useSidebar,
} from "synthex-ui/components";
import { useMobile } from "synthex-ui/hooks";
import { ShowcaseSection } from "./ShowcaseSection";

function SidebarShellDemo() {
  const { open } = useSidebar();

  return (
    <div className="preview-shell-demo preview-shell-demo-compact">
      <Sidebar className="!static !h-full">
        <SidebarHeader><SidebarTrigger /></SidebarHeader>
        <SidebarContent className="overflow-hidden">
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem><SidebarMenuButton active><span className="preview-demo-icon">◫</span>{open ? <span>Overview</span> : null}</SidebarMenuButton></SidebarMenuItem>
                <SidebarMenuItem><SidebarMenuButton><span className="preview-demo-icon">◩</span>{open ? <span>Releases</span> : null}</SidebarMenuButton></SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className={open ? "px-2 py-1 text-xs text-[color:var(--sx-color-foreground-muted)]" : "hidden"}>
            Workspace footer
          </div>
        </SidebarFooter>
        {open ? <SidebarRail /> : null}
      </Sidebar>
      <SidebarInset className="!min-h-0 !h-full">
        <div className="preview-pane h-full">Workbench content</div>
      </SidebarInset>
    </div>
  );
}

function SidebarShellMobileFallback() {
  return (
    <div className="preview-pane preview-section-stack">
      <div className="preview-inline-row">
        <span className="preview-demo-icon">◫</span>
        <strong>Sidebar preview</strong>
      </div>
      <div className="preview-list-card">
        <div className="text-[color:var(--sx-color-foreground-muted)]">
          Sidebar interactions are shown in the main app shell on mobile.
        </div>
        <div className="preview-chip-row">
          <span className="preview-trigger">Overview</span>
          <span className="preview-trigger">Releases</span>
          <span className="preview-trigger">Settings</span>
        </div>
      </div>
    </div>
  );
}

export function WorkbenchShowcase() {
  const isMobile = useMobile();

  return (
    <ShowcaseSection
      title="Workbench surfaces"
      description="Command palette, shell navigation, tabs, separators, and table primitives grouped into a tighter app-shell style preview."
      includes={["Tabs", "Command", "Sidebar", "Table", "Separator"]}
    >
      <div className="preview-section-stack">
        <div className="preview-grid-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="preview-pane">Overview panel content</TabsContent>
            <TabsContent value="api" className="preview-pane">API panel content</TabsContent>
          </Tabs>
          <Command>
            <CommandInput aria-label="Command palette" />
            <CommandList>
              <CommandGroup heading="Actions">
                <CommandItem value="publish-preview">Publish preview</CommandItem>
                <CommandItem value="open-docs">Open docs</CommandItem>
              </CommandGroup>
              <CommandEmpty>No matching command.</CommandEmpty>
            </CommandList>
          </Command>
        </div>
        <Separator />
        <div className="preview-grid-2">
          <div className="preview-pane">
            <Table>
              <TableCaption>Release surfaces</TableCaption>
              <TableHeader>
                <TableRow><TableHead>Package</TableHead><TableHead>Status</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>synthex-ui</TableCell><TableCell>Stable</TableCell></TableRow>
                <TableRow><TableCell>@luseefor/synthex-core</TableCell><TableCell>Stable</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
          {isMobile ? <SidebarShellMobileFallback /> : <SidebarProvider defaultOpen><SidebarShellDemo /></SidebarProvider>}
        </div>
        <div className="preview-pane">
          <Table>
            <TableHeader><TableRow><TableHead>Check</TableHead><TableHead>State</TableHead></TableRow></TableHeader>
            <TableBody><TableRow><TableCell>Build</TableCell><TableCell>Passing</TableCell></TableRow></TableBody>
            <TableFooter><TableRow><TableCell>Total</TableCell><TableCell>1 surface</TableCell></TableRow></TableFooter>
          </Table>
        </div>
        <div className="preview-inline-row"><Button variant="outline">Shell action</Button><Button>Primary action</Button></div>
      </div>
    </ShowcaseSection>
  );
}
