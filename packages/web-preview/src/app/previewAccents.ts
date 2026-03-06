export type PreviewAccentName = "steel" | "stone" | "bronze" | "mulberry";

interface PreviewAccentTone {
  readonly primary: string;
  readonly primaryHover: string;
  readonly primaryMuted: string;
  readonly ring: string;
  readonly accent: string;
  readonly accentMuted: string;
}

interface PreviewAccentDefinition {
  readonly label: string;
  readonly swatch: string;
  readonly light: PreviewAccentTone;
  readonly dark: PreviewAccentTone;
}

export const previewAccentPresets: Record<PreviewAccentName, PreviewAccentDefinition> = {
  steel: {
    label: "Steel",
    swatch: "#93a8bf",
    light: {
      primary: "#93a8bf",
      primaryHover: "#7f96af",
      primaryMuted: "#eaf0f6",
      ring: "#93a8bf",
      accent: "#eef3f8",
      accentMuted: "#e5ebf2",
    },
    dark: {
      primary: "#9db1c6",
      primaryHover: "#b3c3d5",
      primaryMuted: "rgba(157, 177, 198, 0.22)",
      ring: "#9db1c6",
      accent: "#273242",
      accentMuted: "#1d2634",
    },
  },
  stone: {
    label: "Stone",
    swatch: "#adb9a3",
    light: {
      primary: "#adb9a3",
      primaryHover: "#97a38e",
      primaryMuted: "#edf2e9",
      ring: "#adb9a3",
      accent: "#eff3eb",
      accentMuted: "#e5eadf",
    },
    dark: {
      primary: "#b7c1ae",
      primaryHover: "#cad2c4",
      primaryMuted: "rgba(183, 193, 174, 0.22)",
      ring: "#b7c1ae",
      accent: "#2b3428",
      accentMuted: "#20281e",
    },
  },
  bronze: {
    label: "Bronze",
    swatch: "#bc9972",
    light: {
      primary: "#bc9972",
      primaryHover: "#a8855f",
      primaryMuted: "#f6ede4",
      ring: "#bc9972",
      accent: "#f7eee5",
      accentMuted: "#eddcc9",
    },
    dark: {
      primary: "#caa27a",
      primaryHover: "#dfb891",
      primaryMuted: "rgba(202, 162, 122, 0.23)",
      ring: "#caa27a",
      accent: "#3a2d22",
      accentMuted: "#2a2119",
    },
  },
  mulberry: {
    label: "Mulberry",
    swatch: "#ab91b4",
    light: {
      primary: "#ab91b4",
      primaryHover: "#967aa0",
      primaryMuted: "#f2edf3",
      ring: "#ab91b4",
      accent: "#f3edf4",
      accentMuted: "#e7dce9",
    },
    dark: {
      primary: "#b79bc0",
      primaryHover: "#ccafd4",
      primaryMuted: "rgba(183, 155, 192, 0.23)",
      ring: "#b79bc0",
      accent: "#34253b",
      accentMuted: "#261b2c",
    },
  },
};
