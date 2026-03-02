import React, { useState, useMemo, useCallback, useRef, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button, Input, Textarea, Badge, Checkbox, Progress, Separator, Slider, Skeleton, Switch, Toggle,
    Avatar, AvatarFallback, Accordion, AccordionItem, AccordionTrigger, AccordionContent,
    Tabs, TabsList, TabsTrigger, TabsContent, Label, Kbd, Spinner,
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
    AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
    Tooltip, TooltipTrigger, TooltipContent,
    Popover, PopoverTrigger, PopoverContent,
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
    ContextMenu, ContextMenuTrigger, ContextMenuContent,
    HoverCard, HoverCardTrigger, HoverCardContent,
    Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription,
    Collapsible, CollapsibleTrigger, CollapsibleContent,
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

function defaults(type: string): { props: Record<string, any>; w: number; h: number } {
    const m: Record<string, { props: Record<string, any>; w: number; h: number }> = {
        Container: { props: { border: true }, w: 400, h: 200 },
        Spacer: { props: {}, w: 200, h: 40 },
        Separator: { props: {}, w: 300, h: 4 },
        AspectRatio: { props: { ratio: "16/9" }, w: 320, h: 180 },
        ScrollArea: { props: {}, w: 300, h: 200 },
        Resizable: { props: {}, w: 400, h: 200 },
        Heading: { props: { text: "Heading", level: "h2" }, w: 300, h: 60 },
        Text: { props: { text: "Paragraph text goes here." }, w: 360, h: 80 },
        Lead: { props: { text: "Lead text — prominent intro paragraph." }, w: 400, h: 60 },
        Muted: { props: { text: "Muted helper text." }, w: 260, h: 40 },
        Small: { props: { text: "Small caption text." }, w: 200, h: 30 },
        Kbd: { props: { text: "⌘K" }, w: 60, h: 36 },
        Button: { props: { text: "Button", variant: "default" }, w: 140, h: 48 },
        ButtonGroup: { props: {}, w: 320, h: 48 },
        Toggle: { props: { text: "Toggle" }, w: 100, h: 40 },
        ToggleGroup: { props: { items: ["A", "B", "C"] }, w: 240, h: 40 },
        Input: { props: { placeholder: "Enter text...", label: "Label" }, w: 280, h: 68 },
        Textarea: { props: { placeholder: "Write...", label: "Label" }, w: 280, h: 120 },
        Checkbox: { props: { label: "Accept terms" }, w: 180, h: 36 },
        Switch: { props: { label: "Dark mode" }, w: 160, h: 36 },
        RadioGroup: { props: { options: ["Option 1", "Option 2"] }, w: 200, h: 100 },
        Select: { props: { options: ["Option 1", "Option 2"] }, w: 220, h: 44 },
        Combobox: { props: { options: ["Option 1", "Option 2"] }, w: 220, h: 44 },
        DatePicker: { props: {}, w: 220, h: 44 },
        Slider: { props: { value: 50 }, w: 240, h: 36 },
        InputOTP: { props: {}, w: 200, h: 50 },
        NativeSelect: { props: { options: ["Option 1", "Option 2"] }, w: 200, h: 44 },
        Label: { props: { text: "Label" }, w: 120, h: 28 },
        Form: { props: {}, w: 360, h: 200 },
        Card: { props: { title: "Card Title", description: "Description" }, w: 320, h: 120 },
        Badge: { props: { text: "Badge", variant: "default" }, w: 100, h: 36 },
        Avatar: { props: { fallback: "JD" }, w: 48, h: 48 },
        Image: { props: { src: "https://placehold.co/800x400/1a1a2e/e0e0e0?text=Image", alt: "" }, w: 400, h: 220 },
        Table: { props: { columns: ["Name", "Role", "Status"], rows: [["Alice", "Admin", "Active"], ["Bob", "User", "Pending"]] }, w: 420, h: 180 },
        DataTable: { props: { columns: ["Name", "Role", "Status"], rows: [["Alice", "Admin", "Active"], ["Bob", "User", "Pending"]] }, w: 420, h: 200 },
        Calendar: { props: {}, w: 280, h: 280 },
        Progress: { props: { value: 65 }, w: 240, h: 20 },
        Skeleton: { props: {}, w: 240, h: 48 },
        Spinner: { props: {}, w: 40, h: 40 },
        Empty: { props: {}, w: 300, h: 160 },
        Carousel: { props: {}, w: 400, h: 240 },
        Tabs: { props: { tabs: [{ id: "t1", label: "Tab 1", content: "Content 1" }, { id: "t2", label: "Tab 2", content: "Content 2" }] }, w: 360, h: 180 },
        Accordion: { props: { items: [{ id: "a1", title: "Section 1", content: "Content 1" }, { id: "a2", title: "Section 2", content: "Content 2" }] }, w: 360, h: 160 },
        Breadcrumb: { props: { items: ["Home", "Products", "Current"] }, w: 320, h: 36 },
        Pagination: { props: {}, w: 320, h: 44 },
        NavigationMenu: { props: { items: ["Home", "About", "Contact"] }, w: 400, h: 44 },
        Menubar: { props: { items: ["File", "Edit", "View"] }, w: 300, h: 40 },
        Sidebar: { props: { items: ["Dashboard", "Settings", "Users"] }, w: 240, h: 300 },
        Dialog: { props: { trigger: "Open Dialog", title: "Dialog Title", description: "Dialog description." }, w: 300, h: 100 },
        AlertDialog: { props: { trigger: "Delete Item", title: "Are you sure?", description: "This cannot be undone." }, w: 300, h: 100 },
        Sheet: { props: { trigger: "Open Sheet", title: "Sheet Panel", description: "Slide-over panel.", content: "Sheet body content." }, w: 200, h: 80 },
        Drawer: { props: {}, w: 200, h: 80 },
        Popover: { props: { trigger: "Open Popover", title: "Popover", content: "Popover content." }, w: 200, h: 80 },
        HoverCard: { props: { trigger: "@synthex", title: "Synthex UI", description: "Cross-platform components." }, w: 200, h: 80 },
        Tooltip: { props: { trigger: "Hover me", content: "Tooltip text" }, w: 200, h: 60 },
        DropdownMenu: { props: { trigger: "Open Menu ▾", items: ["Edit", "Duplicate", "-", "Delete"] }, w: 200, h: 60 },
        ContextMenu: { props: { trigger: "Right Click Area", items: ["Edit", "Delete"] }, w: 200, h: 60 },
        Command: { props: {}, w: 300, h: 200 },
        Toast: { props: {}, w: 300, h: 80 },
        Alert: { props: { title: "Alert", description: "Something happened." }, w: 360, h: 80 },
        Collapsible: { props: {}, w: 300, h: 100 },
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
        if (!t || !canvasRef.current) return;
        const r = canvasRef.current.getBoundingClientRect();
        const d = defaults(t);
        const node: BuilderNode = {
            id: `n${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
            type: t, props: d.props,
            x: Math.max(0, snap(e.clientX - r.left + canvasRef.current.scrollLeft - d.w / 2)),
            y: Math.max(0, snap(e.clientY - r.top + canvasRef.current.scrollTop - d.h / 2)),
            w: d.w, h: d.h,
        };
        setNodes((n) => [...n, node]);
        setSelId(node.id);
    }, []);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!canvasRef.current) return;
        const r = canvasRef.current.getBoundingClientRect();
        if (drag) {
            upd(drag.id, { x: Math.max(0, snap(e.clientX - r.left + canvasRef.current.scrollLeft - drag.ox)), y: Math.max(0, snap(e.clientY - r.top + canvasRef.current.scrollTop - drag.oy)) });
        }
        if (resize) {
            upd(resize.id, { w: Math.max(40, snap(resize.sw + e.clientX - resize.sx)), h: Math.max(20, snap(resize.sh + e.clientY - resize.sy)) });
        }
    }, [drag, resize, upd]);

    const onPointerUp = useCallback(() => { setDrag(null); setResize(null); }, []);

    return (
        <ToastProvider>
            <div className="bld">
                {/* Toolbar */}
                <header className="bld-tb">
                    <div className="bld-tb-l"><button className="bld-b" onClick={() => navigate("/")} style={{ marginRight: 4 }}>← Home</button><span className="bld-tb-logo">✦</span><span className="bld-tb-t">Synthex Builder</span><span className="bld-tb-c">{nodes.length}</span></div>
                    <div className="bld-tb-r">
                        <button className={`bld-b ${grid ? "bld-b-on" : ""}`} onClick={() => setGrid(!grid)}>{grid ? "⊞ Grid" : "⊟ Grid"}</button>
                        {!preview && nodes.length > 0 && <button className="bld-b bld-b-red" onClick={() => { setNodes([]); setSelId(null); }}>Clear</button>}
                        <button className={`bld-b ${preview ? "bld-b-pri" : ""}`} onClick={() => { setPreview(!preview); setSelId(null); }}>{preview ? "← Edit" : "▶ Preview"}</button>
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
                        style={grid && !preview ? { backgroundSize: `${GRID}px ${GRID}px`, backgroundImage: `linear-gradient(to right, color-mix(in srgb, var(--sx-color-border) 40%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--sx-color-border) 40%, transparent) 1px, transparent 1px)` } : {}}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
                        onDrop={handleDrop}
                        onClick={() => !preview && setSelId(null)}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerLeave={onPointerUp}
                    >
                        {nodes.length === 0 && !preview && (
                            <div className="bld-mt"><div className="bld-mt-i">✦</div><div className="bld-mt-t">Drop components anywhere</div><div className="bld-mt-d">Search &amp; drag from the left panel</div></div>
                        )}
                        {nodes.map((n) => (
                            <CNode key={n.id} n={n} isSel={selId === n.id && !preview} pv={preview}
                                onSel={() => !preview && setSelId(n.id)}
                                onDrag={(ox, oy) => setDrag({ id: n.id, ox, oy })}
                                onResize={(sx, sy) => setResize({ id: n.id, sx, sy, sw: n.w, sh: n.h })}
                            />
                        ))}
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

function CNode({ n, isSel, pv, onSel, onDrag, onResize }: {
    n: BuilderNode; isSel: boolean; pv: boolean;
    onSel: () => void; onDrag: (ox: number, oy: number) => void; onResize: (sx: number, sy: number) => void;
}) {
    return (
        <div
            style={{
                position: "absolute", left: n.x, top: n.y, width: n.w, height: n.type === "Separator" ? 4 : n.h,
                boxShadow: isSel ? "0 0 0 2px var(--sx-color-primary), 0 0 0 4px rgba(59,130,246,0.12)" : "none",
                borderRadius: "var(--sx-radius-md)", cursor: pv ? "default" : "move", zIndex: isSel ? 10 : 1,
                overflow: "hidden",
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
    switch (n.type) {
        case "Container": return <div style={{ ...f, border: n.props.border ? "1px dashed var(--sx-color-border-strong)" : "none", borderRadius: 12, background: n.props.backgroundColor || "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{!pv && <span style={{ color: "var(--sx-color-foreground-muted)", fontSize: 12, opacity: 0.5 }}>Container</span>}</div>;
        case "Heading": { const s: Record<string, string> = { h1: "2.25rem", h2: "1.75rem", h3: "1.375rem", h4: "1.125rem" }; return <div style={{ ...f, display: "flex", alignItems: "center", fontWeight: 700, fontSize: s[n.props.level || "h2"], letterSpacing: "-0.02em" }}>{n.props.text || "Heading"}</div>; }
        case "Text": return <p style={{ ...f, margin: 0, lineHeight: 1.7, color: "var(--sx-color-foreground-muted)", overflow: "hidden" }}>{n.props.text}</p>;
        case "Lead": return <p style={{ ...f, margin: 0, fontSize: "1.125rem", lineHeight: 1.6, color: "var(--sx-color-foreground-muted)" }}>{n.props.text}</p>;
        case "Muted": return <p style={{ ...f, margin: 0, fontSize: "0.875rem", color: "var(--sx-color-foreground-muted)" }}>{n.props.text}</p>;
        case "Small": return <small style={{ ...f, display: "flex", alignItems: "center", fontSize: "0.8rem", color: "var(--sx-color-foreground-muted)" }}>{n.props.text}</small>;
        case "Kbd": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Kbd>{n.props.text || "⌘K"}</Kbd></div>;
        case "Button": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Button variant={n.props.variant}>{n.props.text || "Button"}</Button></div>;
        case "ButtonGroup": return <div style={{ ...f, display: "flex", alignItems: "center", gap: 4 }}><Button variant="outline">Prev</Button><Button>Action</Button><Button variant="outline">Next</Button></div>;
        case "Toggle": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Toggle>{n.props.text || "Toggle"}</Toggle></div>;
        case "ToggleGroup": return <div style={{ ...f, display: "flex", alignItems: "center", gap: 4 }}>{(n.props.items || []).map((m: string, i: number) => <Toggle key={i}>{m}</Toggle>)}</div>;
        case "Input": return <div style={{ ...f, display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>{n.props.label && <Label>{n.props.label}</Label>}<Input placeholder={n.props.placeholder} readOnly /></div>;
        case "Textarea": return <div style={{ ...f, display: "flex", flexDirection: "column", gap: 4 }}>{n.props.label && <Label>{n.props.label}</Label>}<Textarea placeholder={n.props.placeholder} readOnly style={{ flex: 1 }} /></div>;
        case "Checkbox": return <div style={{ ...f, display: "flex", alignItems: "center", gap: 8 }}><Checkbox /><Label>{n.props.label || "Checkbox"}</Label></div>;
        case "Switch": return <div style={{ ...f, display: "flex", alignItems: "center", gap: 8 }}><Switch /><Label>{n.props.label || "Switch"}</Label></div>;
        case "RadioGroup": return <div style={{ ...f, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>{(n.props.options || []).map((o: string, i: number) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}><input type="radio" name={n.id} defaultChecked={i === 0} /><Label>{o}</Label></div>)}</div>;
        case "Slider": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Slider defaultValue={[n.props.value || 50]} /></div>;
        case "Select": return <div style={{ ...f, display: "flex", alignItems: "center" }}><select style={{ width: "100%", height: 36, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", padding: "0 8px", background: "var(--sx-color-surface)", color: "var(--sx-color-foreground)" }}><option>{(n.props.options || [])[0] || "Select option"}</option></select></div>;
        case "Combobox": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Input placeholder={(n.props.options || [])[0] || "Search..."} readOnly /></div>;
        case "DatePicker": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Input value="2026-03-02" readOnly /></div>;
        case "InputOTP": return <div style={{ ...f, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>{[1, 2, 3, 4].map(i => <div key={i} style={{ width: 36, height: 40, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--sx-color-surface)" }}>•</div>)}</div>;
        case "NativeSelect": return <div style={{ ...f, display: "flex", alignItems: "center" }}><select style={{ width: "100%", height: 36, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", padding: "0 8px", background: "var(--sx-color-surface)", color: "var(--sx-color-foreground)" }}><option>{(n.props.options || [])[0] || "Option"}</option></select></div>;
        case "Label": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Label>{n.props.text || "Label"}</Label></div>;
        case "Form": return <div style={{ ...f, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-lg)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}><Label>Email</Label><Input placeholder="you@example.com" readOnly /><Button>Submit</Button></div>;
        case "Card": return <div style={{ ...f, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-lg)", background: "var(--sx-color-surface)", padding: 20, display: "flex", flexDirection: "column", justifyContent: "center" }}><div style={{ fontWeight: 600, marginBottom: 4 }}>{n.props.title}</div><div style={{ color: "var(--sx-color-foreground-muted)", fontSize: "0.875rem" }}>{n.props.description}</div></div>;
        case "Badge": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Badge variant={n.props.variant}>{n.props.text || "Badge"}</Badge></div>;
        case "Avatar": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Avatar><AvatarFallback>{n.props.fallback || "?"}</AvatarFallback></Avatar></div>;
        case "Image": return <img src={n.props.src} alt={n.props.alt} style={{ ...f, objectFit: "cover", borderRadius: 8 }} />;
        case "Table": return <div style={{ ...f, overflow: "auto", border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr>{(n.props.columns || []).map((c: string, i: number) => <th key={i} style={thS}>{c}</th>)}</tr></thead><tbody>{(n.props.rows || []).map((row: string[], i: number) => <tr key={i}>{row.map((cell, j) => <td key={j} style={tdS}>{cell}</td>)}</tr>)}</tbody></table></div>;
        case "DataTable": return <Content n={{ ...n, type: "Table" }} pv={pv} />;
        case "Calendar": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-lg)", fontSize: 13, color: "var(--sx-color-foreground-muted)" }}>📅 Calendar</div>;
        case "Progress": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Progress value={n.props.value || 65} /></div>;
        case "Skeleton": return <div style={{ ...f, display: "flex", flexDirection: "column", gap: 8 }}><Skeleton className="w-full" style={{ height: 16, borderRadius: 6 }} /><Skeleton style={{ height: 16, width: "70%", borderRadius: 6 }} /></div>;
        case "Spinner": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>;
        case "Empty": return <div style={{ ...f, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--sx-color-foreground-muted)", gap: 4 }}><span style={{ fontSize: 28, opacity: 0.3 }}>∅</span><span style={{ fontSize: 13 }}>No data</span></div>;
        case "Carousel": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-lg)", color: "var(--sx-color-foreground-muted)", fontSize: 13 }}>◁ Carousel ▷</div>;
        case "Tabs": return <div style={f}><Tabs defaultValue={(n.props.tabs || [])[0]?.id}><TabsList>{(n.props.tabs || []).map((t: any) => <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>)}</TabsList>{(n.props.tabs || []).map((t: any) => <TabsContent key={t.id} value={t.id} style={{ fontSize: 13, padding: 8 }}>{t.content}</TabsContent>)}</Tabs></div>;
        case "Accordion": return <div style={f}><Accordion type="single" collapsible>{(n.props.items || []).map((i: any) => <AccordionItem key={i.id} value={i.id}><AccordionTrigger>{i.title}</AccordionTrigger><AccordionContent>{i.content}</AccordionContent></AccordionItem>)}</Accordion></div>;
        case "Breadcrumb": return <div style={{ ...f, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>{(n.props.items || []).map((item: string, i: number, arr: any[]) => <React.Fragment key={i}><span style={{ color: i === arr.length - 1 ? "inherit" : "var(--sx-color-foreground-muted)" }}>{item}</span>{i < arr.length - 1 && <span style={{ opacity: 0.4 }}>/</span>}</React.Fragment>)}</div>;
        case "Pagination": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Button variant="outline" size="sm">←</Button>{[1, 2, 3].map(i => <Button key={i} variant={i === 1 ? "default" : "outline"} size="sm">{i}</Button>)}<Button variant="outline" size="sm">→</Button></div>;
        case "NavigationMenu": return <div style={{ ...f, display: "flex", alignItems: "center", gap: 16, fontSize: 13, fontWeight: 500 }}>{(n.props.items || []).map((item: string, i: number) => <span key={i} style={{ color: i === 0 ? "inherit" : "var(--sx-color-foreground-muted)" }}>{item}</span>)}</div>;
        case "Menubar": return <div style={{ ...f, display: "flex", alignItems: "center", gap: 2, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", padding: "0 4px" }}>{(n.props.items || []).map((m: string, i: number) => <button key={i} style={{ padding: "6px 10px", border: "none", background: "none", fontSize: 13, borderRadius: "var(--sx-radius-sm)", cursor: "pointer", color: "var(--sx-color-foreground)" }}>{m}</button>)}</div>;
        case "Sidebar": return <div style={{ ...f, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-lg)", background: "var(--sx-color-surface)", padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>{(n.props.items || []).map((m: string, i: number) => <div key={i} style={{ padding: "6px 10px", fontSize: 13, borderRadius: "var(--sx-radius-sm)", background: i === 0 ? "var(--sx-color-surface-raised)" : "transparent" }}>{m}</div>)}</div>;
        case "Separator": return <div style={{ width: "100%", height: 1, background: "var(--sx-color-border)" }} />;
        case "Spacer": return <div style={{ ...f, background: !pv ? "repeating-linear-gradient(45deg,transparent,transparent 4px,var(--sx-color-border) 4px,var(--sx-color-border) 5px)" : "transparent" }} />;
        case "AspectRatio": { const [rw, rh] = (n.props.ratio || "16/9").split("/").map(Number); return <div style={{ ...f, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sx-color-foreground-muted)", fontSize: 13, aspectRatio: `${rw}/${rh}` }}>{n.props.ratio || "16/9"}</div>; }
        case "ScrollArea": return <div style={{ ...f, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sx-color-foreground-muted)", fontSize: 13 }}>Scroll Area</div>;
        case "Resizable": return <div style={{ ...f, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sx-color-foreground-muted)", fontSize: 13 }}>Resizable</div>;
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
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">{n.props.trigger || "Open Menu ▾"}</Button></DropdownMenuTrigger><DropdownMenuContent>{(n.props.items || []).map((m: string, i: number) => m === "-" ? <DropdownMenuSeparator key={i} /> : <DropdownMenuItem key={i}>{m}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div>;
        case "ContextMenu":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><ContextMenu><ContextMenuTrigger className="flex items-center justify-center w-full h-full border border-dashed border-border-strong rounded-md text-foreground-muted bg-surface/50 text-xs px-2 cursor-context-menu" style={{ width: 180, height: 40, border: "1px dashed var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sx-color-foreground-muted)", fontSize: 13 }}>{n.props.trigger || "Right Click Area"}</ContextMenuTrigger><ContextMenuContent>{(n.props.items || []).map((m: string, i: number) => m === "-" ? <DropdownMenuSeparator key={i} /> : <DropdownMenuItem key={i}>{m}</DropdownMenuItem>)}</ContextMenuContent></ContextMenu></div>;
        case "HoverCard":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><HoverCard><HoverCardTrigger asChild><Button variant="link">{n.props.trigger || "@synthex"}</Button></HoverCardTrigger><HoverCardContent><div style={{ fontSize: 13 }}><div style={{ fontWeight: 600 }}>{n.props.title || "Synthex UI"}</div><div style={{ color: "var(--sx-color-foreground-muted)", marginTop: 4 }}>{n.props.description || "Library."}</div></div></HoverCardContent></HoverCard></div>;
        case "Collapsible":
            return <div style={f}><Collapsible><CollapsibleTrigger className="flex items-center justify-between w-full p-2 border border-border rounded-md text-sm font-medium hover:bg-surface-muted" style={{ padding: 8, fontSize: 13, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", width: "100%", background: "var(--sx-color-surface)", textAlign: "left" }}>▾ {n.props.trigger || "Toggle Collapsible"}</CollapsibleTrigger><CollapsibleContent><div style={{ padding: 12, fontSize: 13, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", marginTop: 6 }}>This is the collapsible content that was hidden.</div></CollapsibleContent></Collapsible></div>;
        case "Toast":
            return <ToastNode />;
        case "Drawer": case "Command":
            return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Button variant="outline" size="sm">{n.type} (click in preview)</Button></div>;
        case "Alert": return <div style={{ ...f, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-md)", padding: 12, display: "flex", flexDirection: "column", gap: 2 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{n.props.title}</div><div style={{ fontSize: 13, color: "var(--sx-color-foreground-muted)" }}>{n.props.description}</div></div>;
        default: return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sx-color-foreground-muted)", fontSize: 12 }}>{n.type}</div>;
    }
}

function ToastNode() {
    const { toast } = useToast();
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Button variant="outline" onClick={() => toast({ title: "Toast!", description: "This is a toast notification." })}>Show Toast</Button>
        </div>
    );
}

const thS: CSSProperties = { padding: "8px 12px", borderBottom: "1px solid var(--sx-color-border)", textAlign: "left", fontWeight: 600, fontSize: 12, color: "var(--sx-color-foreground-muted)" };
const tdS: CSSProperties = { padding: "8px 12px", borderBottom: "1px solid var(--sx-color-border)" };

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

            {(["Heading", "Text", "Lead", "Muted", "Small", "Button", "Badge", "Kbd", "Toggle"].includes(n.type)) && (
                <Sec t="Content">
                    <PF l="Text"><Input value={n.props.text || ""} onChange={(e) => s("text", e.target.value)} className="bld-i" /></PF>
                    {n.type === "Heading" && <PF l="Level"><NS v={n.props.level || "h2"} o={(v) => s("level", v)} opts={[["h1", "H1"], ["h2", "H2"], ["h3", "H3"], ["h4", "H4"]]} /></PF>}
                    {(n.type === "Button" || n.type === "Badge") && <PF l="Variant"><NS v={n.props.variant || "default"} o={(v) => s("variant", v)} opts={[["default", "Default"], ["secondary", "Secondary"], ["destructive", "Destructive"], ["outline", "Outline"], ["ghost", "Ghost"]]} /></PF>}
                </Sec>
            )}

            {n.type === "Tabs" && <Sec t="Tabs Items"><ObjectList v={n.props.tabs || []} o={(v) => s("tabs", v)} fields={[{ k: "id", l: "ID" }, { k: "label", l: "Label" }, { k: "content", l: "Content" }]} /></Sec>}
            {n.type === "Accordion" && <Sec t="Accordion Items"><ObjectList v={n.props.items || []} o={(v) => s("items", v)} fields={[{ k: "id", l: "ID" }, { k: "title", l: "Title" }, { k: "content", l: "Content" }]} /></Sec>}
            {["RadioGroup", "Select", "Combobox", "NativeSelect"].includes(n.type) && <Sec t="Options"><StringList v={n.props.options || []} o={(v) => s("options", v)} /></Sec>}
            {["ToggleGroup", "NavigationMenu", "Menubar", "Sidebar", "Breadcrumb"].includes(n.type) && <Sec t="Items"><StringList v={n.props.items || []} o={(v) => s("items", v)} /></Sec>}
            {["DropdownMenu", "ContextMenu"].includes(n.type) && <Sec t="Menu"><PF l="Trigger"><Input value={n.props.trigger || ""} onChange={(e) => s("trigger", e.target.value)} className="bld-i" /></PF><PF l="Items (- for separator)"><StringList v={n.props.items || []} o={(v) => s("items", v)} /></PF></Sec>}

            {n.type === "Table" && <Sec t="Table Data">
                <PF l="Columns (comma joined)"><Input value={(n.props.columns || []).join(", ")} onChange={(e) => s("columns", e.target.value.split(",").map(x => x.trim()))} className="bld-i" /></PF>
                <PF l="Rows count"><Input type="number" value={(n.props.rows || []).length} onChange={(e) => {
                    const c = Math.max(1, +e.target.value);
                    const r = [...(n.props.rows || []).map((rx: any[]) => [...rx])];
                    while (r.length < c) r.push((n.props.columns || []).map(() => ""));
                    while (r.length > c) r.pop();
                    s("rows", r);
                }} className="bld-i" /></PF>
            </Sec>}

            {/* Overlays Properties */}
            {["Dialog", "AlertDialog", "Sheet", "Popover", "HoverCard", "Tooltip"].includes(n.type) && (
                <Sec t="Overlay Content">
                    <PF l="Trigger Text"><Input value={n.props.trigger || ""} onChange={(e) => s("trigger", e.target.value)} className="bld-i" /></PF>
                    {n.type !== "Tooltip" && <PF l="Title"><Input value={n.props.title || ""} onChange={(e) => s("title", e.target.value)} className="bld-i" /></PF>}
                    {["Dialog", "AlertDialog", "Sheet", "HoverCard"].includes(n.type) && <PF l="Description"><Input value={n.props.description || ""} onChange={(e) => s("description", e.target.value)} className="bld-i" /></PF>}
                    {["Sheet", "Popover", "Tooltip"].includes(n.type) && <PF l="Content Text"><Input value={n.props.content || ""} onChange={(e) => s("content", e.target.value)} className="bld-i" /></PF>}
                </Sec>
            )}

            {n.type === "Image" && <Sec t="Content"><PF l="URL"><Input value={n.props.src || ""} onChange={(e) => s("src", e.target.value)} className="bld-i" /></PF><PF l="Alt"><Input value={n.props.alt || ""} onChange={(e) => s("alt", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "Card" && <Sec t="Content"><PF l="Title"><Input value={n.props.title || ""} onChange={(e) => s("title", e.target.value)} className="bld-i" /></PF><PF l="Desc"><Input value={n.props.description || ""} onChange={(e) => s("description", e.target.value)} className="bld-i" /></PF></Sec>}
            {(n.type === "Input" || n.type === "Textarea") && <Sec t="Content"><PF l="Label"><Input value={n.props.label || ""} onChange={(e) => s("label", e.target.value)} className="bld-i" /></PF><PF l="Placeholder"><Input value={n.props.placeholder || ""} onChange={(e) => s("placeholder", e.target.value)} className="bld-i" /></PF></Sec>}
            {(n.type === "Checkbox" || n.type === "Switch") && <Sec t="Content"><PF l="Label"><Input value={n.props.label || ""} onChange={(e) => s("label", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "Alert" && <Sec t="Content"><PF l="Title"><Input value={n.props.title || ""} onChange={(e) => s("title", e.target.value)} className="bld-i" /></PF><PF l="Description"><Input value={n.props.description || ""} onChange={(e) => s("description", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "Progress" && <Sec t="Content"><PF l="Value (0-100)"><Input type="number" value={n.props.value || 0} onChange={(e) => s("value", Math.min(100, Math.max(0, +e.target.value)))} className="bld-i" /></PF></Sec>}
            {n.type === "Slider" && <Sec t="Content"><PF l="Value (0-100)"><Input type="number" value={n.props.value || 0} onChange={(e) => s("value", Math.min(100, Math.max(0, +e.target.value)))} className="bld-i" /></PF></Sec>}
            {n.type === "Avatar" && <Sec t="Content"><PF l="Initials"><Input value={n.props.fallback || ""} onChange={(e) => s("fallback", e.target.value)} className="bld-i" /></PF></Sec>}
            {n.type === "AspectRatio" && <Sec t="Content"><PF l="Ratio (e.g. 16/9)"><Input value={n.props.ratio || "16/9"} onChange={(e) => s("ratio", e.target.value)} className="bld-i" /></PF></Sec>}
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
.bld{display:flex;flex-direction:column;height:100vh;width:100vw;overflow:hidden;background:var(--sx-color-background);font-family:var(--sx-font-family-sans);position:fixed;inset:0;z-index:50}

.bld-tb{display:flex;align-items:center;justify-content:space-between;height:44px;min-height:44px;padding:0 12px;border-bottom:1px solid var(--sx-color-border);background:var(--sx-color-surface);flex-shrink:0}
.bld-tb-l,.bld-tb-r{display:flex;align-items:center;gap:8px}
.bld-tb-logo{font-size:15px;color:var(--sx-color-primary)}
.bld-tb-t{font-size:13px;font-weight:600;letter-spacing:-0.01em}
.bld-tb-c{font-size:11px;color:var(--sx-color-foreground-muted);padding-left:8px;border-left:1px solid var(--sx-color-border)}

.bld-b{display:inline-flex;align-items:center;height:28px;padding:0 10px;font-size:11px;font-weight:500;border:1px solid var(--sx-color-border);border-radius:var(--sx-radius-md);background:var(--sx-color-surface);color:var(--sx-color-foreground);cursor:pointer;transition:all 100ms;gap:4px;white-space:nowrap}
.bld-b:hover{background:var(--sx-color-surface-raised);border-color:var(--sx-color-border-strong)}
.bld-b-on{background:var(--sx-color-primary-muted);border-color:var(--sx-color-primary);color:var(--sx-color-primary)}
.bld-b-pri{background:var(--sx-color-primary);color:var(--sx-color-foreground-on-brand);border-color:var(--sx-color-primary)}
.bld-b-pri:hover{background:var(--sx-color-primary-hover)}
.bld-b-red{color:var(--sx-color-destructive)}
.bld-b-red:hover{background:var(--sx-color-destructive-muted)}

.bld-bd{display:flex;flex:1;overflow:hidden;min-height:0}

.bld-s{display:flex;flex-direction:column;flex-shrink:0;background:var(--sx-color-surface);overflow:hidden}
.bld-sl{width:200px;border-right:1px solid var(--sx-color-border)}
.bld-sr{width:240px;border-left:1px solid var(--sx-color-border)}
.bld-sh{display:flex;align-items:center;justify-content:space-between;height:32px;min-height:32px;padding:0 12px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--sx-color-foreground-muted);border-bottom:1px solid var(--sx-color-border);flex-shrink:0}
.bld-ss{flex:1;overflow-y:auto;padding:6px}

.bld-search{width:100%;height:28px;padding:0 8px;margin-bottom:6px;font-size:11px;border:1px solid var(--sx-color-border);border-radius:var(--sx-radius-md);background:var(--sx-color-background);color:var(--sx-color-foreground);outline:none}
.bld-search:focus{border-color:var(--sx-color-primary)}
.bld-search::placeholder{color:var(--sx-color-foreground-muted)}

.bld-cg{margin-bottom:2px}
.bld-ch{display:flex;align-items:center;gap:5px;width:100%;padding:4px 6px;font-size:10px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:var(--sx-color-foreground-muted);background:none;border:none;cursor:pointer;border-radius:var(--sx-radius-sm)}
.bld-ch:hover{background:var(--sx-color-surface-raised)}
.bld-ca{font-size:9px;width:10px;text-align:center}
.bld-cc{margin-left:auto;font-size:9px;opacity:0.5}
.bld-cl{display:flex;flex-direction:column;gap:0;padding:1px 0 4px}

.bld-di{display:flex;align-items:center;gap:7px;padding:4px 6px;font-size:11px;border-radius:var(--sx-radius-sm);cursor:grab;transition:background 80ms;color:var(--sx-color-foreground)}
.bld-di:hover{background:var(--sx-color-surface-raised)}
.bld-di:active{cursor:grabbing}
.bld-dic{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;font-size:10px;border-radius:3px;background:var(--sx-color-background-subtle);color:var(--sx-color-foreground-muted);flex-shrink:0}

.bld-cv{flex:1;overflow:auto;background:var(--sx-color-background-subtle);position:relative}
.bld-cv-pv{background:var(--sx-color-background)}

.bld-mt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;color:var(--sx-color-foreground-muted)}
.bld-mt-i{font-size:32px;margin-bottom:10px;opacity:0.2;color:var(--sx-color-primary)}
.bld-mt-t{font-size:14px;font-weight:600;margin-bottom:4px;color:var(--sx-color-foreground)}
.bld-mt-d{font-size:12px;max-width:240px;text-align:center;line-height:1.5}

.bld-rz{position:absolute;right:0;bottom:0;width:10px;height:10px;cursor:nwse-resize;background:var(--sx-color-primary);border-radius:2px 0 var(--sx-radius-md) 0;opacity:0.6}
.bld-rz:hover{opacity:1}

.bld-del{font-size:10px;color:var(--sx-color-destructive);background:none;border:none;cursor:pointer;font-weight:500}
.bld-del:hover{text-decoration:underline}

.bld-ns{display:flex;flex-direction:column;align-items:center;gap:8px;padding-top:48px;text-align:center;font-size:11px;color:var(--sx-color-foreground-muted)}
.bld-ns-i{font-size:22px;opacity:0.2}

.bld-p{display:flex;flex-direction:column;gap:2px}
.bld-sec{display:flex;flex-direction:column;gap:6px;padding:8px 0;border-top:1px solid var(--sx-color-border)}
.bld-sec-t{font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--sx-color-foreground-muted)}
.bld-pg{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.bld-pf{display:flex;flex-direction:column;gap:2px}
.bld-pf-l{font-size:10px;font-weight:500;color:var(--sx-color-foreground-muted)}
.bld-i{font-size:11px!important;height:28px!important}
.bld-sel{height:28px;width:100%;padding:0 6px;font-size:11px;border:1px solid var(--sx-color-border);border-radius:var(--sx-radius-md);background:var(--sx-color-surface);color:var(--sx-color-foreground);outline:none}
.bld-sel:focus{border-color:var(--sx-color-primary)}
`;
