import React, { useState, useMemo, useCallback, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import {
    Accordion, AccordionContent, AccordionItem, AccordionTrigger,
    Alert, AlertDescription, AlertTitle,
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
    AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
    Tooltip, TooltipTrigger, TooltipContent,
    Popover, PopoverTrigger, PopoverContent,
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
    ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator,
    HoverCard, HoverCardTrigger, HoverCardContent,
    Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
    Collapsible, CollapsibleTrigger, CollapsibleContent,
    Avatar, AvatarFallback, Badge, Button, ButtonGroup,
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
    Checkbox, Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue,
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
    DataTable, DatePicker, Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
    Empty, EmptyDescription, EmptyHeader, EmptyTitle,
    H1, H2, H3, Input, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, Kbd, Label, Lead,
    Menubar, MenubarContent, MenubarItem, MenubarLabel, MenubarMenu, MenubarSeparator, MenubarTrigger,
    Muted, NativeSelect, NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
    Progress, RadioGroup, RadioGroupItem, ResizableHandle, ResizablePanel, ResizablePanelGroup,
    ScrollArea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
    Skeleton, Slider, Small, Spinner, Switch, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, Toggle, ToggleGroup, ToggleGroupItem,
    ToastProvider, Toaster, useToast,
} from "synthex-ui/components";

/* ─────────────────────────────────────────────────────────
   Component catalog — every synthex-ui component
   ───────────────────────────────────────────────────────── */

interface ComponentDef {
    type: string;
    label: string;
    icon: string;
    category: string;
}

const COMPONENTS: ComponentDef[] = [
    // Layout
    { type: "Container", label: "Container", icon: "⬜", category: "Layout" },
    { type: "Spacer", label: "Spacer", icon: "↕", category: "Layout" },
    { type: "Separator", label: "Separator", icon: "—", category: "Layout" },
    { type: "AspectRatio", label: "Aspect Ratio", icon: "⊡", category: "Layout" },
    { type: "ScrollArea", label: "Scroll Area", icon: "↕", category: "Layout" },
    { type: "Resizable", label: "Resizable", icon: "⇲", category: "Layout" },
    // Typography
    { type: "Heading", label: "Heading", icon: "H", category: "Typography" },
    { type: "Text", label: "Paragraph", icon: "T", category: "Typography" },
    { type: "Lead", label: "Lead Text", icon: "L", category: "Typography" },
    { type: "Muted", label: "Muted Text", icon: "M", category: "Typography" },
    { type: "Small", label: "Small Text", icon: "s", category: "Typography" },
    { type: "Kbd", label: "Keyboard", icon: "⌘", category: "Typography" },
    // Buttons & Actions
    { type: "Button", label: "Button", icon: "▶", category: "Actions" },
    { type: "ButtonGroup", label: "Button Group", icon: "▶▶", category: "Actions" },
    { type: "Toggle", label: "Toggle", icon: "⇄", category: "Actions" },
    { type: "ToggleGroup", label: "Toggle Group", icon: "⇄⇄", category: "Actions" },
    // Form Controls
    { type: "Input", label: "Input", icon: "✎", category: "Form" },
    { type: "Textarea", label: "Textarea", icon: "☰", category: "Form" },
    { type: "Checkbox", label: "Checkbox", icon: "☑", category: "Form" },
    { type: "Switch", label: "Switch", icon: "◐", category: "Form" },
    { type: "RadioGroup", label: "Radio Group", icon: "◉", category: "Form" },
    { type: "Select", label: "Select", icon: "▾", category: "Form" },
    { type: "Combobox", label: "Combobox", icon: "⊞", category: "Form" },
    { type: "DatePicker", label: "Date Picker", icon: "📅", category: "Form" },
    { type: "Slider", label: "Slider", icon: "⊶", category: "Form" },
    { type: "InputOTP", label: "OTP Input", icon: "●●●", category: "Form" },
    { type: "NativeSelect", label: "Native Select", icon: "▾", category: "Form" },
    { type: "Label", label: "Label", icon: "🏷", category: "Form" },
    { type: "Form", label: "Form", icon: "📋", category: "Form" },
    // Data Display
    { type: "Card", label: "Card", icon: "▢", category: "Data Display" },
    { type: "Badge", label: "Badge", icon: "●", category: "Data Display" },
    { type: "Avatar", label: "Avatar", icon: "👤", category: "Data Display" },
    { type: "Image", label: "Image", icon: "▣", category: "Data Display" },
    { type: "Table", label: "Table", icon: "▦", category: "Data Display" },
    { type: "DataTable", label: "Data Table", icon: "▤", category: "Data Display" },
    { type: "Calendar", label: "Calendar", icon: "📅", category: "Data Display" },
    { type: "Progress", label: "Progress", icon: "◔", category: "Data Display" },
    { type: "Skeleton", label: "Skeleton", icon: "▒", category: "Data Display" },
    { type: "Spinner", label: "Spinner", icon: "◌", category: "Data Display" },
    { type: "Empty", label: "Empty State", icon: "∅", category: "Data Display" },
    { type: "Carousel", label: "Carousel", icon: "◁▷", category: "Data Display" },
    // Navigation
    { type: "Tabs", label: "Tabs", icon: "⊞", category: "Navigation" },
    { type: "Accordion", label: "Accordion", icon: "≡", category: "Navigation" },
    { type: "Breadcrumb", label: "Breadcrumb", icon: "›", category: "Navigation" },
    { type: "Pagination", label: "Pagination", icon: "«»", category: "Navigation" },
    { type: "NavigationMenu", label: "Nav Menu", icon: "☰", category: "Navigation" },
    { type: "Menubar", label: "Menubar", icon: "≡", category: "Navigation" },
    { type: "Sidebar", label: "Sidebar", icon: "⊏", category: "Navigation" },
    // Overlays
    { type: "Dialog", label: "Dialog", icon: "□", category: "Overlay" },
    { type: "AlertDialog", label: "Alert Dialog", icon: "⚠", category: "Overlay" },
    { type: "Sheet", label: "Sheet", icon: "⊐", category: "Overlay" },
    { type: "Drawer", label: "Drawer", icon: "⊏", category: "Overlay" },
    { type: "Popover", label: "Popover", icon: "💬", category: "Overlay" },
    { type: "HoverCard", label: "Hover Card", icon: "🃏", category: "Overlay" },
    { type: "Tooltip", label: "Tooltip", icon: "💡", category: "Overlay" },
    { type: "DropdownMenu", label: "Dropdown", icon: "▾", category: "Overlay" },
    { type: "ContextMenu", label: "Context Menu", icon: "⊞", category: "Overlay" },
    { type: "Command", label: "Command", icon: "⌘", category: "Overlay" },
    { type: "Toast", label: "Toast", icon: "🔔", category: "Overlay" },
    // Feedback
    { type: "Alert", label: "Alert", icon: "ℹ", category: "Feedback" },
    { type: "Collapsible", label: "Collapsible", icon: "⊟", category: "Feedback" },
];

const CATEGORIES = ["Layout", "Typography", "Actions", "Form", "Data Display", "Navigation", "Overlay", "Feedback"];

const GRID = 20;

export interface BuilderNode {
    id: string;
    type: string;
    props: Record<string, any>;
    x: number;
    y: number;
    w: number;
    h: number;
}

function snap(v: number) { return Math.round(v / GRID) * GRID; }

function toStringList(value: unknown, fallback: string[] = []) {
    return Array.isArray(value) ? value.map((item) => String(item)) : fallback;
}

function toTableData(n: BuilderNode) {
    const columns = toStringList(n.props.columns, ["Column"]);
    const rows = Array.isArray(n.props.rows) ? n.props.rows : [];

    return {
        columns,
        data: rows.map((row, rowIndex) => {
            const cells = Array.isArray(row) ? row : [];
            return columns.reduce<Record<string, string>>((acc, column, columnIndex) => {
                acc[column] = String(cells[columnIndex] ?? `Row ${rowIndex + 1}`);
                return acc;
            }, {});
        }),
    };
}

function defaults(type: string): { props: Record<string, any>; w: number; h: number } {
    const m: Record<string, { props: Record<string, any>; w: number; h: number }> = {
        Container: { props: { border: true }, w: 400, h: 200 },
        Spacer: { props: {}, w: 200, h: 40 },
        Separator: { props: {}, w: 300, h: 4 },
        AspectRatio: { props: { ratio: "16/9" }, w: 320, h: 180 },
        ScrollArea: { props: { items: ["Release notes", "Design tokens", "Runtime adapters", "Theming hooks", "Preview surfaces", "CLI integration", "Migration guide"] }, w: 320, h: 220 },
        Resizable: { props: { panes: ["Canvas", "Inspector"] }, w: 420, h: 220 },
        Heading: { props: { text: "Heading", level: "h2" }, w: 300, h: 60 },
        Text: { props: { text: "Paragraph text goes here." }, w: 360, h: 80 },
        Lead: { props: { text: "Lead text — prominent intro paragraph." }, w: 400, h: 60 },
        Muted: { props: { text: "Muted helper text." }, w: 260, h: 40 },
        Small: { props: { text: "Small caption text." }, w: 200, h: 30 },
        Kbd: { props: { text: "⌘K" }, w: 60, h: 36 },
        Button: { props: { text: "Button", variant: "default" }, w: 140, h: 48 },
        ButtonGroup: { props: { items: ["Prev", "Action", "Next"] }, w: 320, h: 48 },
        Toggle: { props: { text: "Toggle" }, w: 100, h: 40 },
        ToggleGroup: { props: { items: ["A", "B", "C"], mode: "multiple", activeItems: ["A"] }, w: 240, h: 40 },
        Input: { props: { placeholder: "Enter text...", label: "Label" }, w: 280, h: 68 },
        Textarea: { props: { placeholder: "Write...", label: "Label" }, w: 280, h: 120 },
        Checkbox: { props: { label: "Accept terms" }, w: 180, h: 36 },
        Switch: { props: { label: "Dark mode" }, w: 160, h: 36 },
        RadioGroup: { props: { options: ["Option 1", "Option 2"], value: "Option 1" }, w: 220, h: 100 },
        Select: { props: { options: ["Option 1", "Option 2"], placeholder: "Select option", value: "Option 1" }, w: 240, h: 44 },
        Combobox: { props: { options: ["Option 1", "Option 2"], placeholder: "Search options", value: "Option 1" }, w: 240, h: 44 },
        DatePicker: { props: { placeholder: "Pick a date" }, w: 240, h: 44 },
        Slider: { props: { value: 50 }, w: 240, h: 36 },
        InputOTP: { props: { value: "12", length: 4 }, w: 220, h: 50 },
        NativeSelect: { props: { options: ["Option 1", "Option 2"], value: "Option 1" }, w: 220, h: 44 },
        Label: { props: { text: "Label" }, w: 120, h: 28 },
        Form: { props: {}, w: 360, h: 200 },
        Card: { props: { title: "Card Title", description: "Description" }, w: 320, h: 120 },
        Badge: { props: { text: "Badge", variant: "default" }, w: 100, h: 36 },
        Avatar: { props: { fallback: "JD" }, w: 48, h: 48 },
        Image: { props: { src: "https://placehold.co/800x400/1a1a2e/e0e0e0?text=Image", alt: "" }, w: 400, h: 220 },
        Table: { props: { columns: ["Name", "Role", "Status"], rows: [["Alice", "Admin", "Active"], ["Bob", "User", "Pending"]] }, w: 420, h: 180 },
        DataTable: { props: { columns: ["Name", "Role", "Status"], rows: [["Alice", "Admin", "Active"], ["Bob", "User", "Pending"]], searchKey: "Name" }, w: 460, h: 280 },
        Calendar: { props: {}, w: 280, h: 280 },
        Progress: { props: { value: 65 }, w: 240, h: 20 },
        Skeleton: { props: {}, w: 240, h: 48 },
        Spinner: { props: {}, w: 40, h: 40 },
        Empty: { props: { title: "No data", description: "There is nothing to show yet." }, w: 300, h: 160 },
        Carousel: { props: { items: ["Slide one", "Slide two", "Slide three"] }, w: 400, h: 240 },
        Tabs: { props: { tabs: [{ id: "t1", label: "Tab 1", content: "Content 1" }, { id: "t2", label: "Tab 2", content: "Content 2" }] }, w: 360, h: 180 },
        Accordion: { props: { items: [{ id: "a1", title: "Section 1", content: "Content 1" }, { id: "a2", title: "Section 2", content: "Content 2" }] }, w: 360, h: 160 },
        Breadcrumb: { props: { items: ["Home", "Products", "Current"] }, w: 320, h: 36 },
        Pagination: { props: { pages: ["1", "2", "3"], activePage: "1" }, w: 320, h: 44 },
        NavigationMenu: { props: { items: ["Home", "About", "Contact"] }, w: 400, h: 44 },
        Menubar: { props: { items: ["File", "Edit", "View"] }, w: 300, h: 40 },
        Sidebar: { props: { items: ["Dashboard", "Settings", "Users"] }, w: 240, h: 300 },
        Dialog: { props: { trigger: "Open Dialog", title: "Dialog Title", description: "Dialog description." }, w: 300, h: 100 },
        AlertDialog: { props: { trigger: "Delete Item", title: "Are you sure?", description: "This cannot be undone." }, w: 300, h: 100 },
        Sheet: { props: { trigger: "Open Sheet", title: "Sheet Panel", description: "Slide-over panel.", content: "Sheet body content." }, w: 200, h: 80 },
        Drawer: { props: { trigger: "Open Drawer", title: "Drawer panel", description: "Bottom sheet content." }, w: 220, h: 80 },
        Popover: { props: { trigger: "Open Popover", title: "Popover", content: "Popover content." }, w: 200, h: 80 },
        HoverCard: { props: { trigger: "@synthex", title: "Synthex UI", description: "Cross-platform components." }, w: 200, h: 80 },
        Tooltip: { props: { trigger: "Hover me", content: "Tooltip text" }, w: 200, h: 60 },
        DropdownMenu: { props: { trigger: "Open Menu ▾", items: ["Edit", "Duplicate", "-", "Delete"] }, w: 200, h: 60 },
        ContextMenu: { props: { trigger: "Right Click Area", items: ["Edit", "Delete"] }, w: 200, h: 60 },
        Command: { props: { items: ["Open schematic", "Open console", "Export netlist"] }, w: 320, h: 220 },
        Toast: { props: { title: "Toast!", description: "This is a toast notification." }, w: 300, h: 80 },
        Alert: { props: { title: "Alert", description: "Something happened." }, w: 360, h: 80 },
        Collapsible: { props: { trigger: "Toggle content", content: "This is the collapsible content." }, w: 300, h: 100 },
    };
    return m[type] || { props: {}, w: 200, h: 60 };
}

/* ─────────────────────────────────────────────────────────
   Builder
   ───────────────────────────────────────────────────────── */

export function Builder() {
    const navigate = useNavigate();
    const [preview, setPreview] = useState(false);
    const [grid, setGrid] = useState(true);
    const [nodes, setNodes] = useState<BuilderNode[]>([]);
    const [selId, setSelId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const canvasRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const [stageSnapshot, setStageSnapshot] = useState({ width: 1200, height: 760 });
    const [previewScale, setPreviewScale] = useState(1);
    const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
    const [resize, setResize] = useState<{ id: string; sx: number; sy: number; sw: number; sh: number } | null>(null);

    const sel = useMemo(() => nodes.find((n) => n.id === selId) ?? null, [nodes, selId]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return COMPONENTS;
        return COMPONENTS.filter((c) => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }, [search]);

    const upd = useCallback((id: string, p: Partial<BuilderNode>) => setNodes((n) => n.map((x) => x.id === id ? { ...x, ...p } : x)), []);
    const updP = useCallback((id: string, p: Record<string, any>) => setNodes((n) => n.map((x) => x.id === id ? { ...x, props: { ...x.props, ...p } } : x)), []);
    const del = useCallback((id: string) => { setNodes((n) => n.filter((x) => x.id !== id)); setSelId((s) => s === id ? null : s); }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const t = e.dataTransfer.getData("sx/type");
        if (!t || !stageRef.current) return;
        const r = stageRef.current.getBoundingClientRect();
        const d = defaults(t);
        const node: BuilderNode = {
            id: `n${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
            type: t, props: d.props,
            x: Math.max(0, snap(e.clientX - r.left - d.w / 2)),
            y: Math.max(0, snap(e.clientY - r.top - d.h / 2)),
            w: d.w, h: d.h,
        };
        setNodes((n) => [...n, node]);
        setSelId(node.id);
    }, []);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!stageRef.current) return;
        const r = stageRef.current.getBoundingClientRect();
        if (drag) {
            upd(drag.id, { x: Math.max(0, snap(e.clientX - r.left - drag.ox)), y: Math.max(0, snap(e.clientY - r.top - drag.oy)) });
        }
        if (resize) {
            upd(resize.id, { w: Math.max(40, snap(resize.sw + e.clientX - resize.sx)), h: Math.max(20, snap(resize.sh + e.clientY - resize.sy)) });
        }
    }, [drag, resize, upd]);

    const onPointerUp = useCallback(() => { setDrag(null); setResize(null); }, []);

    useLayoutEffect(() => {
        if (preview || !stageRef.current) {
            return;
        }

        const updateSnapshot = () => {
            if (!stageRef.current) return;
            setStageSnapshot({
                width: Math.max(640, Math.round(stageRef.current.clientWidth)),
                height: Math.max(420, Math.round(stageRef.current.clientHeight)),
            });
        };

        updateSnapshot();

        const observer = new ResizeObserver(updateSnapshot);
        observer.observe(stageRef.current);
        return () => observer.disconnect();
    }, [preview]);

    useLayoutEffect(() => {
        if (!preview || !canvasRef.current) {
            setPreviewScale(1);
            return;
        }

        const updateScale = () => {
            if (!canvasRef.current) return;
            const bounds = canvasRef.current.getBoundingClientRect();
            const horizontal = (bounds.width - 48) / stageSnapshot.width;
            const vertical = (bounds.height - 48) / stageSnapshot.height;
            setPreviewScale(Math.min(horizontal, vertical, 1));
        };

        updateScale();

        const observer = new ResizeObserver(updateScale);
        observer.observe(canvasRef.current);
        return () => observer.disconnect();
    }, [preview, stageSnapshot.height, stageSnapshot.width]);

    return (
        <ToastProvider>
            <div className="bld">
                {/* Toolbar */}
                <header className="bld-tb">
                    <div className="bld-tb-l"><button className="bld-b" onClick={() => navigate("/")} style={{ marginRight: 4 }}>← Home</button><span className="bld-tb-logo">✦</span><span className="bld-tb-t">Synthex Builder</span><span className="bld-tb-c">{nodes.length}</span></div>
                    <div className="bld-tb-r">
                        <button className={`bld-b ${grid ? "bld-b-on" : ""}`} onClick={() => setGrid(!grid)}>{grid ? "⊞ Grid" : "⊟ Grid"}</button>
                        {!preview && nodes.length > 0 && <button className="bld-b bld-b-red" onClick={() => { setNodes([]); setSelId(null); }}>Clear</button>}
                        <button
                            className={`bld-b ${preview ? "bld-b-pri" : ""}`}
                            onClick={() => {
                                if (!preview && stageRef.current) {
                                    setStageSnapshot({
                                        width: Math.max(640, Math.round(stageRef.current.clientWidth)),
                                        height: Math.max(420, Math.round(stageRef.current.clientHeight)),
                                    });
                                }
                                setPreview(!preview);
                                setSelId(null);
                            }}
                        >
                            {preview ? "← Edit" : "▶ Preview"}
                        </button>
                    </div>
                </header>

                <div className="bld-bd">
                    {/* Left sidebar */}
                    {!preview && (
                        <aside className="bld-s bld-sl">
                            <div className="bld-sh">Components</div>
                            <div className="bld-ss">
                                <input className="bld-search" placeholder="Search components..." value={search} onChange={(e) => setSearch(e.target.value)} />
                                {CATEGORIES.map((cat) => {
                                    const items = filtered.filter((c) => c.category === cat);
                                    if (items.length === 0) return null;
                                    const col = !!collapsed[cat];
                                    return (
                                        <div key={cat} className="bld-cg">
                                            <button className="bld-ch" onClick={() => setCollapsed((p) => ({ ...p, [cat]: !col }))}>
                                                <span className="bld-ca">{col ? "▸" : "▾"}</span>{cat}<span className="bld-cc">{items.length}</span>
                                            </button>
                                            {!col && <div className="bld-cl">{items.map((c) => (
                                                <div key={c.type} draggable className="bld-di" onDragStart={(e) => { e.dataTransfer.setData("sx/type", c.type); e.dataTransfer.effectAllowed = "copy"; }}>
                                                    <span className="bld-dic">{c.icon}</span><span>{c.label}</span>
                                                </div>
                                            ))}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </aside>
                    )}

                    {/* Canvas */}
                    <main
                        ref={canvasRef}
                        className={`bld-cv ${preview ? "bld-cv-pv" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
                        onDrop={handleDrop}
                        onClick={() => !preview && setSelId(null)}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerLeave={onPointerUp}
                    >
                        <div className={`bld-cv-shell ${preview ? "bld-cv-shell-pv" : ""}`}>
                            <div
                                ref={stageRef}
                                className={`bld-stage ${grid && !preview ? "bld-stage-grid" : ""} ${preview ? "bld-stage-pv" : ""}`}
                            >
                                {preview ? (
                                    nodes.length > 0 ? (
                                        <div className="bld-preview-wrap">
                                            <div
                                                className="bld-preview-scale"
                                                style={{ transform: `scale(${previewScale})` }}
                                            >
                                                <div
                                                    className="bld-preview-frame"
                                                    style={{ width: stageSnapshot.width, height: stageSnapshot.height }}
                                                >
                                                    {nodes.map((n) => (
                                                        <CNode key={n.id} n={n} isSel={false} pv={true}
                                                            onSel={() => undefined}
                                                            onDrag={() => undefined}
                                                            onResize={() => undefined}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bld-mt"><div className="bld-mt-i">✦</div><div className="bld-mt-t">Nothing to preview</div><div className="bld-mt-d">Add components in edit mode to generate a preview.</div></div>
                                    )
                                ) : (
                                    <>
                                        {nodes.length === 0 && (
                                            <div className="bld-mt"><div className="bld-mt-i">✦</div><div className="bld-mt-t">Drop components anywhere</div><div className="bld-mt-d">Search &amp; drag from the left panel</div></div>
                                        )}
                                        {nodes.map((n) => (
                                            <CNode key={n.id} n={n} isSel={selId === n.id} pv={false}
                                                onSel={() => setSelId(n.id)}
                                                onDrag={(ox, oy) => setDrag({ id: n.id, ox, oy })}
                                                onResize={(sx, sy) => setResize({ id: n.id, sx, sy, sw: n.w, sh: n.h })}
                                            />
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* Right sidebar */}
                    {!preview && (
                        <aside className="bld-s bld-sr">
                            <div className="bld-sh"><span>Properties</span>{sel && <button className="bld-del" onClick={() => del(sel.id)}>Delete</button>}</div>
                            <div className="bld-ss">
                                {sel ? <Props n={sel} set={(p) => updP(sel.id, p)} upd={(p) => upd(sel.id, p)} /> : (
                                    <div className="bld-ns"><div className="bld-ns-i">⊡</div><div>Select an element</div></div>
                                )}
                            </div>
                        </aside>
                    )}
                </div>
                <style>{CSS}</style>
                <Toaster />
            </div>
        </ToastProvider>
    );
}

/* ─────────────────────────────────────────────────────────
   Canvas Node
   ───────────────────────────────────────────────────────── */

function CNode({ n, isSel, pv, offsetX = 0, offsetY = 0, onSel, onDrag, onResize }: {
    n: BuilderNode; isSel: boolean; pv: boolean;
    offsetX?: number; offsetY?: number;
    onSel: () => void; onDrag: (ox: number, oy: number) => void; onResize: (sx: number, sy: number) => void;
}) {
    return (
        <div
            style={{
                position: "absolute", left: n.x + offsetX, top: n.y + offsetY, width: n.w, height: n.type === "Separator" ? 4 : n.h,
                boxShadow: isSel ? "0 0 0 2px var(--sx-color-primary), 0 0 0 4px rgba(59,130,246,0.12)" : "none",
                borderRadius: "var(--sx-radius-md)", cursor: pv ? "default" : "move", zIndex: isSel ? 10 : 1,
                overflow: "hidden",
            }}
            onClick={(e) => {
                if (pv) return;
                e.stopPropagation();
            }}
            onPointerDown={(e) => {
                if (pv) return;
                e.stopPropagation(); onSel();
                const r = e.currentTarget.getBoundingClientRect();
                onDrag(e.clientX - r.left, e.clientY - r.top);
            }}
        >
            <div style={{ width: "100%", height: "100%", pointerEvents: pv ? "auto" : "none" }}>
                <Content n={n} pv={pv} />
            </div>
            {isSel && !pv && <div className="bld-rz" onPointerDown={(e) => { e.stopPropagation(); onResize(e.clientX, e.clientY); }} />}
        </div>
    );
}

function Content({ n, pv }: { n: BuilderNode; pv: boolean }) {
    const f: CSSProperties = { width: "100%", height: "100%" };
    const items = toStringList(n.props.items);
    const options = toStringList(n.props.options);
    const activeItems = toStringList(n.props.activeItems);
    const table = toTableData(n);
    switch (n.type) {
        case "Container": return <div style={{ ...f, border: n.props.border ? "1px dashed var(--sx-color-border-strong)" : "none", borderRadius: 12, background: n.props.backgroundColor || "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{!pv && <span style={{ color: "var(--sx-color-foreground-muted)", fontSize: 12, opacity: 0.5 }}>Container</span>}</div>;
        case "Heading":
            return <div style={{ ...f, display: "flex", alignItems: "center" }}>{n.props.level === "h1" ? <H1>{n.props.text || "Heading"}</H1> : n.props.level === "h3" || n.props.level === "h4" ? <H3>{n.props.text || "Heading"}</H3> : <H2>{n.props.text || "Heading"}</H2>}</div>;
        case "Text": return <p style={{ ...f, margin: 0, lineHeight: 1.7, color: "var(--sx-color-foreground-muted)", overflow: "hidden" }}>{n.props.text}</p>;
        case "Lead": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Lead>{n.props.text}</Lead></div>;
        case "Muted": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Muted>{n.props.text}</Muted></div>;
        case "Small": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Small>{n.props.text}</Small></div>;
        case "Kbd": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Kbd>{n.props.text || "⌘K"}</Kbd></div>;
        case "Button": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Button variant={n.props.variant}>{n.props.text || "Button"}</Button></div>;
        case "ButtonGroup": return <div style={{ ...f, display: "flex", alignItems: "center" }}><ButtonGroup>{(items.length ? items : ["Prev", "Action", "Next"]).map((item, i) => <Button key={item} variant={i === 1 ? "default" : "outline"} size="sm">{item}</Button>)}</ButtonGroup></div>;
        case "Toggle": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Toggle>{n.props.text || "Toggle"}</Toggle></div>;
        case "ToggleGroup":
            return (
                <div style={{ ...f, display: "flex", alignItems: "center" }}>
                    <ToggleGroup type={n.props.mode === "single" ? "single" : "multiple"} defaultValue={n.props.mode === "single" ? activeItems[0] : activeItems}>
                        {(items.length ? items : ["A", "B", "C"]).map((item) => <ToggleGroupItem key={item} value={item}>{item}</ToggleGroupItem>)}
                    </ToggleGroup>
                </div>
            );
        case "Input": return <div style={{ ...f, display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>{n.props.label && <Label>{n.props.label}</Label>}<Input placeholder={n.props.placeholder} readOnly /></div>;
        case "Textarea": return <div style={{ ...f, display: "flex", flexDirection: "column", gap: 4 }}>{n.props.label && <Label>{n.props.label}</Label>}<Textarea placeholder={n.props.placeholder} readOnly style={{ flex: 1 }} /></div>;
        case "Checkbox": return <div style={{ ...f, display: "flex", alignItems: "center", gap: 8 }}><Checkbox /><Label>{n.props.label || "Checkbox"}</Label></div>;
        case "Switch": return <div style={{ ...f, display: "flex", alignItems: "center", gap: 8 }}><Switch /><Label>{n.props.label || "Switch"}</Label></div>;
        case "RadioGroup":
            return (
                <div style={{ ...f, display: "flex", alignItems: "center" }}>
                    <RadioGroup defaultValue={n.props.value || options[0]}>
                        {(options.length ? options : ["Option 1", "Option 2"]).map((option) => <RadioGroupItem key={option} value={option}>{option}</RadioGroupItem>)}
                    </RadioGroup>
                </div>
            );
        case "Slider": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Slider defaultValue={[n.props.value || 50]} /></div>;
        case "Select":
            return (
                <div style={{ ...f, display: "flex", alignItems: "center" }}>
                    <Select defaultValue={n.props.value} placeholder={n.props.placeholder || "Select option"}>
                        <SelectTrigger aria-label={`${n.id}-select`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(options.length ? options : ["Option 1", "Option 2"]).map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            );
        case "Combobox":
            return (
                <div style={{ ...f, display: "flex", alignItems: "center" }}>
                    <Combobox defaultValue={n.props.value} placeholder={n.props.placeholder || "Search options"}>
                        <ComboboxTrigger aria-label={`${n.id}-combobox`}>
                            <ComboboxValue />
                        </ComboboxTrigger>
                        <ComboboxContent>
                            <ComboboxInput aria-label={`${n.id}-combobox-search`} />
                            <ComboboxList>
                                <ComboboxEmpty>No results.</ComboboxEmpty>
                                {(options.length ? options : ["Option 1", "Option 2"]).map((option) => <ComboboxItem key={option} value={option}>{option}</ComboboxItem>)}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            );
        case "DatePicker": return <div style={{ ...f, display: "flex", alignItems: "center" }}><DatePicker placeholder={n.props.placeholder || "Pick a date"} /></div>;
        case "InputOTP":
            return (
                <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <InputOTP defaultValue={n.props.value || ""} length={Number(n.props.length) || 4}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} aria-label="OTP digit 1" />
                            <InputOTPSlot index={1} aria-label="OTP digit 2" />
                            <InputOTPSeparator />
                            <InputOTPSlot index={2} aria-label="OTP digit 3" />
                            <InputOTPSlot index={3} aria-label="OTP digit 4" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
            );
        case "NativeSelect":
            return (
                <div style={{ ...f, display: "flex", alignItems: "center" }}>
                    <NativeSelect defaultValue={n.props.value || options[0]}>
                        {(options.length ? options : ["Option 1", "Option 2"]).map((option) => <option key={option} value={option}>{option}</option>)}
                    </NativeSelect>
                </div>
            );
        case "Label": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Label>{n.props.text || "Label"}</Label></div>;
        case "Form": return <div style={{ ...f, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-lg)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}><Label>Email</Label><Input placeholder="you@example.com" readOnly /><Button>Submit</Button></div>;
        case "Card":
            return (
                <Card style={f}>
                    <CardHeader>
                        <CardTitle>{n.props.title}</CardTitle>
                        <CardDescription>{n.props.description}</CardDescription>
                    </CardHeader>
                </Card>
            );
        case "Badge": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Badge variant={n.props.variant}>{n.props.text || "Badge"}</Badge></div>;
        case "Avatar": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Avatar><AvatarFallback>{n.props.fallback || "?"}</AvatarFallback></Avatar></div>;
        case "Image": return <img src={n.props.src} alt={n.props.alt} style={{ ...f, objectFit: "cover", borderRadius: 8 }} />;
        case "Table":
            return (
                <div style={{ ...f, overflow: "auto" }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {table.columns.map((column) => <TableHead key={column}>{column}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {table.data.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {table.columns.map((column) => <TableCell key={column}>{row[column]}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            );
        case "DataTable":
            return (
                <div style={{ ...f, overflow: "auto" }}>
                    <DataTable
                        columns={table.columns.map((column, index) => ({
                            id: column.toLowerCase().replace(/\s+/g, "-"),
                            header: column,
                            accessor: column,
                            align: index === table.columns.length - 1 ? "right" : "left",
                        }))}
                        data={table.data}
                        pageSize={Math.max(1, Math.min(5, table.data.length || 1))}
                        searchKey={String(n.props.searchKey || table.columns[0] || "")}
                        searchPlaceholder="Filter rows"
                    />
                </div>
            );
        case "Calendar": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-lg)", fontSize: 13, color: "var(--sx-color-foreground-muted)" }}>📅 Calendar</div>;
        case "Progress": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Progress value={n.props.value || 65} /></div>;
        case "Skeleton": return <div style={{ ...f, display: "flex", flexDirection: "column", gap: 8 }}><Skeleton className="w-full" style={{ height: 16, borderRadius: 6 }} /><Skeleton style={{ height: 16, width: "70%", borderRadius: 6 }} /></div>;
        case "Spinner": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>;
        case "Empty":
            return (
                <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Empty>
                        <EmptyHeader>
                            <EmptyTitle>{n.props.title || "No data"}</EmptyTitle>
                            <EmptyDescription>{n.props.description || "There is nothing to show yet."}</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            );
        case "Carousel":
            return (
                <div style={f}>
                    <Carousel>
                        <CarouselContent>
                            {(items.length ? items : ["Slide one", "Slide two"]).map((item) => (
                                <CarouselItem key={item}>
                                    <Card>
                                        <CardContent className="flex min-h-[8rem] items-center justify-center text-sm">
                                            {item}
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                            <CarouselPrevious />
                            <CarouselNext />
                        </div>
                    </Carousel>
                </div>
            );
        case "Tabs": return <div style={f}><Tabs defaultValue={(n.props.tabs || [])[0]?.id}><TabsList>{(n.props.tabs || []).map((t: any) => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}</TabsList>{(n.props.tabs || []).map((t: any) => <TabsContent key={t.id} value={t.id} style={{ fontSize: 13, padding: 8 }}>{t.content}</TabsContent>)}</Tabs></div>;
        case "Accordion": return <div style={f}><Accordion type="single" collapsible>{(n.props.items || []).map((i: any) => <AccordionItem key={i.id} value={i.id}><AccordionTrigger>{i.title}</AccordionTrigger><AccordionContent>{i.content}</AccordionContent></AccordionItem>)}</Accordion></div>;
        case "Breadcrumb": return <div style={{ ...f, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>{toStringList(n.props.items, ["Home", "Current"]).map((item: string, i: number, arr: string[]) => <React.Fragment key={item}><span style={{ color: i === arr.length - 1 ? "inherit" : "var(--sx-color-foreground-muted)" }}>{item}</span>{i < arr.length - 1 && <span style={{ opacity: 0.4 }}>/</span>}</React.Fragment>)}</div>;
        case "Pagination":
            return (
                <div style={f}>
                    <Pagination>
                            <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious />
                            </PaginationItem>
                            {toStringList(n.props.pages, ["1", "2", "3"]).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink isActive={page === String(n.props.activePage || "1")}>{page}</PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            );
        case "NavigationMenu":
            return (
                <div style={f}>
                    <NavigationMenu defaultValue="item-0">
                        <NavigationMenuList>
                            {(items.length ? items : ["Guides", "API"]).slice(0, 2).map((item, index) => (
                                <NavigationMenuItem key={item} value={`item-${index}`}>
                                    <NavigationMenuTrigger>{item}</NavigationMenuTrigger>
                                </NavigationMenuItem>
                            ))}
                            <NavigationMenuLink href="#">{items[2] || "Changelog"}</NavigationMenuLink>
                        </NavigationMenuList>
                        {(items.length ? items : ["Guides", "API"]).slice(0, 2).map((item, index) => (
                            <NavigationMenuItem key={`${item}-content`} value={`item-${index}`}>
                                <NavigationMenuContent>{item} content</NavigationMenuContent>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenu>
                </div>
            );
        case "Menubar":
            return (
                <div style={f}>
                    <Menubar>
                        {(items.length ? items : ["File", "Edit", "View"]).map((item) => (
                            <MenubarMenu key={item}>
                                <MenubarTrigger>{item}</MenubarTrigger>
                                <MenubarContent>
                                    <MenubarLabel>{item}</MenubarLabel>
                                    <MenubarItem>{item} action</MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem>More {item.toLowerCase()}</MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>
                        ))}
                    </Menubar>
                </div>
            );
        case "Sidebar":
            return (
                <div style={f}>
                    <SidebarProvider defaultOpen>
                        <div style={{ display: "flex", minHeight: "100%", border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-lg)", overflow: "hidden" }}>
                            <Sidebar>
                                <SidebarHeader>
                                    <SidebarTrigger />
                                </SidebarHeader>
                                <SidebarContent>
                                    <SidebarGroup>
                                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                                        <SidebarGroupContent>
                                            <SidebarMenu>
                                                {(items.length ? items : ["Dashboard", "Settings"]).map((item, index) => (
                                                    <SidebarMenuItem key={item}>
                                                        <SidebarMenuButton active={index === 0}>{item}</SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </SidebarGroup>
                                </SidebarContent>
                                <SidebarFooter />
                            </Sidebar>
                            <SidebarInset>
                                <div style={{ padding: 12, fontSize: 13 }}>Sidebar content</div>
                            </SidebarInset>
                        </div>
                    </SidebarProvider>
                </div>
            );
        case "Separator": return <div style={{ width: "100%", height: 1, background: "var(--sx-color-border)" }} />;
        case "Spacer": return <div style={{ ...f, background: !pv ? "repeating-linear-gradient(45deg,transparent,transparent 4px,var(--sx-color-border) 4px,var(--sx-color-border) 5px)" : "transparent" }} />;
        case "AspectRatio": { const [rw, rh] = (n.props.ratio || "16/9").split("/").map(Number); return <div style={{ ...f, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sx-color-foreground-muted)", fontSize: 13, aspectRatio: `${rw}/${rh}` }}>{n.props.ratio || "16/9"}</div>; }
        case "ScrollArea":
            return (
                <ScrollArea border padding="md" radius="lg" style={{ ...f }}>
                    <div style={{ display: "grid", gap: 8 }}>
                        {toStringList(n.props.items, ["Scrollable content"]).map((item) => (
                            <div key={item} style={{ fontSize: 13, color: "var(--sx-color-foreground-muted)" }}>{item}</div>
                        ))}
                    </div>
                </ScrollArea>
            );
        case "Resizable":
            return (
                <ResizablePanelGroup direction="horizontal" style={f}>
                    <ResizablePanel defaultSize={58}>
                        <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{toStringList(n.props.panes, ["Canvas", "Inspector"])[0]}</div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={42}>
                        <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{toStringList(n.props.panes, ["Canvas", "Inspector"])[1] || "Inspector"}</div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            );
        // Overlays — fully interactive with real synthex-ui components
        case "Dialog":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Dialog><DialogTrigger asChild><Button variant="outline">{n.props.trigger || "Open Dialog"}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{n.props.title || "Dialog Title"}</DialogTitle><DialogDescription>{n.props.description || "Description"}</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="destructive">Cancel</Button></DialogClose><DialogClose asChild><Button variant="outline">Confirm</Button></DialogClose></DialogFooter></DialogContent></Dialog></div>;
        case "AlertDialog":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive">{n.props.trigger || "Delete Item"}</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{n.props.title || "Are you sure?"}</AlertDialogTitle><AlertDialogDescription>{n.props.description || "This action cannot be undone."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>;
        case "Sheet":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Sheet><SheetTrigger asChild><Button variant="outline">{n.props.trigger || "Open Sheet"}</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>{n.props.title || "Sheet Panel"}</SheetTitle><SheetDescription>{n.props.description || "This is a slide-over sheet panel."}</SheetDescription></SheetHeader><div style={{ padding: "16px 0", fontSize: 13 }}>{n.props.content || "Sheet body content."}</div></SheetContent></Sheet></div>;
        case "Popover":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Popover><PopoverTrigger asChild><Button variant="outline">{n.props.trigger || "Open Popover"}</Button></PopoverTrigger><PopoverContent><div style={{ fontSize: 13 }}>{n.props.content || "Popover text content."}</div></PopoverContent></Popover></div>;
        case "Tooltip":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Tooltip><TooltipTrigger asChild><Button variant="outline">{n.props.trigger || "Hover me"}</Button></TooltipTrigger><TooltipContent>{n.props.content || "Tooltip text"}</TooltipContent></Tooltip></div>;
        case "DropdownMenu":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">{n.props.trigger || "Open Menu ▾"}</Button></DropdownMenuTrigger><DropdownMenuContent>{items.map((m, i) => m === "-" ? <DropdownMenuSeparator key={i} /> : <DropdownMenuItem key={i}>{m}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div>;
        case "ContextMenu":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><ContextMenu><ContextMenuTrigger className="flex items-center justify-center w-full h-full border border-dashed border-border-strong rounded-md text-foreground-muted bg-surface/50 text-xs px-2 cursor-context-menu" style={{ width: 180, height: 40, border: "1px dashed var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sx-color-foreground-muted)", fontSize: 13 }}>{n.props.trigger || "Right Click Area"}</ContextMenuTrigger><ContextMenuContent><ContextMenuLabel>Actions</ContextMenuLabel>{items.map((m, i) => m === "-" ? <ContextMenuSeparator key={i} /> : <ContextMenuItem key={i}>{m}</ContextMenuItem>)}</ContextMenuContent></ContextMenu></div>;
        case "HoverCard":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><HoverCard><HoverCardTrigger asChild><Button variant="link">{n.props.trigger || "@synthex"}</Button></HoverCardTrigger><HoverCardContent><div style={{ fontSize: 13 }}><div style={{ fontWeight: 600 }}>{n.props.title || "Synthex UI"}</div><div style={{ color: "var(--sx-color-foreground-muted)", marginTop: 4 }}>{n.props.description || "Library."}</div></div></HoverCardContent></HoverCard></div>;
        case "Collapsible":
            return <div style={f}><Collapsible><CollapsibleTrigger className="flex items-center justify-between w-full p-2 border border-border rounded-md text-sm font-medium hover:bg-surface-muted" style={{ padding: 8, fontSize: 13, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", width: "100%", background: "var(--sx-color-surface)", textAlign: "left" }}>▾ {n.props.trigger || "Toggle Collapsible"}</CollapsibleTrigger><CollapsibleContent><div style={{ padding: 12, fontSize: 13, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", marginTop: 6 }}>{n.props.content || "This is the collapsible content."}</div></CollapsibleContent></Collapsible></div>;
        case "Toast":
            return <ToastNode title={n.props.title} description={n.props.description} />;
        case "Drawer":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Drawer><DrawerTrigger className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium">{n.props.trigger || "Open Drawer"}</DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>{n.props.title || "Drawer panel"}</DrawerTitle><DrawerDescription>{n.props.description || "Bottom sheet content."}</DrawerDescription></DrawerHeader><DrawerFooter><DrawerClose className="inline-flex h-10 items-center justify-center rounded-[var(--sx-radius-md)] border border-[color:var(--sx-color-border)] bg-[color:var(--sx-color-surface)] px-4 text-sm font-medium">Close</DrawerClose></DrawerFooter></DrawerContent></Drawer></div>;
        case "Command":
            return (
                <div style={f}>
                    <Command>
                        <CommandInput aria-label={`${n.id}-command`} />
                        <CommandList>
                            <CommandGroup heading="Actions">
                                {toStringList(n.props.items, ["Open schematic", "Open console"]).map((item) => <CommandItem key={item} value={item.toLowerCase().replace(/\s+/g, "-")}>{item}</CommandItem>)}
                            </CommandGroup>
                            <CommandEmpty>No matching command.</CommandEmpty>
                        </CommandList>
                    </Command>
                </div>
            );
        case "Alert":
            return <Alert><AlertTitle>{n.props.title}</AlertTitle><AlertDescription>{n.props.description}</AlertDescription></Alert>;
        default: return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sx-color-foreground-muted)", fontSize: 12 }}>{n.type}</div>;
    }
}

function ToastNode({ title, description }: { title?: string; description?: string }) {
    const { toast } = useToast();
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Button variant="outline" onClick={() => toast({ title: title || "Toast!", description: description || "This is a toast notification." })}>Show Toast</Button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Properties Panel
   ───────────────────────────────────────────────────────── */

function Props({ n, set, upd }: { n: BuilderNode; set: (p: any) => void; upd: (p: Partial<BuilderNode>) => void }) {
    const s = (k: string, v: any) => set({ [k]: v });
    return (
        <div className="bld-p">
            <div style={{ padding: "0 0 8px" }}><Badge variant="secondary">{n.type}</Badge></div>

            <Sec t="Position & Size">
                <div className="bld-pg">
                    <PF l="X"><Input type="number" value={n.x} onChange={(e) => upd({ x: +e.target.value })} className="bld-i" /></PF>
                    <PF l="Y"><Input type="number" value={n.y} onChange={(e) => upd({ y: +e.target.value })} className="bld-i" /></PF>
                    <PF l="W"><Input type="number" value={n.w} onChange={(e) => upd({ w: +e.target.value })} className="bld-i" /></PF>
                    <PF l="H"><Input type="number" value={n.h} onChange={(e) => upd({ h: +e.target.value })} className="bld-i" /></PF>
                </div>
            </Sec>

            {(["Heading", "Text", "Lead", "Muted", "Small", "Button", "Badge", "Kbd", "Toggle", "Label"].includes(n.type)) && (
                <Sec t="Content">
                    <PF l="Text"><Input value={n.props.text || ""} onChange={(e) => s("text", e.target.value)} className="bld-i" /></PF>
                    {n.type === "Heading" && <PF l="Level"><NS v={n.props.level || "h2"} o={(v) => s("level", v)} opts={[["h1", "H1"], ["h2", "H2"], ["h3", "H3"], ["h4", "H4"]]} /></PF>}
                    {(n.type === "Button" || n.type === "Badge") && <PF l="Variant"><NS v={n.props.variant || "default"} o={(v) => s("variant", v)} opts={[["default", "Default"], ["secondary", "Secondary"], ["destructive", "Destructive"], ["outline", "Outline"], ["ghost", "Ghost"]]} /></PF>}
                </Sec>
            )}

            {n.type === "Tabs" && <Sec t="Tabs Items"><ObjectList v={n.props.tabs || []} o={(v) => s("tabs", v)} fields={[{ k: "id", l: "ID" }, { k: "label", l: "Label" }, { k: "content", l: "Content" }]} /></Sec>}
            {n.type === "Accordion" && <Sec t="Accordion Items"><ObjectList v={n.props.items || []} o={(v) => s("items", v)} fields={[{ k: "id", l: "ID" }, { k: "title", l: "Title" }, { k: "content", l: "Content" }]} /></Sec>}
            {["RadioGroup", "Select", "Combobox", "NativeSelect"].includes(n.type) && <Sec t="Options"><StringList v={n.props.options || []} o={(v) => s("options", v)} /></Sec>}
            {["ButtonGroup", "ToggleGroup", "NavigationMenu", "Menubar", "Sidebar", "Breadcrumb", "Carousel", "ScrollArea", "Command"].includes(n.type) && <Sec t="Items"><StringList v={n.props.items || []} o={(v) => s("items", v)} /></Sec>}
            {["DropdownMenu", "ContextMenu"].includes(n.type) && <Sec t="Menu"><PF l="Trigger"><Input value={n.props.trigger || ""} onChange={(e) => s("trigger", e.target.value)} className="bld-i" /></PF><PF l="Items (- for separator)"><StringList v={n.props.items || []} o={(v) => s("items", v)} /></PF></Sec>}

            {["Table", "DataTable"].includes(n.type) && <Sec t="Table Data">
                <PF l="Columns (comma joined)"><Input value={(n.props.columns || []).join(", ")} onChange={(e) => s("columns", e.target.value.split(",").map(x => x.trim()))} className="bld-i" /></PF>
                <PF l="Rows count"><Input type="number" value={(n.props.rows || []).length} onChange={(e) => {
                    const c = Math.max(1, +e.target.value);
                    const r = [...(n.props.rows || []).map((rx: any[]) => [...rx])];
                    while (r.length < c) r.push((n.props.columns || []).map(() => ""));
                    while (r.length > c) r.pop();
                    s("rows", r);
                }} className="bld-i" /></PF>
                {n.type === "DataTable" && <PF l="Search key"><Input value={n.props.searchKey || ""} onChange={(e) => s("searchKey", e.target.value)} className="bld-i" /></PF>}
            </Sec>}

            {/* Overlays Properties */}
            {["Dialog", "AlertDialog", "Sheet", "Drawer", "Popover", "HoverCard", "Tooltip", "Toast"].includes(n.type) && (
                <Sec t="Overlay Content">
                    {!["Toast"].includes(n.type) && <PF l="Trigger Text"><Input value={n.props.trigger || ""} onChange={(e) => s("trigger", e.target.value)} className="bld-i" /></PF>}
                    {n.type !== "Tooltip" && <PF l="Title"><Input value={n.props.title || ""} onChange={(e) => s("title", e.target.value)} className="bld-i" /></PF>}
                    {["Dialog", "AlertDialog", "Sheet", "Drawer", "HoverCard", "Toast"].includes(n.type) && <PF l="Description"><Input value={n.props.description || ""} onChange={(e) => s("description", e.target.value)} className="bld-i" /></PF>}
                    {["Sheet", "Popover", "Tooltip"].includes(n.type) && <PF l="Content Text"><Input value={n.props.content || ""} onChange={(e) => s("content", e.target.value)} className="bld-i" /></PF>}
                </Sec>
            )}

            {n.type === "Image" && <Sec t="Content"><PF l="URL"><Input value={n.props.src || ""} onChange={(e) => s("src", e.target.value)} className="bld-i" /></PF><PF l="Alt"><Input value={n.props.alt || ""} onChange={(e) => s("alt", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "Empty" && <Sec t="Content"><PF l="Title"><Input value={n.props.title || ""} onChange={(e) => s("title", e.target.value)} className="bld-i" /></PF><PF l="Description"><Input value={n.props.description || ""} onChange={(e) => s("description", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "Card" && <Sec t="Content"><PF l="Title"><Input value={n.props.title || ""} onChange={(e) => s("title", e.target.value)} className="bld-i" /></PF><PF l="Desc"><Input value={n.props.description || ""} onChange={(e) => s("description", e.target.value)} className="bld-i" /></PF></Sec>}
            {(n.type === "Input" || n.type === "Textarea") && <Sec t="Content"><PF l="Label"><Input value={n.props.label || ""} onChange={(e) => s("label", e.target.value)} className="bld-i" /></PF><PF l="Placeholder"><Input value={n.props.placeholder || ""} onChange={(e) => s("placeholder", e.target.value)} className="bld-i" /></PF></Sec>}
            {(n.type === "Checkbox" || n.type === "Switch") && <Sec t="Content"><PF l="Label"><Input value={n.props.label || ""} onChange={(e) => s("label", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "Alert" && <Sec t="Content"><PF l="Title"><Input value={n.props.title || ""} onChange={(e) => s("title", e.target.value)} className="bld-i" /></PF><PF l="Description"><Input value={n.props.description || ""} onChange={(e) => s("description", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "Progress" && <Sec t="Content"><PF l="Value (0-100)"><Input type="number" value={n.props.value || 0} onChange={(e) => s("value", Math.min(100, Math.max(0, +e.target.value)))} className="bld-i" /></PF></Sec>}
            {n.type === "Slider" && <Sec t="Content"><PF l="Value (0-100)"><Input type="number" value={n.props.value || 0} onChange={(e) => s("value", Math.min(100, Math.max(0, +e.target.value)))} className="bld-i" /></PF></Sec>}
            {n.type === "Avatar" && <Sec t="Content"><PF l="Initials"><Input value={n.props.fallback || ""} onChange={(e) => s("fallback", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "AspectRatio" && <Sec t="Content"><PF l="Ratio (e.g. 16/9)"><Input value={n.props.ratio || "16/9"} onChange={(e) => s("ratio", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "Resizable" && <Sec t="Panes"><StringList v={n.props.panes || []} o={(v) => s("panes", v)} /></Sec>}
            {n.type === "Select" && <Sec t="Selection"><PF l="Placeholder"><Input value={n.props.placeholder || ""} onChange={(e) => s("placeholder", e.target.value)} className="bld-i" /></PF><PF l="Default value"><Input value={n.props.value || ""} onChange={(e) => s("value", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "Combobox" && <Sec t="Selection"><PF l="Placeholder"><Input value={n.props.placeholder || ""} onChange={(e) => s("placeholder", e.target.value)} className="bld-i" /></PF><PF l="Default value"><Input value={n.props.value || ""} onChange={(e) => s("value", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "NativeSelect" && <Sec t="Selection"><PF l="Default value"><Input value={n.props.value || ""} onChange={(e) => s("value", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "DatePicker" && <Sec t="Content"><PF l="Placeholder"><Input value={n.props.placeholder || ""} onChange={(e) => s("placeholder", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "InputOTP" && <Sec t="Content"><PF l="Default value"><Input value={n.props.value || ""} onChange={(e) => s("value", e.target.value)} className="bld-i" /></PF><PF l="Length"><Input type="number" value={n.props.length || 4} onChange={(e) => s("length", Math.min(4, Math.max(4, +e.target.value || 4)))} className="bld-i" /></PF></Sec>}
            {n.type === "ToggleGroup" && <Sec t="Selection"><PF l="Mode"><NS v={n.props.mode || "multiple"} o={(v) => s("mode", v)} opts={[["single", "Single"], ["multiple", "Multiple"]]} /></PF><PF l="Active items"><Input value={(n.props.activeItems || []).join(", ")} onChange={(e) => s("activeItems", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} className="bld-i" /></PF></Sec>}
            {n.type === "RadioGroup" && <Sec t="Selection"><PF l="Default value"><Input value={n.props.value || ""} onChange={(e) => s("value", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "Pagination" && <Sec t="Pages"><PF l="Page items"><Input value={(n.props.pages || []).join(", ")} onChange={(e) => s("pages", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} className="bld-i" /></PF><PF l="Active page"><Input value={n.props.activePage || ""} onChange={(e) => s("activePage", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "Collapsible" && <Sec t="Content"><PF l="Trigger"><Input value={n.props.trigger || ""} onChange={(e) => s("trigger", e.target.value)} className="bld-i" /></PF><PF l="Body"><Input value={n.props.content || ""} onChange={(e) => s("content", e.target.value)} className="bld-i" /></PF></Sec>}
        </div>
    );
}

function Sec({ t, children }: { t: string; children: React.ReactNode }) {
    return <div className="bld-sec"><div className="bld-sec-t">{t}</div>{children}</div>;
}
function PF({ l, children }: { l: string; children: React.ReactNode }) {
    return <div className="bld-pf"><label className="bld-pf-l">{l}</label>{children}</div>;
}
function NS({ v, o, opts }: { v: string; o: (v: string) => void; opts: string[][] }) {
    return <select className="bld-sel" value={v} onChange={(e) => o(e.target.value)}>{opts.map(([val, label]) => <option key={val} value={val}>{label}</option>)}</select>;
}

function StringList({ v, o }: { v: string[]; o: (nv: string[]) => void }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {v.map((str, i) => (
                <div key={i} style={{ display: "flex", gap: 4 }}>
                    <Input value={str} onChange={(e) => { const nv = [...v]; nv[i] = e.target.value; o(nv); }} className="bld-i" style={{ flex: 1 }} />
                    <Button variant="outline" size="sm" onClick={() => o(v.filter((_, j) => j !== i))} style={{ height: 28, width: 28, padding: 0 }}>✕</Button>
                </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => o([...v, `Item ${v.length + 1}`])} style={{ height: 28 }}>Add Item</Button>
        </div>
    );
}

function ObjectList({ v, o, fields }: { v: Record<string, any>[]; o: (nv: Record<string, any>[]) => void; fields: { k: string, l: string }[] }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {v.map((obj, i) => (
                <div key={i} style={{ border: "1px solid var(--sx-color-surface-raised)", padding: 6, borderRadius: "var(--sx-radius-sm)", display: "flex", flexDirection: "column", gap: 4, position: "relative" }}>
                    <button className="bld-del" style={{ position: "absolute", top: 4, right: 4 }} onClick={() => o(v.filter((_, j) => j !== i))}>✕</button>
                    {fields.map(f => (
                        <div key={f.k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}>
                            <span style={{ width: 40, color: "var(--sx-color-foreground-muted)" }}>{f.l}</span>
                            <Input value={obj[f.k] || ""} onChange={(e) => { const nv = [...v]; nv[i] = { ...obj, [f.k]: e.target.value }; o(nv); }} className="bld-i" style={{ flex: 1, height: 20 }} />
                        </div>
                    ))}
                </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => o([...v, fields.reduce((acc, f) => ({ ...acc, [f.k]: `New ${f.l}` }), { id: `id${Date.now()}` })])} style={{ height: 28 }}>Add Item</Button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Styles — 100vh fit, compact, responsive
   ───────────────────────────────────────────────────────── */

const CSS = `
.bld{display:flex;flex-direction:column;height:100dvh;width:100vw;min-width:0;overflow:hidden;background:
linear-gradient(180deg,color-mix(in srgb,var(--sx-color-background-subtle) 92%,transparent) 0%,var(--sx-color-background) 18rem);
font-family:var(--sx-font-family-sans);position:fixed;inset:0;isolation:isolate;z-index:40}

.bld-tb{display:flex;align-items:center;justify-content:space-between;height:52px;min-height:52px;padding:0 14px;border-bottom:1px solid color-mix(in srgb,var(--sx-color-border) 82%, transparent);background:color-mix(in srgb,var(--sx-color-surface) 90%, transparent);backdrop-filter:blur(16px);flex-shrink:0}
.bld-tb-l,.bld-tb-r{display:flex;align-items:center;gap:8px}
.bld-tb-logo{font-size:15px;color:var(--sx-color-primary)}
.bld-tb-t{font-size:13px;font-weight:700;letter-spacing:-0.02em}
.bld-tb-c{font-size:11px;color:var(--sx-color-foreground-muted);padding-left:8px;border-left:1px solid var(--sx-color-border)}

.bld-b{display:inline-flex;align-items:center;height:30px;padding:0 11px;font-size:11px;font-weight:600;border:1px solid color-mix(in srgb,var(--sx-color-border) 86%, transparent);border-radius:var(--sx-radius-md);background:color-mix(in srgb,var(--sx-color-surface) 94%, transparent);color:var(--sx-color-foreground);cursor:pointer;transition:all 120ms;gap:5px;white-space:nowrap;box-shadow:0 1px 2px rgba(15,23,42,0.04)}
.bld-b:hover{background:var(--sx-color-surface-raised);border-color:var(--sx-color-border-strong)}
.bld-b-on{background:var(--sx-color-primary-muted);border-color:var(--sx-color-primary);color:var(--sx-color-primary)}
.bld-b-pri{background:var(--sx-color-primary);color:var(--sx-color-foreground-on-brand);border-color:var(--sx-color-primary)}
.bld-b-pri:hover{background:var(--sx-color-primary-hover)}
.bld-b-red{color:var(--sx-color-destructive)}
.bld-b-red:hover{background:var(--sx-color-destructive-muted)}

.bld-bd{display:flex;flex:1;overflow:hidden;min-height:0}

.bld-s{display:flex;flex-direction:column;flex-shrink:0;background:color-mix(in srgb,var(--sx-color-surface) 94%, transparent);overflow:hidden;backdrop-filter:blur(14px)}
.bld-sl{width:220px;border-right:1px solid color-mix(in srgb,var(--sx-color-border) 84%, transparent)}
.bld-sr{width:272px;border-left:1px solid color-mix(in srgb,var(--sx-color-border) 84%, transparent)}
.bld-sh{display:flex;align-items:center;justify-content:space-between;height:36px;min-height:36px;padding:0 12px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--sx-color-foreground-muted);border-bottom:1px solid color-mix(in srgb,var(--sx-color-border) 84%, transparent);flex-shrink:0}
.bld-ss{flex:1;overflow-y:auto;padding:8px}

.bld-search{width:100%;height:32px;padding:0 10px;margin-bottom:8px;font-size:11px;border:1px solid color-mix(in srgb,var(--sx-color-border) 88%, transparent);border-radius:var(--sx-radius-md);background:color-mix(in srgb,var(--sx-color-background) 96%, transparent);color:var(--sx-color-foreground);outline:none}
.bld-search:focus{border-color:var(--sx-color-primary)}
.bld-search::placeholder{color:var(--sx-color-foreground-muted)}

.bld-cg{margin-bottom:2px}
.bld-ch{display:flex;align-items:center;gap:5px;width:100%;padding:4px 6px;font-size:10px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:var(--sx-color-foreground-muted);background:none;border:none;cursor:pointer;border-radius:var(--sx-radius-sm)}
.bld-ch:hover{background:var(--sx-color-surface-raised)}
.bld-ca{font-size:9px;width:10px;text-align:center}
.bld-cc{margin-left:auto;font-size:9px;opacity:0.5}
.bld-cl{display:flex;flex-direction:column;gap:0;padding:1px 0 4px}

.bld-di{display:flex;align-items:center;gap:8px;padding:6px 8px;font-size:11px;border-radius:calc(var(--sx-radius-sm) + 2px);cursor:grab;transition:background 80ms,border-color 80ms,transform 80ms;color:var(--sx-color-foreground);border:1px solid transparent}
.bld-di:hover{background:var(--sx-color-surface-raised);border-color:color-mix(in srgb,var(--sx-color-border) 70%, transparent);transform:translateX(1px)}
.bld-di:active{cursor:grabbing}
.bld-dic{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;font-size:10px;border-radius:3px;background:var(--sx-color-background-subtle);color:var(--sx-color-foreground-muted);flex-shrink:0}

.bld-cv{flex:1;overflow:hidden;background:
radial-gradient(circle at top,color-mix(in srgb,var(--sx-color-primary) 8%, transparent) 0%,transparent 42%),
var(--sx-color-background-subtle);position:relative}
.bld-cv-pv{background:var(--sx-color-background)}
.bld-cv-shell{display:flex;height:100%;width:100%;align-items:stretch;justify-content:stretch;padding:24px}
.bld-cv-shell-pv{padding:18px}
.bld-stage{position:relative;height:100%;width:100%;min-width:0;min-height:0;border:1px solid color-mix(in srgb,var(--sx-color-border) 78%, transparent);border-radius:calc(var(--sx-radius-xl) + 2px);background:color-mix(in srgb,var(--sx-color-surface) 94%, transparent);box-shadow:0 18px 40px rgba(15,23,42,0.08), inset 0 0 0 1px rgba(255,255,255,0.03);overflow:hidden}
.bld-stage-grid{background-image:
linear-gradient(to right, color-mix(in srgb, var(--sx-color-border) 40%, transparent) 1px, transparent 1px),
linear-gradient(to bottom, color-mix(in srgb, var(--sx-color-border) 40%, transparent) 1px, transparent 1px);
background-size:${GRID}px ${GRID}px;
background-position:0 0}
.bld-stage-pv{background:var(--sx-color-background)}
.bld-preview-wrap{display:flex;height:100%;width:100%;align-items:center;justify-content:center;padding:32px}
.bld-preview-scale{flex:none;transform-origin:center center;will-change:transform}
.bld-preview-frame{position:relative;max-width:100%;max-height:100%;border:1px solid color-mix(in srgb,var(--sx-color-border) 82%, transparent);border-radius:calc(var(--sx-radius-xl) + 4px);background:
linear-gradient(180deg,color-mix(in srgb,var(--sx-color-surface) 98%, transparent) 0%,color-mix(in srgb,var(--sx-color-background) 94%, transparent) 100%);
box-shadow:0 24px 60px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.05);overflow:hidden}

.bld-mt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;color:var(--sx-color-foreground-muted)}
.bld-mt-i{font-size:32px;margin-bottom:10px;opacity:0.2;color:var(--sx-color-primary)}
.bld-mt-t{font-size:14px;font-weight:600;margin-bottom:4px;color:var(--sx-color-foreground)}
.bld-mt-d{font-size:12px;max-width:240px;text-align:center;line-height:1.5}

.bld-rz{position:absolute;right:0;bottom:0;width:12px;height:12px;cursor:nwse-resize;background:var(--sx-color-primary);border-radius:4px 0 var(--sx-radius-md) 0;opacity:0.72}
.bld-rz:hover{opacity:1}

.bld-del{font-size:10px;color:var(--sx-color-destructive);background:none;border:none;cursor:pointer;font-weight:500}
.bld-del:hover{text-decoration:underline}

.bld-ns{display:flex;flex-direction:column;align-items:center;gap:8px;padding-top:48px;text-align:center;font-size:11px;color:var(--sx-color-foreground-muted)}
.bld-ns-i{font-size:22px;opacity:0.2}

.bld-p{display:flex;flex-direction:column;gap:2px}
.bld-sec{display:flex;flex-direction:column;gap:6px;padding:10px 0;border-top:1px solid color-mix(in srgb,var(--sx-color-border) 84%, transparent)}
.bld-sec-t{font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--sx-color-foreground-muted)}
.bld-pg{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.bld-pf{display:flex;flex-direction:column;gap:2px}
.bld-pf-l{font-size:10px;font-weight:500;color:var(--sx-color-foreground-muted)}
.bld-i{font-size:11px!important;height:28px!important}
.bld-sel{height:28px;width:100%;padding:0 6px;font-size:11px;border:1px solid color-mix(in srgb,var(--sx-color-border) 88%, transparent);border-radius:var(--sx-radius-md);background:var(--sx-color-surface);color:var(--sx-color-foreground);outline:none}
.bld-sel:focus{border-color:var(--sx-color-primary)}
`;
