import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, H2, Muted, Progress } from "synthex-ui/components";
import { accentPresets } from "synthex-ui/theme";

export function ThemePage() {
  return (
    <section className="preview-page-stack">
      <div className="preview-page-heading">
        <Badge variant="outline">Theme</Badge>
        <H2>Theme behavior</H2>
        <Muted>The preview shell persists accent, mode, and radius so every route validates the same token contract under different settings.</Muted>
      </div>
      <div className="preview-grid-2">
        <Card><CardHeader><CardTitle>Accent presets</CardTitle><CardDescription>Live presets from the exported theme package.</CardDescription></CardHeader><CardContent className="preview-inline-row preview-wrap">{Object.entries(accentPresets).map(([name, preset]) => <div key={name} className="preview-accent-pill"><span className="preview-accent-dot" style={{ backgroundColor: preset.swatch }} /><span>{name}</span></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Surface behavior</CardTitle><CardDescription>Semantic surfaces should remain readable in both light and dark mode.</CardDescription></CardHeader><CardContent className="preview-section-stack"><Alert><AlertTitle>Theme-safe alert</AlertTitle><AlertDescription>Accent, border, and muted surfaces stay token-driven.</AlertDescription></Alert><Progress value={68} /><div className="preview-inline-row"><Button>Primary action</Button><Button variant="outline">Secondary</Button></div></CardContent></Card>
      </div>
    </section>
  );
}
