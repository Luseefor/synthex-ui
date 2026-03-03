import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, H2, Muted } from "synthex-ui/components";

const supportRows = [
  ["synthex-ui", "Supported", "Supported", "Shared component surface and theme contract."],
  ["synthex-ui/components", "Supported", "Supported", "Web and native implementations behind one API."],
  ["@luseefor/synthex-react-web", "Supported", "Not applicable", "Workbench renderer for the browser only."],
  ["@luseefor/synthex-core", "Supported", "Supported", "Framework-agnostic reducers, validation, and serialization."],
  ["@luseefor/synthex-cli", "Not applicable", "Not applicable", "Operational tooling for release and workspace scripts."],
] as const;

const exports = [
  ["synthex-ui/components", "Core controls, overlays, tables, charts, and navigation."],
  ["synthex-ui/theme", "Theme provider, accent presets, and typed contracts."],
  ["synthex-ui/icons", "Named icon contract for product chrome."],
  ["@luseefor/synthex-react-web", "Dockable layout renderer and related hooks."],
] as const;

export function EnginePage() {
  return (
    <section className="preview-page-stack">
      <div className="preview-page-heading">
        <Badge variant="outline">Runtime Model</Badge>
        <H2>Engine and package model</H2>
        <Muted>The preview keeps the package boundaries explicit so the UI kit, workbench adapter, and core runtime do not collapse into one surface.</Muted>
      </div>
      <Card><CardHeader><CardTitle>Support matrix</CardTitle><CardDescription>Shared vocabulary across web and native with a deliberate web-only workbench layer.</CardDescription></CardHeader><CardContent className="preview-table-wrap"><table className="preview-table"><thead><tr><th>Area</th><th>Web</th><th>Native</th><th>Notes</th></tr></thead><tbody>{supportRows.map((row) => <tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>)}</tbody></table></CardContent></Card>
      <div className="preview-grid-2">{exports.map(([path, description]) => <Card key={path}><CardHeader><CardTitle>{path}</CardTitle><CardDescription>{description}</CardDescription></CardHeader></Card>)}</div>
    </section>
  );
}
