import { useMemo, useSyncExternalStore } from "react";
import type { LayoutAction, LayoutEngine, LayoutNode } from "@luseefor/synthex-core";

export interface SynthexController {
  readonly getState: () => LayoutNode;
  readonly subscribe: (listener: () => void) => () => void;
  readonly dispatch?: (action: LayoutAction) => Promise<LayoutNode> | LayoutNode;
}

export function useSynthex(controller: LayoutEngine | SynthexController): LayoutNode {
  const externalStore = useMemo(
    () =>
      isLayoutEngine(controller)
        ? controller.store
        : {
            getState: controller.getState,
            subscribe: controller.subscribe,
          },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- controller identity is the store identity; store object is stable on engines
    [controller],
  );

  // Cache the server snapshot so getServerSnapshot returns a stable value
  // instead of re-reading live state (avoids React snapshot warnings).
  const serverSnapshot = useMemo(() => externalStore.getState(), [externalStore]);

  return useSyncExternalStore(
    externalStore.subscribe,
    externalStore.getState,
    () => serverSnapshot,
  );
}

function isLayoutEngine(controller: LayoutEngine | SynthexController): controller is LayoutEngine {
  return "store" in controller;
}
