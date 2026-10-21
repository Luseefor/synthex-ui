import type { Plugin } from "vite";

// A dev-only SSR fixture; the production application has no testing route.
export function contractFixtureDev(): Plugin {
  return {
    name: "component-contract-fixture",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = request.url?.split("?")[0];
        if (url !== "/e2e/fixtures/contracts.html") return next();
        try {
          const module = await server.ssrLoadModule("/e2e/fixtures/contracts.server.tsx");
          const html = await server.transformIndexHtml(url, module.render());
          response.setHeader("Content-Type", "text/html");
          response.end(html);
        } catch (error) { next(error); }
      });
    },
  };
}
