import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { Contracts } from "./contracts";

export function render() {
  if (typeof window !== "undefined") throw new Error("Contract fixture must render in Node.");
  const template = readFileSync(new URL("./contracts.html", import.meta.url), "utf8");
  return template.replace("<!--ssr-->", renderToString(<Contracts />));
}
