import type { CSSProperties } from "react";
import { Badge, Button, ButtonGroup, H1, H2, H3, Kbd, Label, Lead, Muted, Small, Textarea, Toggle, ToggleGroup, ToggleGroupItem, Input } from "synthex-ui/components";
import type { BuilderNode } from "../types";
import { toStringList } from "../utils";

export function renderBasic(n: BuilderNode, f: CSSProperties) {
  const items = toStringList(n.props.items);
  const activeItems = toStringList(n.props.activeItems);
  switch (n.type) {
    case "Container": return <div style={{ ...f, border: n.props.border ? "1px dashed var(--sx-color-border-strong)" : "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "var(--sx-color-foreground-muted)", fontSize: 12, opacity: 0.5 }}>Container</span></div>;
    case "Heading": return <div style={{ ...f, display: "flex", alignItems: "center" }}>{n.props.level === "h1" ? <H1>{n.props.text}</H1> : n.props.level === "h3" || n.props.level === "h4" ? <H3>{n.props.text}</H3> : <H2>{n.props.text}</H2>}</div>;
    case "Text": return <p style={{ ...f, margin: 0, lineHeight: 1.7, color: "var(--sx-color-foreground-muted)" }}>{n.props.text}</p>;
    case "Lead": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Lead>{n.props.text}</Lead></div>;
    case "Muted": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Muted>{n.props.text}</Muted></div>;
    case "Small": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Small>{n.props.text}</Small></div>;
    case "Kbd": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Kbd>{n.props.text}</Kbd></div>;
    case "Button": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Button variant={n.props.variant}>{n.props.text}</Button></div>;
    case "ButtonGroup": return <div style={{ ...f, display: "flex", alignItems: "center" }}><ButtonGroup>{(items.length ? items : ["Prev", "Action", "Next"]).map((item, i) => <Button key={item} variant={i === 1 ? "default" : "outline"} size="sm">{item}</Button>)}</ButtonGroup></div>;
    case "Toggle": return <div style={{ ...f, display: "flex", alignItems: "center", justifyContent: "center" }}><Toggle>{n.props.text}</Toggle></div>;
    case "ToggleGroup": return <div style={{ ...f, display: "flex", alignItems: "center" }}><ToggleGroup type={n.props.mode === "single" ? "single" : "multiple"} defaultValue={n.props.mode === "single" ? activeItems[0] : activeItems}>{(items.length ? items : ["A", "B", "C"]).map((item) => <ToggleGroupItem key={item} value={item}>{item}</ToggleGroupItem>)}</ToggleGroup></div>;
    case "Label": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Label>{n.props.text}</Label></div>;
    case "Badge": return <div style={{ ...f, display: "flex", alignItems: "center" }}><Badge variant={n.props.variant}>{n.props.text}</Badge></div>;
    case "Spacer": return <div style={{ ...f, background: "repeating-linear-gradient(45deg,transparent,transparent 4px,var(--sx-color-border) 4px,var(--sx-color-border) 5px)" }} />;
    case "Form": return <div style={{ ...f, border: "1px solid var(--sx-color-border)", borderRadius: "var(--sx-radius-lg)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}><Label>Email</Label><Input placeholder="you@example.com" readOnly /><Button>Submit</Button></div>;
    case "Textarea": return <div style={{ ...f, display: "flex", flexDirection: "column", gap: 4 }}>{n.props.label && <Label>{n.props.label}</Label>}<Textarea placeholder={n.props.placeholder} readOnly style={{ flex: 1 }} /></div>;
    default: return null;
  }
}
