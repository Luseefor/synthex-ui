import { stat } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getBundledAssetsDir,
  getBundledRegistryJsonPath,
  getBundledStarterRoot,
  getBundledUiRoot,
  getDefaultRegistryJsonPath,
  getDefaultRegistryRoot,
  getDefaultStarterRoot,
} from "./assets";
import { getDefaultRegistryRoot as listRegistryRoot } from "../commands/list";
import { getDefaultStarterRoot as createStarterRoot } from "../commands/create";

describe("cli asset paths", () => {
  it("resolves absolute defaults that exist on disk", async () => {
    const registryRoot = getDefaultRegistryRoot();
    const starterRoot = getDefaultStarterRoot();
    const registryJson = getDefaultRegistryJsonPath();

    expect(isAbsolute(registryRoot)).toBe(true);
    expect(isAbsolute(starterRoot)).toBe(true);
    expect(isAbsolute(registryJson)).toBe(true);

    expect((await stat(registryRoot)).isDirectory()).toBe(true);
    expect((await stat(starterRoot)).isDirectory()).toBe(true);
    expect((await stat(registryJson)).isFile()).toBe(true);
  });

  it("is independent of process.cwd()", () => {
    const before = {
      registryRoot: getDefaultRegistryRoot(),
      starterRoot: getDefaultStarterRoot(),
      registryJson: getDefaultRegistryJsonPath(),
    };
    const previous = process.cwd();
    process.chdir("/tmp");
    try {
      expect(getDefaultRegistryRoot()).toBe(before.registryRoot);
      expect(getDefaultStarterRoot()).toBe(before.starterRoot);
      expect(getDefaultRegistryJsonPath()).toBe(before.registryJson);
    } finally {
      process.chdir(previous);
    }
  });

  it("delegates list/create defaults to the shared asset utility", () => {
    expect(listRegistryRoot()).toBe(getDefaultRegistryRoot());
    expect(createStarterRoot()).toBe(getDefaultStarterRoot());
  });

  it("locates bundled assets under dist/assets", () => {
    expect(getBundledAssetsDir().endsWith("dist/assets")).toBe(true);
    expect(getBundledUiRoot().endsWith("dist/assets/ui")).toBe(true);
    expect(getBundledStarterRoot().endsWith("dist/assets/templates/starter")).toBe(true);
    expect(getBundledRegistryJsonPath().endsWith("dist/assets/registry.json")).toBe(true);
  });
});
