import { existsSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { CliError } from "./errors";
import type { Framework, PackageManager } from "./project";

export type { Framework, PackageManager };

export const FRAMEWORKS: readonly Framework[] = ["vite", "next", "expo"];
export const PACKAGE_MANAGERS: readonly PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

const TEMPLATE_DIR_BY_FRAMEWORK: Record<Framework, string> = {
  vite: "starter",
  next: "next",
  expo: "native",
};

function currentDir(): string {
  return dirname(fileURLToPath(import.meta.url));
}

function isDistMode(): boolean {
  const here = currentDir();
  return here.endsWith(`${sep}dist`) || here.includes(`${sep}dist${sep}`);
}

function getDistDir(): string {
  const here = currentDir();
  if (here.endsWith(`${sep}dist`)) {
    return here;
  }
  const distIndex = here.lastIndexOf(`${sep}dist${sep}`);
  if (distIndex !== -1) {
    return here.slice(0, distIndex + `${sep}dist`.length);
  }
  return resolve(here, "../../dist");
}

function getWorkspaceRoot(): string {
  return resolve(currentDir(), "../../../..");
}

export function getTemplateDirName(template: Framework): string {
  const dir = (TEMPLATE_DIR_BY_FRAMEWORK as Record<string, string>)[template];
  if (typeof dir !== "string" || dir.length === 0) {
    throw new CliError(`Unknown template "${String(template)}". Expected one of: vite, next, expo.`);
  }
  return dir;
}

export function getBundledAssetsDir(): string {
  return resolve(getDistDir(), "assets");
}

export function getBundledUiRoot(): string {
  return resolve(getBundledAssetsDir(), "ui");
}

export function getBundledStarterRoot(): string {
  return resolve(getBundledAssetsDir(), "templates/starter");
}

export function getBundledTemplateRoot(template: Framework = "vite"): string {
  return resolve(getBundledAssetsDir(), "templates", getTemplateDirName(template));
}

export function getBundledRegistryJsonPath(): string {
  return resolve(getBundledAssetsDir(), "registry.json");
}

export function hasBundledAssets(): boolean {
  return existsSync(getBundledUiRoot()) && existsSync(getBundledRegistryJsonPath());
}

export function getDefaultRegistryRoot(): string {
  if (isDistMode()) {
    return getBundledUiRoot();
  }
  return resolve(getWorkspaceRoot(), "packages/ui/src");
}

export function getDefaultStarterRoot(): string {
  if (isDistMode()) {
    return getBundledStarterRoot();
  }
  return resolve(getWorkspaceRoot(), "templates/starter");
}

export function getDefaultTemplateRoot(template: Framework = "vite"): string {
  const dir = getTemplateDirName(template);
  if (isDistMode()) {
    return resolve(getBundledAssetsDir(), "templates", dir);
  }
  return resolve(getWorkspaceRoot(), "templates", dir);
}

export function getDefaultRegistryJsonPath(): string {
  if (isDistMode()) {
    return getBundledRegistryJsonPath();
  }
  return resolve(getWorkspaceRoot(), "registry.json");
}
