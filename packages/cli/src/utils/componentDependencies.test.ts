import { describe, expect, it } from "vitest";
import { collectComponentDependencies } from "./componentDependencies";
import type { RegistryComponentFile } from "./componentTypes";

function makeFile(
  component: string,
  relativePath: string,
  content: string,
): RegistryComponentFile {
  return {
    component,
    relativePath,
    source: `registry/${component}/${relativePath}`,
    destination: `/tmp/synthex/${component}/${relativePath}`,
    content: Buffer.from(content, "utf8"),
    registryVersion: "1.1.0",
  };
}

// Source-like web Button: mirrors packages/ui/src/button/button.web.tsx
// (radix slot + cva + relative helpers).
const BUTTON_WEB = `import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../_shared/variants";
import type { ButtonSharedProps } from "./button.shared";

export const Button = React.forwardRef(() => null);
`;

// Mirrors packages/ui/src/_shared/variants.ts header.
const VARIANTS = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { cva as baseCva, type VariantProps as CvaVariantProps } from "class-variance-authority";

export { baseCva as cva };
`;

const BUTTON_SHARED = `import { defineVariants } from "../_shared/variants";
export const buttonVariants = defineVariants({ variants: {} });
`;

// Source-like native Button: no radix, only host peers + relative.
const BUTTON_NATIVE = `import * as React from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { useTheme } from "../_shared/theme/context";
import { resolveButtonVariants } from "./button.shared";

export const Button = React.forwardRef(() => null);
`;

describe("collectComponentDependencies", () => {
  it("does not turn an invalid package name into an install flag", () => {
    expect(collectComponentDependencies([makeFile("demo", "index.ts", 'import "--ignore-scripts"; import "real-pkg";')])).toEqual(["real-pkg"]);
  });

  it("returns empty for no files", () => {
    expect(collectComponentDependencies([])).toEqual([]);
  });

  it("collects Button web graph: radix-slot, cva, clsx, tailwind-merge", () => {
    const files = [
      makeFile("button", "button.web.tsx", BUTTON_WEB),
      makeFile("button", "button.shared.ts", BUTTON_SHARED),
      makeFile("_shared", "variants.ts", VARIANTS),
      makeFile("button", "index.ts", `export { Button } from "./button.web";\n`),
    ];
    expect(collectComponentDependencies(files)).toEqual(
      ["@radix-ui/react-slot", "class-variance-authority", "clsx", "tailwind-merge"].sort((a, b) =>
        a.localeCompare(b),
      ),
    );
  });

  it("native selection excludes the web radix dependency (platform-specific, not registry union)", () => {
    const nativeFiles = [
      makeFile("button", "button.native.tsx", BUTTON_NATIVE),
      makeFile("button", "button.shared.ts", BUTTON_SHARED),
      makeFile("button", "index.native.ts", `export { Button } from "./button.native";\n`),
    ];
    const deps = collectComponentDependencies(nativeFiles);
    expect(deps).not.toContain("@radix-ui/react-slot");
    // Native Button only touches host peers + relative files.
    expect(deps).toEqual([]);
  });

  it("counts type-only, side-effect, re-export, dynamic import and require forms", () => {
    const files = [
      makeFile(
        "demo",
        "index.ts",
        `
import type { Config } from "type-only-pkg";
import "side-effect-pkg";
export type { Thing } from "@scope/pkg/subpath";
export * from "reexport-pkg";
export { A } from "reexport-sub/sub/deep";
const lazy = await import("dynamic-pkg");
const cjs = require("cjs-pkg");
const resolved = require.resolve("resolve-pkg");
import { scoped } from "@radix-ui/react-slot/dist/index.js";
import fp from "lodash/fp";
`,
      ),
    ];
    expect(collectComponentDependencies(files)).toEqual(
      [
        "@scope/pkg",
        "cjs-pkg",
        "dynamic-pkg",
        "lodash",
        "@radix-ui/react-slot",
        "reexport-pkg",
        "reexport-sub",
        "resolve-pkg",
        "side-effect-pkg",
        "type-only-pkg",
      ].sort((a, b) => a.localeCompare(b)),
    );
  });

  it("excludes relative, absolute, node builtins and host peers (with subpaths)", () => {
    const files = [
      makeFile(
        "demo",
        "index.ts",
        `
