import { useSyncExternalStore } from "react";
import type { LayoutAction, LayoutEngine, LayoutNode } from "@synthex/core";

export interface SynthexController {
  readonly getState: () => LayoutNode;
  readonly subscribe: (listener: () => void) => () => void;
  readonly dispatch?: (action: LayoutAction) => Promise<LayoutNode> | LayoutNode;
}

export function useSynthex(controller: LayoutEngine | SynthexController): LayoutNode {
  const externalStore = isLayoutEngine(controller)
    ? controller.store
    : {
        getState: controller.getState,
        subscribe: controller.subscribe,
      };

  return useSyncExternalStore(
    externalStore.subscribe,
    externalStore.getState,
    externalStore.getState,
  );
}

function isLayoutEngine(controller: LayoutEngine | SynthexController): controller is LayoutEngine {
  return "store" in controller;
}
