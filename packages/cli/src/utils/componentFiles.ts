import path from "node:path";
import { CliError } from "./errors";
import { scanComponentImports } from "./componentImports";
import type { ComponentPlatform, RegistryComponentFile } from "./componentTypes";

/**
 * Bounded shared-file pruning helper.
 *
 * Contract: for a configured platform (`web`/`native`) every non-`_shared`
 * file in the planned set is already retained (metadata closure selected it);
 * only component `_shared` is pruned to the transitive closure of actual
 * relative imports reachable from retained files. Legacy `platform === null`
 * returns the input unchanged. Explicitly requesting `_shared` preserves all
 * of it.
 *
 * Resolution uses `file.destination` (absolute planned paths) against the
 * planned file set, supporting extensionless, directory `index`, and
 * `.js` -> `.ts`/`.tsx` specifiers. Native inputs are expected already
 * transformed with the alias `index.ts` present. No TypeScript compiler is
 * used: a small statement-bounded scanner extracts only literal static
 * `import ... from`, side-effect `import`, `export ... from`, literal
 * `import()` and `require()`/`require.resolve()` specifiers while skipping
 * comments, strings and template bodies.
 *
 * Fail-closed: an unresolvable relative import whose target falls inside the
 * destination root throws an actionable `CliError` before any write. Bare
 * external specifiers are ignored. Non-literal dynamic `import()`/`require()`
 * (variable, template, concatenation) is unsupported to analyze precisely, so
 * it conservatively preserves the whole `_shared` pool rather than risk
 * broken code. Binary/assets (`Buffer` containing NUL, or non-JS sources) are
 * never scanned but are retained when referenced. Cycles are safe via a
 * visited set; output preserves input order and never mutates inputs.
 */

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

function normalizeRequestName(request: string): string | null {
  if (
    request.startsWith("http://") ||
    request.startsWith("https://") ||
    request.startsWith("data:")
  ) {
    return null;
  }
  if (request.startsWith("@")) {
    const parts = request.slice(1).split("/");
    const last = parts[parts.length - 1] ?? "";
    return last.length > 0 ? last : null;
  }
  return request;
}

function stripQueryHash(spec: string): string {
  const hash = spec.indexOf("#");
  const query = spec.indexOf("?");
  let end = spec.length;
  if (hash !== -1) end = Math.min(end, hash);
  if (query !== -1) end = Math.min(end, query);
  return spec.slice(0, end);
}

const EXTENSIONLESS_PROBE: readonly string[] = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".json"];

function tsEquivalents(ext: string): readonly string[] {
  switch (ext) {
    case ".js":
      return [".ts", ".tsx"];
    case ".jsx":
      return [".tsx", ".ts"];
    case ".mjs":
      return [".mts", ".ts"];
    case ".cjs":
      return [".cts", ".ts"];
    default:
      return [];
  }
}

/**
 * Extensions that denote an actual file on disk (sources plus common
 * referenced assets). Any other trailing suffix — notably the platform /
 * flavor stems `.web`, `.native`, `.shared` — is an extensionless module
 * stem (`./button.web` -> `button.web.tsx`), so on an exact miss it is
 * probed with source extensions appended. Exact hits always win first, so a
 * real asset file (e.g. `logo.png`) is never shadowed by stem probing.
 */
const KNOWN_FILE_EXTENSIONS: ReadonlySet<string> = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".ico",
  ".css",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".mp3",
  ".mp4",
]);

function probeStem(
  base: string,
  lookup: (p: string) => RegistryComponentFile | undefined,
): RegistryComponentFile | null {
  for (const cand of EXTENSIONLESS_PROBE) {
    const hit = lookup(base + cand);
    if (hit !== undefined) return hit;
  }
  for (const cand of EXTENSIONLESS_PROBE) {
    const hit = lookup(path.join(base, `index${cand}`));
    if (hit !== undefined) return hit;
  }
  return null;
}

