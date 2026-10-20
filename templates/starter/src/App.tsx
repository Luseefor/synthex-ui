import { Button } from "synthex-ui/components";
import { ThemeProvider } from "synthex-ui/theme";

export default function App() {
  return (
    <ThemeProvider>
      <main style={{ padding: 24, maxWidth: 560, margin: "0 auto" }}>
        <h1>Synthex Starter</h1>
        <p>Minimal Vite + React + TS app using synthex-ui.</p>
        <Button onClick={() => window.alert("Hello from Synthex")}>Get started</Button>
      </main>
    </ThemeProvider>
  );
}
