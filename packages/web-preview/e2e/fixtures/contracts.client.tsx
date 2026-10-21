import { hydrateRoot } from "react-dom/client";
import { Contracts } from "./contracts";

hydrateRoot(document.getElementById("root")!, <Contracts />, {
  onRecoverableError: (error) => { console.error("Hydration failed", error); },
});
