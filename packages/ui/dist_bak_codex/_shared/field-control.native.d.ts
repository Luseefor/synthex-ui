import type { TextStyle, ViewStyle } from "react-native";
import type { SynthexTheme } from "./types";
export type FieldControlSize = "sm" | "md" | "lg";
export type FieldControlTone = "default" | "invalid";
export declare function createFieldControlStyle(theme: SynthexTheme, { multiline, size, tone, }: {
    readonly multiline?: boolean;
    readonly size?: FieldControlSize;
    readonly tone?: FieldControlTone;
}): TextStyle & ViewStyle;
//# sourceMappingURL=field-control.native.d.ts.map