function resolveRelativeSpecifier(
  importerDestination: string,
  rawSpec: string,
  byDestination: ReadonlyMap<string, RegistryComponentFile>,
): RegistryComponentFile | null {
  const spec = stripQueryHash(rawSpec);
  if (spec.length === 0) return null;
  const base = path.normalize(path.resolve(path.dirname(importerDestination), spec));
  const lookup = (p: string): RegistryComponentFile | undefined =>
    byDestination.get(path.normalize(p));
  // Exact file always wins (covers real assets like `./logo.png`).
  const exact = lookup(base);
  if (exact !== undefined) return exact;
  const ext = path.extname(base).toLowerCase();
  if (ext === ".js" || ext === ".jsx" || ext === ".mjs" || ext === ".cjs") {
    const stripped = base.slice(0, -ext.length);
    for (const cand of tsEquivalents(ext)) {
      const hit = lookup(stripped + cand);
      if (hit !== undefined) return hit;
    }
    for (const cand of tsEquivalents(ext)) {
      const hit = lookup(path.join(stripped, `index${cand}`));
      if (hit !== undefined) return hit;
    }
    return null;
  }
  // No extension, or an arbitrary non-file suffix (`.web`, `.native`,
  // `.shared`, ...): treat as a module stem and probe source extensions.
  if (ext === "" || !KNOWN_FILE_EXTENSIONS.has(ext)) {
    return probeStem(base, lookup);
  }
  // Known file extension (`.ts`, `.png`, ...) with no exact match: missing.
  return null;
}

function inferDestinationRoot(files: readonly RegistryComponentFile[]): string | null {
  for (const file of files) {
    if (file.component !== "_shared") continue;
    const suffix = path.normalize(path.join(file.component, file.relativePath));
    const dest = path.normalize(file.destination);
    if (dest === suffix) return path.parse(dest).root;
    if (dest.endsWith(path.sep + suffix)) {
      return dest.slice(0, dest.length - suffix.length - 1) || path.parse(dest).root;
    }
  }
  const first = files[0];
  if (first === undefined) return null;
  const suffix = path.normalize(path.join(first.component, first.relativePath));
  const dest = path.normalize(first.destination);
  if (dest.endsWith(path.sep + suffix)) {
    return dest.slice(0, dest.length - suffix.length - 1) || path.parse(dest).root;
  }
  return path.dirname(dest);
}

function isInside(parent: string, child: string): boolean {
  const rel = path.relative(parent, child);
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}

/**
 * Prune planned `_shared` files to the transitive relative-import closure.
 *
 * See module docs for the full contract. Pure: no filesystem, no writes.
 */
export function selectComponentFiles(
  files: readonly RegistryComponentFile[],
  requestedComponents: readonly string[],
  platform: ComponentPlatform,
): readonly RegistryComponentFile[] {
  if (platform === null) return files;
  if (files.length === 0) return files;
  for (const request of requestedComponents) {
    if (normalizeRequestName(request) === "_shared") return files;
  }
  const shared = files.filter((file) => file.component === "_shared");
  if (shared.length === 0) return files;
  const roots = files.filter((file) => file.component !== "_shared");
  if (roots.length === 0) return files;

  const byDestination = new Map<string, RegistryComponentFile>();
  for (const file of files) byDestination.set(path.normalize(file.destination), file);

  const destinationRoot = inferDestinationRoot(files);
  const retained = new Set<string>();
  for (const file of roots) retained.add(path.normalize(file.destination));
  const queue: RegistryComponentFile[] = [...roots];
  const parsed = new Set<string>();

  while (queue.length > 0) {
    const current = queue.pop() as RegistryComponentFile;
    const key = path.normalize(current.destination);
    if (parsed.has(key)) continue;
    parsed.add(key);
    if (current.content.includes(0)) continue;
    if (!isJsSource(current.relativePath)) continue;
    const source = current.content.toString("utf8");
    const { specifiers, hasDynamic } = scanComponentImports(source);
    if (hasDynamic) return files;
    for (const spec of specifiers) {
      if (!(spec === "." || spec === ".." || spec.startsWith("./") || spec.startsWith("../"))) continue;
      const target = resolveRelativeSpecifier(current.destination, spec, byDestination);
      if (target !== undefined && target !== null) {
        const targetKey = path.normalize(target.destination);
        if (!retained.has(targetKey)) {
          retained.add(targetKey);
          queue.push(target);
        }
        continue;
      }
      const resolvedBase = path.normalize(
        path.resolve(path.dirname(current.destination), stripQueryHash(spec)),
      );
      const insideRoot =
        destinationRoot === null ||
        resolvedBase === destinationRoot ||
        isInside(destinationRoot, resolvedBase);
      if (insideRoot) {
        throw new CliError(
          `Cannot resolve relative import "${spec}" from "${current.component}/${current.relativePath}" ` +
            `(resolved to "${resolvedBase}"). The referenced file is missing from the planned file set; ` +
            `add the missing _shared file to the registry or fix the import before writing.`,
          1,
          { component: current.component, relativePath: current.relativePath, spec, resolvedBase },
        );
      }
    }
  }

  return files.filter((file) => retained.has(path.normalize(file.destination)));
}
