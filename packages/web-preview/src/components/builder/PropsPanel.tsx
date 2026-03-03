import type { ReactNode } from "react";
import { Badge, Button, Input } from "synthex-ui/components";
import { getAutoSizePresets } from "./presets";
import type { BuilderNode } from "./types";

export function PropsPanel({ n, set, upd }: { n: BuilderNode; set: (p: any) => void; upd: (p: Partial<BuilderNode>) => void }) {
  const s = (k: string, v: any) => set({ [k]: v });
  const sizePresets = getAutoSizePresets(n.type);

  return (
    <div className="bld-p">
      <div style={{ padding: "0 0 8px" }}><Badge variant="secondary">{n.type}</Badge></div>
      <Section title="Position & Size">
        <div className="bld-pg"><Field label="X"><Input type="number" value={n.x} onChange={(e) => upd({ x: +e.target.value })} className="bld-i" /></Field><Field label="Y"><Input type="number" value={n.y} onChange={(e) => upd({ y: +e.target.value })} className="bld-i" /></Field><Field label="W"><Input type="number" value={n.w} onChange={(e) => upd({ w: +e.target.value })} className="bld-i" /></Field><Field label="H"><Input type="number" value={n.h} onChange={(e) => upd({ h: +e.target.value })} className="bld-i" /></Field></div>
        <div className="bld-presets">{sizePresets.map((preset) => <button key={`${n.type}-${preset.label}`} type="button" className={`bld-ps ${n.w === preset.w && n.h === preset.h ? "bld-ps-on" : ""}`} onClick={() => upd({ w: preset.w, h: preset.h })}>{preset.label}</button>)}</div>
      </Section>
      <Section title="Content">
        {"text" in n.props && <Field label="Text"><Input value={n.props.text || ""} onChange={(e) => s("text", e.target.value)} className="bld-i" /></Field>}
        {"label" in n.props && <Field label="Label"><Input value={n.props.label || ""} onChange={(e) => s("label", e.target.value)} className="bld-i" /></Field>}
        {"title" in n.props && <Field label="Title"><Input value={n.props.title || ""} onChange={(e) => s("title", e.target.value)} className="bld-i" /></Field>}
        {"description" in n.props && <Field label="Description"><Input value={n.props.description || ""} onChange={(e) => s("description", e.target.value)} className="bld-i" /></Field>}
        {"placeholder" in n.props && <Field label="Placeholder"><Input value={n.props.placeholder || ""} onChange={(e) => s("placeholder", e.target.value)} className="bld-i" /></Field>}
        {"trigger" in n.props && <Field label="Trigger"><Input value={n.props.trigger || ""} onChange={(e) => s("trigger", e.target.value)} className="bld-i" /></Field>}
        {"content" in n.props && <Field label="Body"><Input value={n.props.content || ""} onChange={(e) => s("content", e.target.value)} className="bld-i" /></Field>}
        {"value" in n.props && typeof n.props.value !== "boolean" && <Field label="Value"><Input value={n.props.value || ""} onChange={(e) => s("value", e.target.value)} className="bld-i" /></Field>}
        {"src" in n.props && <Field label="Image URL"><Input value={n.props.src || ""} onChange={(e) => s("src", e.target.value)} className="bld-i" /></Field>}
        {Array.isArray(n.props.items) && <ListEditor label="Items" values={n.props.items} onChange={(values) => s("items", values)} />}
        {Array.isArray(n.props.options) && <ListEditor label="Options" values={n.props.options} onChange={(values) => s("options", values)} />}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <div className="bld-sec"><div className="bld-sec-t">{title}</div>{children}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="bld-pf"><label className="bld-pf-l">{label}</label>{children}</div>;
}

function ListEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (values: string[]) => void }) {
  return (
    <Field label={label}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {values.map((value, index) => <div key={`${label}-${index}`} style={{ display: "flex", gap: 4 }}><Input value={value} onChange={(e) => onChange(values.map((item, itemIndex) => itemIndex === index ? e.target.value : item))} className="bld-i" style={{ flex: 1 }} /><Button variant="outline" size="sm" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} style={{ height: 28, width: 28, padding: 0 }}>✕</Button></div>)}
        <Button variant="outline" size="sm" onClick={() => onChange([...values, `${label} ${values.length + 1}`])} style={{ height: 28 }}>Add</Button>
      </div>
    </Field>
  );
}
