import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/packages/ui/src/")) {
            return "synthex-ui";
          }
          if (id.includes("/packages/core/src/")) {
            return "synthex-core";
          }
          if (id.includes("/packages/react-web/src/")) {
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
    alias: {
      "@synthex/core": fileURLToPath(new URL("../core/src", import.meta.url)),
      "@synthex/react-web": fileURLToPath(new URL("../react-web/src", import.meta.url)),
      "synthex-ui": fileURLToPath(new URL("../ui/src", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
  },
});
