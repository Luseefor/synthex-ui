import type { AccentPresetName, DeepPartial, SynthexTheme, ThemeMode } from "../types";
export declare const lightTheme: SynthexTheme;
/**
 * Dark theme — Zinc-neutral foundation.
 * Inspired by shadcn's dark Zinc palette:
 *   bg ≈ zinc-950, surface ≈ zinc-900, border ≈ white/10%
 */
export declare const darkTheme: SynthexTheme;
export declare const themePresets: Record<ThemeMode, SynthexTheme>;
export declare const defaultTheme: SynthexTheme;
export declare const accentPresets: Record<AccentPresetName, {
    readonly label: string;
    readonly swatch: string;
    readonly theme: DeepPartial<SynthexTheme>;
}>;
export declare function resolveAccentPreset(accentPreset?: AccentPresetName): DeepPartial<SynthexTheme> | undefined;
export declare function createTheme(overrides?: DeepPartial<SynthexTheme>, options?: {
    readonly accentPreset?: AccentPresetName;
    readonly mode?: ThemeMode;
}): SynthexTheme;
export declare function themeToCssVariables(theme: SynthexTheme): Record<string, string>;
//# sourceMappingURL=createTheme.d.ts.map