import a from "./relative";
import b from "../up";
import c from "/absolute/path";
import fs from "fs";
import p from "path/posix";
import n from "node:crypto";
import r from "react";
import rd from "react-dom/server";
import rn from "react-native/Libraries/Utilities/Platform";
import real from "real-dep";
`,
      ),
    ];
    expect(collectComponentDependencies(files)).toEqual(["real-dep"]);
  });

  it("ignores imports inside comments and ordinary strings", () => {
    const files = [
      makeFile(
        "demo",
        "index.ts",
        `
// import "comment-pkg";
// require("comment-require")
/* import "block-pkg"; export * from "block-reexport"; */
const s1 = "import x from 'string-pkg'";
const s2 = 'export * from "string-pkg-2"';
const t = \`import "template-pkg"\`;
const u = "require(\\"string-require\\")";
import real from "real-pkg";
`,
      ),
    ];
    expect(collectComponentDependencies(files)).toEqual(["real-pkg"]);
  });

  it("handles comments between tokens and dedupes with stable sort", () => {
    const files = [
      makeFile("a", "a.ts", `import /* c */ "spaced-pkg";\nimport { x } /* c */ from /* c */ "spaced-pkg";\n`),
      makeFile("b", "b.ts", `import { y } from "zebra-pkg";\nimport { z } from "apple-pkg";\n`),
    ];
    expect(collectComponentDependencies(files)).toEqual(["apple-pkg", "spaced-pkg", "zebra-pkg"]);
  });

  it("skips binary content without false positives", () => {
    const binary: RegistryComponentFile = {
      component: "demo",
      relativePath: "logo.png",
      source: "registry/demo/logo.png",
      destination: "/tmp/synthex/demo/logo.png",
      content: Buffer.from([0x89, 0x50, 0x00, 0x41]),
      registryVersion: null,
    };
    expect(collectComponentDependencies([binary])).toEqual([]);
  });

  it("reports both a require in an export body and the following import (no cross-statement consume)", () => {
    const files = [
      makeFile("demo", "index.ts", `export const x = require('one')\nimport y from 'two'\n`),
    ];
    expect(collectComponentDependencies(files)).toEqual(["one", "two"]);
  });

  it("reports a dynamic import in an export body plus later static imports", () => {
    const files = [
      makeFile(
        "demo",
        "index.ts",
        `export const y = await import("in-export")\nimport z from "after-export"\n`,
      ),
    ];
    expect(collectComponentDependencies(files)).toEqual(["after-export", "in-export"]);
  });

  it("does not steal the next import when a local export has no from", () => {
    const files = [
      makeFile("demo", "index.ts", `export { a }\nconst s = require("after-export")\n`),
    ];
    expect(collectComponentDependencies(files)).toEqual(["after-export"]);
  });

  it("resolves very long valid named imports with no length cap", () => {
    const names = Array.from({ length: 600 }, (_, i) => `a${String(i).padStart(4, "0")}`).join(", ");
    const source = `import { ${names} } from "long-pkg";\n`;
    expect(source.length).toBeGreaterThan(2000);
    expect(collectComponentDependencies([makeFile("demo", "index.ts", source)])).toEqual([
      "long-pkg",
    ]);
  });

  it("only scans JS/TS sources; CSS @import and text assets are skipped by design", () => {
    const files = [
      makeFile("demo", "styles.css", `@import "css-pkg";\n.fake { color: red; }\n`),
      makeFile("demo", "notes.md", `import "md-fake";\n`),
      makeFile("demo", "data.json", `{"x": "import \\"json-fake\\""}\n`),
      makeFile("demo", "index.ts", `import real from "real-pkg";\n`),
    ];
    expect(collectComponentDependencies(files)).toEqual(["real-pkg"]);
  });
});
