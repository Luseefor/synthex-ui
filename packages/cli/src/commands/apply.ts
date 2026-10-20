import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Command } from "commander";
import { CliError } from "../utils/errors";
import { logger } from "../utils/logger";

export const ACCENT_PRESETS = [
  "steel",
  "stone",
  "bronze",
  "mulberry",
  "blue",
  "emerald",
  "violet",
  "amber",
  "rose",
] as const;

export type AccentPresetName = (typeof ACCENT_PRESETS)[number];
export type ThemePresetMode = "light" | "dark";

export interface ApplyPresetOptions {
  readonly cwd?: string;
  readonly only?: string;
}

export interface ApplyPresetResult {
  readonly accent: AccentPresetName;
  readonly mode: ThemePresetMode;
  readonly cwd: string;
  readonly file: string;
  readonly created: boolean;
}

interface ApplyCommandCliOptions {
  cwd?: string;
  only?: string;
}

export function isAccentPreset(value: string): value is AccentPresetName {
  return (ACCENT_PRESETS as readonly string[]).includes(value);
}

export async function applyPreset(preset: string, options: ApplyPresetOptions = {}): Promise<ApplyPresetResult> {
  if (!isAccentPreset(preset)) {
    throw new CliError(
      `Unknown preset "${preset}". Expected one of: ${ACCENT_PRESETS.join(", ")}.`,
    );
  }

  if (options.only !== undefined && options.only !== "theme") {
    throw new CliError(`Unknown --only scope "${options.only}". Only "theme" is supported.`);
  }

  const cwd = path.resolve(options.cwd ?? process.cwd());
  const file = path.join(cwd, "components", "ui", "theme-preset.json");
  const created = !(await pathExists(file));
  const mode = created ? "light" : await readExistingMode(file);

  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify({ accent: preset, mode }, null, 2)}\n`, "utf8");

  return { accent: preset, mode, cwd, file, created };
}

export function registerApplyCommand(program: Command): void {
  program
    .command("apply")
    .description("Apply a theme accent preset (writes components/ui/theme-preset.json).")
    .argument("<preset>", `Accent preset (${ACCENT_PRESETS.join("|")})`)
    .option("--only <scope>", "Limit apply scope (only \"theme\" is supported)")
    .option("--cwd <dir>", "Target project directory")
    .action(async (preset: string, cliOptions: ApplyCommandCliOptions) => {
      const result = await applyPreset(preset, {
        cwd: cliOptions.cwd,
        only: cliOptions.only,
      });

      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      logger.success(`Applied preset "${result.accent}" (${result.mode}).`);
    });
}

async function readExistingMode(file: string): Promise<ThemePresetMode> {
  try {
    const raw = await readFile(file, "utf8");
    const data: unknown = JSON.parse(raw);
    if (typeof data === "object" && data !== null) {
      const mode = (data as { mode?: unknown }).mode;
      if (mode === "light" || mode === "dark") {
        return mode;
      }
    }
  } catch {
    // Corrupt or unreadable file: fall back to the default mode.
  }
  return "light";
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await readFile(target);
    return true;
  } catch {
    return false;
  }
}
