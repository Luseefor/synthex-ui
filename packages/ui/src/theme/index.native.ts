export { ThemeProvider } from "../_shared/theme/ThemeProvider.native";
export {
  accentPresets,
  createTheme,
  darkTheme,
  defaultTheme,
  lightTheme,
  resolveAccentPreset,
  themePresets,
  themeToCssVariables,
} from "../_shared/theme/createTheme";
export { useTheme } from "../_shared/theme/context";
export { colors } from "../_shared/tokens/colors";
export { motion } from "../_shared/tokens/motion";
export { radius } from "../_shared/tokens/radius";
export { shadows } from "../_shared/tokens/shadows";
export { space } from "../_shared/tokens/space";
export { typography } from "../_shared/tokens/typography";
export type {
  AccentPresetName,
  ColorScale,
  DeepPartial,
  MotionScale,
  RadiusScale,
  ShadowScale,
  SpaceScale,
  SynthexTheme,
  ThemeMode,
  ThemeProviderProps,
  TypographyScale,
} from "../_shared/types";
