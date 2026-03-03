import { serializeLayout, type LayoutAction, type LayoutNode } from "@luseefor/synthex-core";
import type { HistoryManager, LayoutEngineDispatchOptions, Middleware } from "../types";
import { logger } from "../utils/logger";

export function applyMiddleware(
  action: LayoutAction,
  middlewares: readonly Middleware[],
  dispatchToStore: (action: LayoutAction) => LayoutNode,
  getState: () => LayoutNode,
): LayoutNode {
  const invoke = (index: number, nextAction: LayoutAction): LayoutNode => {
    const middleware = middlewares[index];

    if (!middleware) {
      return dispatchToStore(nextAction);
    }

    const prevState = getState();

    return middleware(nextAction, prevState, (forwardAction) => invoke(index + 1, forwardAction));
  };

  return invoke(0, action);
}

interface BuiltInMiddlewareOptions {
  readonly historyManager: HistoryManager;
  readonly getDispatchOptions: () => LayoutEngineDispatchOptions;
}

export function createLoggerMiddleware(
  getDispatchOptions: () => LayoutEngineDispatchOptions,
): Middleware {
  return (action, prevState, next) => {
    const nextState = next(action);
    const commandName = getDispatchOptions().commandName ?? action.type;
    const changed = serializeLayout(prevState) !== serializeLayout(nextState);

    logger.info("Layout action dispatched.", {
      action: action.type,
      command: commandName,
      changed,
    });

    return nextState;
  };
}

export function createHistoryMiddleware(options: BuiltInMiddlewareOptions): Middleware {
  return (action, prevState, next) => {
    const nextState = next(action);
    options.historyManager.record(action, prevState, nextState, options.getDispatchOptions());
    return nextState;
  };
}
