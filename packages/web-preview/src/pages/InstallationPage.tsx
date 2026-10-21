import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, H2, Muted } from "synthex-ui/components";

const scaffoldCommands = [
  "npx @luseefor/synthex-cli@latest create my-app",
  "npx @luseefor/synthex-cli@latest create my-app --template next",
  "npx @luseefor/synthex-cli@latest create my-app --template expo",
];

const setupCommands = [
  "npx @luseefor/synthex-cli@latest setup --dry-run",
  "npx @luseefor/synthex-cli@latest setup",
  "npx @luseefor/synthex-cli@latest setup --cwd apps/web",
];

const existingAppCss = `@import "tailwindcss";
@import "synthex-ui/styles.css";

@source "../node_modules/synthex-ui/dist";`;

const viteInstall = `npm install synthex-ui
npm install -D tailwindcss @tailwindcss/vite`;

const viteImport = `import "./synthex.css"; // once, from your app entry`;

const nextInstall = `npm install synthex-ui
npm install -D tailwindcss @tailwindcss/postcss postcss`;

const nextWiring = `// app/layout.tsx or src/app/layout.tsx (root layout, recommended)
import "./synthex.css";
import { SynthexProvider } from "../components/synthex-provider";`;

const expoInstall = `npm install synthex-ui lucide-react-native
npx expo install react-native-svg react-dom --npm`;

const expoWiring = `// App.tsx
import { SynthexProvider } from "./components/synthex-provider";`;

const REPO_URL = "https://github.com/Luseefor/synthex-ui";
const FRAMEWORKS_URL = "https://github.com/Luseefor/synthex-ui/blob/ace/framework-onboarding/docs/frameworks.md";

function CodeBlock({ code }: { readonly code: string }) {
  return <pre className="preview-code-block"><code>{code}</code></pre>;
}

export function InstallationPage() {
  return (
    <section className="preview-page-stack">
      <div className="preview-page-heading">
        <Badge variant="outline">Quick Start</Badge>
        <H2>Installation</H2>
        <Muted>Scaffold a Vite, Next, or Expo starter, or run setup in an existing app. Create and setup are in CLI source for an upcoming release.</Muted>
      </div>
      <div className="preview-install-grid">
        <Card>
          <CardHeader>
            <CardTitle>Scaffold a starter</CardTitle>
            <CardDescription>Vite is the default template. Create does not install dependencies; run the printed install next.</CardDescription>
          </CardHeader>
          <CardContent className="preview-page-stack">
            {scaffoldCommands.map((command) => <CodeBlock key={command} code={command} />)}
            <div>Then <code>cd my-app</code>, install (<code>npm install</code> / <code>pnpm install</code> / <code>yarn install</code> / <code>bun install</code>), and run <code>npm run dev</code> for Vite / Next or <code>npm start</code> for Expo.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Existing app: setup</CardTitle>
            <CardDescription>Detects vite, next, or expo from dependencies. Writes synthex-ui.json plus CSS and provider.</CardDescription>
          </CardHeader>
          <CardContent className="preview-list-card">
            {setupCommands.map((command) => <CodeBlock key={command} code={command} />)}
            <CodeBlock code={existingAppCss} />
            <div>Setup never installs deps and never edits <code>vite.config.ts</code>, <code>layout.tsx</code>, or <code>App.tsx</code>. Dry-run reports conflicts like a real run without writing. Wire the entry point by hand; see below.</div>
            <Button onClick={() => window.open(REPO_URL, "_blank")}>View Repository</Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Wire the entry point</CardTitle>
          <CardDescription>What setup prints. Next uses the App Router server/client split; Expo uses native imports and no CSS.</CardDescription>
        </CardHeader>
        <CardContent className="preview-list-card">
          <div><strong>Vite.</strong> Run both printed installs, keep the Tailwind Vite plugin, import the generated CSS once, wrap with the generated provider.</div>
          <CodeBlock code={viteInstall} />
          <CodeBlock code={viteImport} />
          <div><strong>Next.</strong> Run both printed installs, keep <code>@tailwindcss/postcss</code> in <code>postcss.config.mjs</code>. Import the CSS in the root layout (recommended) and render the <code>&quot;use client&quot;</code> provider. See <a href="https://tailwindcss.com/docs/installation/using-postcss" target="_blank" rel="noreferrer">Tailwind PostCSS guide</a> and <a href="https://nextjs.org/docs/app/getting-started/server-and-client-components" target="_blank" rel="noreferrer">Next.js server and client components</a>.</div>
          <CodeBlock code={nextInstall} />
          <CodeBlock code={nextWiring} />
          <div><strong>Expo (SDK 58).</strong> No CSS file. The generated provider imports theming from <code>synthex-ui/native</code>. See <a href="https://docs.expo.dev/" target="_blank" rel="noreferrer">Expo docs</a>.</div>
          <CodeBlock code={expoInstall} />
          <CodeBlock code={expoWiring} />
          <div>Full reference: <a href={FRAMEWORKS_URL} target="_blank" rel="noreferrer">docs/frameworks.md</a>. <code>init</code> is the legacy layout-engine command, not framework setup.</div>
        </CardContent>
      </Card>
    </section>
  );
}
