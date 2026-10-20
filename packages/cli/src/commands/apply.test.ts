import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ACCENT_PRESETS, applyPreset } from "./apply";

async function createTempCwd(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "synthex-apply-"));
}

describe("applyPreset", () => {
  it("writes components/ui/theme-preset.json with the accent and default mode", async () => {
    const cwd = await createTempCwd();

    const result = await applyPreset("steel", { cwd });

    expect(result.accent).toBe("steel");
    expect(result.mode).toBe("light");
    expect(result.created).toBe(true);
    expect(result.file).toBe(path.join(path.resolve(cwd), "components", "ui", "theme-preset.json"));

    const raw = await readFile(result.file, "utf8");
    expect(JSON.parse(raw)).toEqual({ accent: "steel", mode: "light" });
  });

  it("accepts every documented accent preset", async () => {
    expect([...ACCENT_PRESETS].sort()).toEqual(
      ["amber", "blue", "bronze", "emerald", "mulberry", "rose", "steel", "stone", "violet"],
    );

    for (const preset of ACCENT_PRESETS) {
      const cwd = await createTempCwd();
      const result = await applyPreset(preset, { cwd, only: "theme" });
      expect(result.accent).toBe(preset);
    }
  });

  it("updates the accent while preserving an existing mode", async () => {
    const cwd = await createTempCwd();

    await applyPreset("steel", { cwd });
    const target = path.join(cwd, "components", "ui", "theme-preset.json");
    await readFile(target, "utf8");
    const { writeFile } = await import("node:fs/promises");
    await writeFile(target, `${JSON.stringify({ accent: "steel", mode: "dark" }, null, 2)}\n`, "utf8");

    const result = await applyPreset("rose", { cwd });

    expect(result.created).toBe(false);
    expect(result.mode).toBe("dark");
    const raw = await readFile(target, "utf8");
    expect(JSON.parse(raw)).toEqual({ accent: "rose", mode: "dark" });
  });

  it("rejects unknown presets and unsupported --only scopes", async () => {
    const cwd = await createTempCwd();

    await expect(applyPreset("nope", { cwd })).rejects.toThrow(/unknown preset/i);
    await expect(applyPreset("steel", { cwd, only: "layout" })).rejects.toThrow(/--only/i);
  });
});
