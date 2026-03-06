import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

function resolvePort(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export default defineConfig(({ command }) => {
  const useWorkspaceSourceAliases = command === "serve";

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("/packages/ui/src/") || id.includes("/packages/ui/dist/")) {
              return "synthex-ui";
            }
            if (id.includes("/packages/core/src/") || id.includes("/packages/core/dist/")) {
              return "synthex-core";
            }
            if (id.includes("/packages/react-web/src/") || id.includes("/packages/react-web/dist/")) {
              return "synthex-react-web";
            }
            if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("/react/")) {
              return "react-vendor";
            }
            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: useWorkspaceSourceAliases
        ? {
            "@luseefor/synthex-core": fileURLToPath(new URL("../core/src", import.meta.url)),
            "@luseefor/synthex-react-web": fileURLToPath(new URL("../react-web/src", import.meta.url)),
            "synthex-ui": fileURLToPath(new URL("../ui/src", import.meta.url)),
          }
        : undefined,
    },
    server: {
      host: process.env.HOST ?? "0.0.0.0",
      port: resolvePort(process.env.PORT),
      strictPort: false,
    },
  };
});
