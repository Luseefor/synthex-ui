import { describe, expect, it } from "vitest";
import { createCommandRegistry } from "./registry";

interface CounterContext {
  count: number;
}

function createCounterContext(): CounterContext & { getContext: () => CounterContext } {
  const state: CounterContext = { count: 0 };
  return {
    ...state,
    getContext: () => state,
  };
}

describe("createCommandRegistry", () => {
  it("dispatches registered commands", async () => {
    const holder = createCounterContext();
    const registry = createCommandRegistry<CounterContext>(holder.getContext);
    registry.register<number, number>({
      id: "add",
      execute: (context, payload) => {
        context.count += payload;
        return context.count;
      },
    });

    await expect(registry.dispatch<number, number>("add", 3)).resolves.toBe(3);
    expect(holder.getContext().count).toBe(3);
  });

  it("throws for unknown commands", async () => {
    const holder = createCounterContext();
    const registry = createCommandRegistry<CounterContext>(holder.getContext);
    await expect(registry.dispatch("missing", undefined)).rejects.toThrow("Unknown command");
  });

  it("tracks undo and redo", async () => {
    const holder = createCounterContext();
    const registry = createCommandRegistry<CounterContext>(holder.getContext);
    registry.register<number, number>({
      id: "add",
      execute: (context, payload) => {
        const previous = context.count;
        context.count += payload;
        return previous;
      },
      undo: (context, _payload, previous) => {
        context.count = previous;
      },
    });

    await registry.dispatch("add", 5);
    expect(holder.getContext().count).toBe(5);
    expect(registry.getHistoryState().undoDepth).toBe(1);

    expect(await registry.undo()).toBe(true);
    expect(holder.getContext().count).toBe(0);
    expect(registry.getHistoryState().redoDepth).toBe(1);

    expect(await registry.redo()).toBe(true);
    expect(holder.getContext().count).toBe(5);
  });

  it("returns false when history is empty", async () => {
    const holder = createCounterContext();
    const registry = createCommandRegistry<CounterContext>(holder.getContext);
    expect(await registry.undo()).toBe(false);
    expect(await registry.redo()).toBe(false);
  });

  it("does not record commands without undo", async () => {
    const holder = createCounterContext();
    const registry = createCommandRegistry<CounterContext>(holder.getContext);
    registry.register({
      id: "noop",
      execute: () => undefined,
    });
    await registry.dispatch("noop", undefined);
    expect(registry.getHistoryState().undoDepth).toBe(0);
    expect(await registry.undo()).toBe(false);
  });

  it("merges history entries when mergeHistory returns a value", async () => {
    const holder = createCounterContext();
    const registry = createCommandRegistry<CounterContext>(holder.getContext);
    registry.register<number, number>({
      id: "set",
      execute: (context, payload) => {
        const previous = context.count;
        context.count = payload;
        return previous;
      },
      mergeHistory: (previous, next) => ({
        payload: next.payload,
        result: previous.result,
      }),
      undo: (context, _payload, previous) => {
        context.count = previous;
      },
    });

    await registry.dispatch("set", 1);
    await registry.dispatch("set", 2);

    expect(holder.getContext().count).toBe(2);
    expect(registry.getHistoryState().undoDepth).toBe(1);

    expect(await registry.undo()).toBe(true);
    expect(holder.getContext().count).toBe(0);
  });

  it("clears redo history on new dispatch", async () => {
    const holder = createCounterContext();
    const registry = createCommandRegistry<CounterContext>(holder.getContext);
    registry.register<number, number>({
      id: "set",
      execute: (context, payload) => {
        const previous = context.count;
        context.count = payload;
        return previous;
      },
      undo: (context, _payload, previous) => {
        context.count = previous;
      },
    });

    await registry.dispatch("set", 1);
    await registry.undo();
    expect(registry.getHistoryState().redoDepth).toBe(1);

    await registry.dispatch("set", 2);
    expect(registry.getHistoryState().redoDepth).toBe(0);
    expect(await registry.redo()).toBe(false);
  });
});
