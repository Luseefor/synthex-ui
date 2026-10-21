import { existsSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

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

export function getBundledAssetsDir(): string {
  return resolve(getDistDir(), "assets");
}

export function getBundledUiRoot(): string {
  return resolve(getBundledAssetsDir(), "ui");
}

export function getBundledStarterRoot(): string {
  return resolve(getBundledAssetsDir(), "templates/starter");
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

export function getDefaultRegistryJsonPath(): string {
  if (isDistMode()) {
    return getBundledRegistryJsonPath();
  }
  return resolve(getWorkspaceRoot(), "registry.json");
}
