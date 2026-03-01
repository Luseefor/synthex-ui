import { describe, expect, it } from "vitest";
import { defineVariants, resolveVariantStyles, resolveVariants } from "./variants";

describe("variant helpers", () => {
  it("resolves defaults when no props are provided", () => {
    const definition = defineVariants({
      variants: {
        variant: ["default", "secondary"] as const,
        size: ["sm", "md"] as const,
      },
      defaultVariants: {
        variant: "default",
        size: "md",
      },
    });

    expect(resolveVariants(definition)).toEqual({
      variant: "default",
      size: "md",
    });
  });

  it("overrides defaults with explicit props", () => {
    const definition = defineVariants({
      variants: {
        variant: ["default", "secondary"] as const,
      },
      defaultVariants: {
        variant: "default",
      },
    });

    expect(resolveVariants(definition, { variant: "secondary" })).toEqual({
      variant: "secondary",
    });
  });

  it("collects slot styles for shared component definitions", () => {
    const definition = defineVariants({
      variants: {
        variant: ["default", "accent"] as const,
      },
      defaultVariants: {
        variant: "default",
      },
    });

    const resolved = resolveVariantStyles(
      definition,
      {
        slots: ["root", "label"] as const,
        base: {
          root: "base",
        },
        variants: {
          variant: {
            accent: {
              root: "root-accent",
              label: "label-accent",
            },
          },
        },
      },
      {
        variant: "accent",
      },
    );

    expect(resolved.root).toEqual(["base", "root-accent"]);
    expect(resolved.label).toEqual(["label-accent"]);
  });
});
