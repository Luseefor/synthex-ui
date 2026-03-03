import type { CSSProperties } from "react";
import { Alert, AlertDescription, AlertTitle, Avatar, AvatarFallback, Calendar, Card, CardContent, CardDescription, CardHeader, CardTitle, Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, DataTable, Empty, EmptyDescription, EmptyHeader, EmptyTitle, Progress, ScrollArea, Skeleton, Spinner, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "synthex-ui/components";
import type { BuilderNode } from "../types";
import { toStringList, toTableData } from "../utils";

export function renderData(n: BuilderNode, f: CSSProperties) {
  const items = toStringList(n.props.items);
  const table = toTableData(n);
  switch (n.type) {
    case "Card": return <Card style={f}><CardHeader><CardTitle>{n.props.title}</CardTitle><CardDescription>{n.props.description}</CardDescription></CardHeader></Card>;
    case "Avatar": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Avatar><AvatarFallback>{n.props.fallback || "?"}</AvatarFallback></Avatar></div>;
    case "Image": return <img src={n.props.src} alt={n.props.alt} style={{ ...f, objectFit: "cover", borderRadius: 8 }} />;
    case "Table": return <div style={{ ...f, overflow: "auto" }}><Table><TableHeader><TableRow>{table.columns.map((column) => <TableHead key={column}>{column}</TableHead>)}</TableRow></TableHeader><TableBody>{table.data.map((row, rowIndex) => <TableRow key={rowIndex}>{table.columns.map((column) => <TableCell key={column}>{row[column]}</TableCell>)}</TableRow>)}</TableBody></Table></div>;
    case "DataTable": return <div style={{ ...f, overflow: "auto" }}><DataTable columns={table.columns.map((column, index) => ({ id: column.toLowerCase().replace(/\s+/g, "-"), header: column, accessor: column, align: index === table.columns.length - 1 ? "right" : "left" }))} data={table.data} pageSize={Math.max(1, Math.min(5, table.data.length || 1))} searchKey={String(n.props.searchKey || table.columns[0] || "")} searchPlaceholder="Filter rows" /></div>;
    case "Calendar": return <div style={{ ...f, padding: 10 }}><Calendar /></div>;
    case "Progress": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Progress value={n.props.value || 65} /></div>;
    case "Skeleton": return <div style={{ ...f, display: "flex", flexDirection: "column", gap: 8 }}><Skeleton className="w-full" style={{ height: 16, borderRadius: 6 }} /><Skeleton style={{ height: 16, width: "70%", borderRadius: 6 }} /></div>;
    case "Spinner": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>;
    case "Empty": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Empty><EmptyHeader><EmptyTitle>{n.props.title}</EmptyTitle><EmptyDescription>{n.props.description}</EmptyDescription></EmptyHeader></Empty></div>;
    case "Carousel": return <div style={f}><Carousel><CarouselContent>{(items.length ? items : ["Slide one", "Slide two"]).map((item) => <CarouselItem key={item}><Card><CardContent className="flex min-h-[8rem] items-center justify-center text-sm">{item}</CardContent></Card></CarouselItem>)}</CarouselContent><div style={{ display: "flex", justifyContent: "center", gap: 8 }}><CarouselPrevious /><CarouselNext /></div></Carousel></div>;
    case "ScrollArea": return <ScrollArea border padding="md" radius="lg" style={{ ...f }}><div style={{ display: "grid", gap: 8 }}>{toStringList(n.props.items, ["Scrollable content"]).map((item) => <div key={item} style={{ fontSize: 13, color: "var(--sx-color-foreground-muted)" }}>{item}</div>)}</div></ScrollArea>;
    case "Command": return <div style={f}><Command><CommandInput aria-label={`${n.id}-command`} /><CommandList><CommandGroup heading="Actions">{toStringList(n.props.items, ["Open schematic", "Open console"]).map((item) => <CommandItem key={item} value={item.toLowerCase().replace(/\s+/g, "-")}>{item}</CommandItem>)}</CommandGroup><CommandEmpty>No matching command.</CommandEmpty></CommandList></Command></div>;
    case "Alert": return <Alert><AlertTitle>{n.props.title}</AlertTitle><AlertDescription>{n.props.description}</AlertDescription></Alert>;
    default: return null;
  }
}
