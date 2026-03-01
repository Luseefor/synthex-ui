import type { ColorScale } from "../types";

/**
 * Light theme color palette.
 *
 * Based on a Zinc-neutral foundation (shadcn-grade) with saturated
 * semantic colors for destructive/accent/primary. All neutrals are
 * truly neutral — no blue or green tint.
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
  foregroundMuted: "#71717a",        // zinc-500
  foregroundOnBrand: "#fafafa",      // zinc-50

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

  // ── Destructive (red — bold, not pastel) ──────────────
  destructive: "#ef4444",           // red-500
  destructiveHover: "#dc2626",      // red-600
  destructiveMuted: "#fef2f2",      // red-50

  // ── Accent ────────────────────────────────────────────
  accent: "#f4f4f5",                // zinc-100 (neutral like shadcn)
  accentMuted: "#fafafa",           // zinc-50

  // ── Focus ring ────────────────────────────────────────
  ring: "#2563eb",                  // blue-600 (solid, visible)
};
