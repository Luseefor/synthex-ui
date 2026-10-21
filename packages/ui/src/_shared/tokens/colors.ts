import type { ColorScale } from "../types";

/**
 * Light theme color palette.
 *
 * Based on a Zinc-neutral foundation (shadcn-grade) with saturated
 * semantic colors for destructive/accent/primary. All neutrals are
 * truly neutral, no blue or green tint.
 */
export const colors: ColorScale = {
  // ── Surfaces ──────────────────────────────────────────
  background: "#ffffff",
  backgroundSubtle: "#f4f4f5",       // zinc-100
  surface: "#ffffff",
  surfaceMuted: "#fafafa",           // zinc-50
  surfaceRaised: "#f4f4f5",          // zinc-100

  // ── Text ──────────────────────────────────────────────
  foreground: "#09090b",             // zinc-950
  // zinc-600 (not zinc-500): #71717a fails 4.5:1 on #f4f4f5 surfaces
  // (4.40:1); #52525b passes on all light surfaces (>=7.0:1).
  foregroundMuted: "#52525b",        // zinc-600
  foregroundOnBrand: "#fafafa",      // zinc-50
  // White passes on light destructive pair (#dc2626/#b91c1c: 4.63/6.20:1).
  foregroundOnDestructive: "#fafafa",

  // ── Borders ───────────────────────────────────────────
  border: "#e4e4e7",                 // zinc-200
  borderStrong: "#d4d4d8",           // zinc-300

  // ── Primary (blue-600) ────────────────────────────────
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  primaryMuted: "#dbeafe",           // blue-100

  // ── Secondary ─────────────────────────────────────────
  secondary: "#f4f4f5",             // zinc-100
  secondaryHover: "#e4e4e7",        // zinc-200
  secondaryMuted: "#fafafa",        // zinc-50

  // ── Destructive (red, bold, not pastel) ──────────────
  // red-600 / red-700 (not red-500): #ef4444 with #fafafa is 3.61:1
  // (fails); #dc2626/#b91c1c with #fafafa are 4.63/6.20:1 (pass).
  // Single shared on-brand text cannot pass both #ef4444 and #dc2626,
  // so the pair is darkened one shade to share white text.
  destructive: "#dc2626",           // red-600
  destructiveHover: "#b91c1c",      // red-700
  destructiveMuted: "#fef2f2",      // red-50

  // ── Accent ────────────────────────────────────────────
  accent: "#f4f4f5",                // zinc-100 (neutral like shadcn)
  accentMuted: "#fafafa",           // zinc-50

  // ── Focus ring ────────────────────────────────────────
  ring: "#2563eb",                  // blue-600 (solid, visible)
};
