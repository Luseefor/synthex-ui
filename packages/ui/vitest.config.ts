import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vitest/config";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: [
      {
        // react-resizable-panels ships separate browser/node builds. The node
        // build is an SSR stub (no panel registration, layout, or resize), and
        // vitest resolves the node condition by default, which leaves the
        // component non-functional in jsdom. Alias to the browser build so
        // tests exercise the same code path as the real web bundle.
        find: /^react-resizable-panels$/,
        replacement: resolve(
          root,
          `node_modules/react-resizable-panels/dist/react-resizable-panels.browser.${
            process.env.NODE_ENV === "production" ? "" : "development."
          }esm.js`,
        ),
      },
    ],
  },
});
