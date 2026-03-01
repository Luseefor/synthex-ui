import type { ReactNode } from "react";

export type ThemeMode = "light" | "dark";

export interface ColorScale {
  readonly background: string;
  readonly backgroundSubtle: string;
  readonly surface: string;
  readonly surfaceMuted: string;
  readonly surfaceRaised: string;
  readonly foreground: string;
  readonly foregroundMuted: string;
  readonly foregroundOnBrand: string;
  readonly border: string;
  readonly borderStrong: string;
  readonly primary: string;
  readonly primaryHover: string;
  readonly primaryMuted: string;
  readonly secondary: string;
  readonly secondaryHover: string;
  readonly secondaryMuted: string;
  readonly destructive: string;
  readonly destructiveHover: string;
  readonly destructiveMuted: string;
  readonly accent: string;
  readonly accentMuted: string;
  readonly ring: string;
}

export interface ShadowScale {
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly inset: string;
}

export interface RadiusScale {
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly pill: number;
}

export interface SpaceScale {
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly "2xl": number;
}

export interface TypographyScale {
  readonly family: {
    readonly sans: string;
    readonly mono: string;
  };
  readonly size: {
    readonly xs: number;
    readonly sm: number;
    readonly md: number;
    readonly lg: number;
    readonly xl: number;
    readonly "2xl": number;
    readonly "3xl": number;
    readonly "4xl": number;
  };
  readonly lineHeight: {
    readonly tight: number;
    readonly normal: number;
    readonly relaxed: number;
  };
  readonly weight: {
    readonly medium: "500";
    readonly semibold: "600";
    readonly bold: "700";
  };
}

export interface MotionScale {
  readonly fast: number;
  readonly normal: number;
  readonly slow: number;
  readonly easingEmphasized: string;
  readonly easingStandard: string;
}

export interface SynthexTheme {
  readonly mode: ThemeMode;
  readonly colors: ColorScale;
  readonly shadows: ShadowScale;
  readonly radius: RadiusScale;
  readonly space: SpaceScale;
  readonly typography: TypographyScale;
  readonly motion: MotionScale;
}

export type DeepPartial<T> = {
  readonly [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export interface ThemeProviderProps {
  readonly children: ReactNode;
  readonly mode?: ThemeMode;
  readonly theme?: DeepPartial<SynthexTheme>;
}
