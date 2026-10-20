import { readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Command } from "commander";

export function getDefaultRegistryRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../../../ui/src");
}

// Mirrors scripts/generate-registry.mjs: infrastructure dirs stay in
// registry.json with `internal: true` but are hidden from `synthex list`.
const INTERNAL_COMPONENTS: ReadonlySet<string> = new Set(["components", "dashboard"]);

export function isInternalComponent(name: string): boolean {
  return name.startsWith("_") || INTERNAL_COMPONENTS.has(name);
}

export interface ListOptions {
  readonly includeInternal?: boolean;
}

export async function listAvailableComponents(
  registryRoot: string = getDefaultRegistryRoot(),
  options: ListOptions = {},
): Promise<string[]> {
  const entries = await readdir(registryRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => options.includeInternal === true || !isInternalComponent(name))
    .sort((a, b) => a.localeCompare(b));
}

export function registerListCommand(program: Command): void {
  program
    .command("list")
    .description("List available components in the local registry.")
    .option("--all", "Include internal components (_shared, components, dashboard)", false)
    .action(async (cliOptions: { all?: boolean }) => {
      const components = await listAvailableComponents(getDefaultRegistryRoot(), {
        includeInternal: cliOptions.all ?? false,
      });

      for (const component of components) {
        process.stdout.write(`${component}\n`);
      }
    });
}
