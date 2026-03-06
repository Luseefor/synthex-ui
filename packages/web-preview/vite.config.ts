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
  const uiBase = useWorkspaceSourceAliases ? "../ui/src" : "../ui/dist";

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
      alias: [
        {
          find: "synthex-ui/styles.css",
          replacement: fileURLToPath(new URL("../ui/src/styles.css", import.meta.url)),
        },
        {
          find: /^synthex-ui$/,
          replacement: fileURLToPath(
            new URL(`${uiBase}/${useWorkspaceSourceAliases ? "index.web.ts" : "index.web.js"}`, import.meta.url),
          ),
        },
        {
          find: /^synthex-ui\/components$/,
          replacement: fileURLToPath(
            new URL(
              `${uiBase}/components/${useWorkspaceSourceAliases ? "index.web.ts" : "index.web.js"}`,
              import.meta.url,
            ),
          ),
        },
        {
          find: /^synthex-ui\/hooks$/,
          replacement: fileURLToPath(
            new URL(`${uiBase}/hooks/${useWorkspaceSourceAliases ? "index.web.ts" : "index.web.js"}`, import.meta.url),
          ),
        },
        {
          find: /^synthex-ui\/icons$/,
          replacement: fileURLToPath(
            new URL(`${uiBase}/icons/${useWorkspaceSourceAliases ? "index.web.ts" : "index.web.js"}`, import.meta.url),
          ),
        },
        {
          find: /^synthex-ui\/theme$/,
          replacement: fileURLToPath(
            new URL(`${uiBase}/theme/${useWorkspaceSourceAliases ? "index.web.ts" : "index.web.js"}`, import.meta.url),
          ),
        },
        {
          find: /^synthex-ui\/layout$/,
          replacement: fileURLToPath(
            new URL(`${uiBase}/layout/${useWorkspaceSourceAliases ? "index.web.ts" : "index.web.js"}`, import.meta.url),
          ),
        },
        {
          find: /^synthex-ui\/primitives$/,
          replacement: fileURLToPath(
            new URL(
              `${uiBase}/primitives/${useWorkspaceSourceAliases ? "index.web.tsx" : "index.web.js"}`,
              import.meta.url,
            ),
          ),
        },
      ],
    },
    server: {
      host: process.env.HOST ?? "0.0.0.0",
      port: resolvePort(process.env.PORT),
      strictPort: false,
    },
  };
});
