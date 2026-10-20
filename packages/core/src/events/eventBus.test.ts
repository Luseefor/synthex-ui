import { describe, expect, it, vi } from "vitest";
import { createEventBus } from "./eventBus";

interface TestEvents {
  changed: string;
  counted: number;
}

describe("createEventBus", () => {
  it("delivers published payloads to subscribers", () => {
    const bus = createEventBus<TestEvents>();
    const listener = vi.fn();
    bus.subscribe("changed", listener);
    bus.publish("changed", "hello");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("hello");
  });

  it("supports multiple subscribers", () => {
    const bus = createEventBus<TestEvents>();
    const first = vi.fn();
    const second = vi.fn();
    bus.subscribe("changed", first);
    bus.subscribe("changed", second);
    bus.publish("changed", "hi");
    expect(first).toHaveBeenCalledWith("hi");
    expect(second).toHaveBeenCalledWith("hi");
  });

  it("stops delivering after unsubscribe", () => {
    const bus = createEventBus<TestEvents>();
    const listener = vi.fn();
    const unsubscribe = bus.subscribe("changed", listener);
    unsubscribe();
    bus.publish("changed", "hello");
    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps other listeners when one unsubscribes", () => {
    const bus = createEventBus<TestEvents>();
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = bus.subscribe("changed", first);
    bus.subscribe("changed", second);
    unsubscribeFirst();
    bus.publish("changed", "hello");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith("hello");
  });

  it("isolates event names", () => {
    const bus = createEventBus<TestEvents>();
    const listener = vi.fn();
    bus.subscribe("changed", listener);
    bus.publish("counted", 1);
    expect(listener).not.toHaveBeenCalled();
  });

  it("does not throw when publishing without subscribers", () => {
    const bus = createEventBus<TestEvents>();
    expect(() => bus.publish("changed", "hello")).not.toThrow();
  });
});
