import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, H2, Muted } from "synthex-ui/components";

const scaffoldCommands = [
  "npx @luseefor/synthex-cli@latest create my-app",
  "cd my-app && npm install && npm run dev",
  "npx @luseefor/synthex-cli@latest add button --dry-run",
];

const existingAppCss = `@import "tailwindcss";
@import "synthex-ui/styles.css";

@source "../node_modules/synthex-ui/dist";`;

function CodeBlock({ code }: { readonly code: string }) {
  return <pre className="preview-code-block"><code>{code}</code></pre>;
}

export function InstallationPage() {
  return (
    <section className="preview-page-stack">
      <div className="preview-page-heading">
        <Badge variant="outline">Quick Start</Badge>
        <H2>Installation</H2>
        <Muted>Scaffold with the CLI, or wire the CSS entry in an existing Vite + Tailwind v4 app.</Muted>
      </div>
      <div className="preview-install-grid">
        <Card>
          <CardHeader>
            <CardTitle>Scaffold or add</CardTitle>
            <CardDescription>Start with a styled Vite project, then preview component source before adding it.</CardDescription>
          </CardHeader>
          <CardContent className="preview-page-stack">
            {scaffoldCommands.map((command) => <CodeBlock key={command} code={command} />)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Existing Vite app</CardTitle>
            <CardDescription>Install the library and Tailwind, then register the Tailwind Vite plugin.</CardDescription>
          </CardHeader>
          <CardContent className="preview-list-card">
            <CodeBlock code={"npm install synthex-ui\nnpm install -D tailwindcss @tailwindcss/vite"} />
            <CodeBlock code={existingAppCss} />
            <div>Save as <code>src/styles.css</code> and import it from <code>src/main.tsx</code>. Adjust <code>@source</code> if your CSS file lives elsewhere.</div>
            <Button onClick={() => window.open("https://github.com/Luseefor/synthex-ui", "_blank")}>View Repository</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
