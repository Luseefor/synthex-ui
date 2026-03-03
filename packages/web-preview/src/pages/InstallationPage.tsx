import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, H2, Muted } from "synthex-ui/components";

const commands = [
  "npm install synthex-ui",
  "npm install @synthex/core @synthex/react-web",
  'import "synthex-ui/styles.css";',
];

function CodeBlock({ code }: { readonly code: string }) {
  return <pre className="preview-code-block"><code>{code}</code></pre>;
}

export function InstallationPage() {
  return (
    <section className="preview-page-stack">
      <div className="preview-page-heading">
        <Badge variant="outline">Quick Start</Badge>
        <H2>Installation</H2>
        <Muted>Install the shared design system first, then opt into the dockable web workbench only where it is needed.</Muted>
      </div>
      <div className="preview-grid-2">
        <Card>
          <CardHeader>
            <CardTitle>Packages</CardTitle>
            <CardDescription>Minimal install path for the component library and the optional workbench engine.</CardDescription>
          </CardHeader>
          <CardContent className="preview-page-stack">
            {commands.map((command) => <CodeBlock key={command} code={command} />)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recommended flow</CardTitle>
            <CardDescription>Keep adoption ordered so the base tokens and UI chrome are stable before adding layout runtime concerns.</CardDescription>
          </CardHeader>
          <CardContent className="preview-list-card">
            <div>1. Install `synthex-ui` and import the base stylesheet.</div>
            <div>2. Build product screens with the shared components and theme provider.</div>
            <div>3. Add `@synthex/core` and `@synthex/react-web` only when the app needs dockable panels.</div>
            <Button onClick={() => window.open("https://github.com/Luseefor/synthex-ui", "_blank")}>View Repository</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
