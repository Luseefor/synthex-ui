import { describe, expect, it, vi } from "vitest";
import { createStore } from "./store";

type CounterAction = { type: "increment" } | { type: "add"; value: number };

function counterReducer(state: number, action: CounterAction): number {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "add":
      return state + action.value;
  }
}

describe("createStore", () => {
  it("returns the initial state", () => {
    const store = createStore<number, CounterAction>(0, counterReducer);
    expect(store.getState()).toBe(0);
  });

  it("updates state through the reducer", () => {
    const store = createStore<number, CounterAction>(0, counterReducer);
    expect(store.dispatch({ type: "increment" })).toBe(1);
    expect(store.dispatch({ type: "add", value: 4 })).toBe(5);
    expect(store.getState()).toBe(5);
  });

  it("notifies subscribers on dispatch", () => {
    const store = createStore<number, CounterAction>(0, counterReducer);
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch({ type: "increment" });
    store.dispatch({ type: "increment" });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("supports unsubscribing", () => {
    const store = createStore<number, CounterAction>(0, counterReducer);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.dispatch({ type: "increment" });
    expect(listener).not.toHaveBeenCalled();
  });
});
