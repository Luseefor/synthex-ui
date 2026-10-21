import type { RegistryComponentFile } from "./componentTypes";
import { scanComponentImports } from "./componentImports";

// Report package roots referenced by the selected JS/TS files, including type
// imports. CSS/assets, host React peers, builtins and relative paths are omitted.
const HOST_PEERS: ReadonlySet<string> = new Set(["react", "react-dom", "react-native"]);

/** Bare Node.js builtins (without the `node:` prefix; prefixed forms are excluded via scheme check). */
const NODE_BUILTINS: ReadonlySet<string> = new Set([
  "assert",
  "async_hooks",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "inspector",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "sea",
  "sqlite",
  "stream",
  "string_decoder",
  "sys",
  "test",
  "timers",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "wasi",
  "worker_threads",
  "zlib",
]);

const JS_SOURCE_EXTENSIONS: ReadonlySet<string> = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
]);

function isJsSource(relativePath: string): boolean {
  const base = relativePath.split("/").pop()?.split("\\").pop() ?? relativePath;
  const dot = base.lastIndexOf(".");
  if (dot === -1) return false;
  return JS_SOURCE_EXTENSIONS.has(base.slice(dot).toLowerCase());
}

function normalizeSpec(raw: string): string | null {
  if (raw.length === 0) return null;
  if (raw === "." || raw === ".." || raw.startsWith("./") || raw.startsWith("../")) {
    return null;
  }
  if (raw.startsWith("/") || raw.startsWith("\\")) return null;
  // URL schemes (`node:`, `file:`, `data:`, `https:`, ...) and Windows drive absolute paths.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return null;

  let root: string;
  if (raw.startsWith("@")) {
    const parts = raw.split("/");
    if (parts.length < 2) return null;
    const scope = parts[0] as string;
    const name = parts[1] as string;
    if (scope.length < 2 || name.length === 0) return null;
    root = `${scope}/${name}`;
  } else {
    const slash = raw.indexOf("/");
    root = slash === -1 ? raw : raw.slice(0, slash);
    if (root.length === 0) return null;
  }

  // Loose npm-name validation to drop garbage string contents.
  if (!/^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/i.test(root)) {
    return null;
  }
  if (HOST_PEERS.has(root)) return null;
  if (NODE_BUILTINS.has(root)) return null;
  return root;
}


export function collectComponentDependencies(files: readonly RegistryComponentFile[]): string[] {
  const collected = new Set<string>();
  for (const file of files) {
    if (file.content.includes(0) || !/\.[cm]?[jt]sx?$/i.test(file.relativePath)) continue;
    for (const specifier of scanComponentImports(file.content.toString("utf8")).specifiers) {
      const root = normalizeSpec(specifier);
      if (root !== null) collected.add(root);
    }
  }
  return [...collected].sort((a, b) => a.localeCompare(b));
}
