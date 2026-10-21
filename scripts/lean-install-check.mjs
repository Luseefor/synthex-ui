#!/usr/bin/env node
// Build owned Button copies without synthex-ui or its transitive dependencies.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const selected = process.argv.slice(2);
if (selected.length !== 2 || selected[0] !== "--template" || !["vite", "next", "expo"].includes(selected[1])) {
  throw new Error("Usage: node scripts/lean-install-check.mjs --template vite|next|expo");
}
const template = selected[1];
const scratch = mkdtempSync(path.join(os.tmpdir(), `synthex-lean-${template}-`));

function run(command, args, cwd, timeout = 120000) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", timeout });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed:\n${(result.stderr || result.stdout || String(result.error)).slice(-8000)}`);
  return result.stdout;
}
function jsonOutput(output) {
  return JSON.parse(output.slice(output.indexOf("{"), output.lastIndexOf("}") + 1));
}
function write(app, relative, text) {
  const destination = path.join(app, relative);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, text);
}

try {
  const packed = JSON.parse(run("npm", ["pack", "--json", "--pack-destination", scratch], path.join(root, "packages/cli")))[0];
  run("tar", ["-xzf", path.join(scratch, packed.filename), "-C", scratch], scratch);
  const cli = path.join(scratch, "package/dist/index.js");
  run("node", [cli, "create", "app", "--template", template, "--cwd", scratch], scratch);
  const app = path.join(scratch, "app");
  const pkg = JSON.parse(readFileSync(path.join(app, "package.json"), "utf8"));
  delete pkg.dependencies["synthex-ui"];
  // These are needed by other native components, but not by Button.
  delete pkg.dependencies["lucide-react-native"];
  delete pkg.dependencies["react-native-svg"];
  run("node", [cli, "setup", "--cwd", app, "--package-manager", "npm"], app);
  const installed = jsonOutput(run("node", [cli, "add", "button", "--cwd", app], app));
  const ui = JSON.parse(readFileSync(path.join(root, "packages/ui/package.json"), "utf8"));
  for (const dependency of installed.dependencies) {
    const version = ui.dependencies?.[dependency] ?? ui.peerDependencies?.[dependency];
    if (!version) throw new Error(`No declared version for reported dependency ${dependency}`);
    pkg.dependencies[dependency] = version;
  }
  write(app, "package.json", `${JSON.stringify(pkg, null, 2)}\n`);
  // setup generates an optional provider for packaged components. This fixture
  // exercises a standalone owned Button, whose native theme has a default.
  const config = JSON.parse(readFileSync(path.join(app, "synthex-ui.json"), "utf8"));
  rmSync(path.join(app, config.provider), { force: true });
  if (template === "expo") {
    write(app, "App.tsx", 'import { Button } from "./components/ui/button";\nexport default function App() { return <Button>Lean native Button</Button>; }\n');
  } else {
    const entry = template === "vite" ? "src/App.tsx" : "app/page.tsx";
    const button = template === "vite" ? "./components/ui/button" : "../components/ui/button";
    write(app, entry, `"use client";\nimport { Button } from ${JSON.stringify(button)};\nexport default function App() { return <Button>Lean web Button</Button>; }\n`);
    // Copy CSS as an artifact, without installing the UI package.
    cpSync(path.join(root, "packages/ui/dist/styles.css"), path.join(app, "synthex-tokens.css"));
    const css = '@import "tailwindcss";\n@import "../synthex-tokens.css";\n';
    write(app, config.css, css);
    write(app, template === "vite" ? "src/styles.css" : "app/globals.css", '@import "./synthex.css";\n');
    if (template === "next") {
      write(app, "app/layout.tsx", 'import type { ReactNode } from "react";\nimport "./globals.css";\nexport default function Layout({ children }: { children: ReactNode }) { return <html lang="en"><body>{children}</body></html>; }\n');
      rmSync(path.join(app, "app/providers.tsx"), { force: true });
    }
  }
  run("npm", ["install", "--no-audit", "--no-fund"], app, 600000);
  const lock = JSON.parse(readFileSync(path.join(app, "package-lock.json"), "utf8"));
  if (lock.packages["node_modules/synthex-ui"]) throw new Error("Standalone consumer unexpectedly installed synthex-ui");
  if (template !== "expo" && lock.packages["node_modules/react-native"]) throw new Error("Web Button unexpectedly installed react-native");
  for (const script of template === "expo" ? ["typecheck", "export"] : ["build"]) {
    run("npm", ["run", script], app, 600000);
    console.log(`Lean ${template} Button: ${script} passed (${installed.files.length} files; ${installed.dependencies.join(", ")}).`);
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
