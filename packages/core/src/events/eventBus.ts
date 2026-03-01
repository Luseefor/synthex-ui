export type EventMap = object;

export interface EventBus<TEvents extends EventMap> {
  publish: <TEventName extends keyof TEvents>(eventName: TEventName, payload: TEvents[TEventName]) => void;
  subscribe: <TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: (payload: TEvents[TEventName]) => void,
  ) => () => void;
}

export function createEventBus<TEvents extends EventMap>(): EventBus<TEvents> {
  const listeners = new Map<keyof TEvents, Set<(payload: TEvents[keyof TEvents]) => void>>();

  return {
    publish(eventName, payload) {
      const handlers = listeners.get(eventName);

      if (!handlers) {
        return;
      }

      for (const handler of handlers) {
        handler(payload);
      }
    },

    subscribe(eventName, listener) {
      const handlers =
        listeners.get(eventName) ??
        new Set<(payload: TEvents[keyof TEvents]) => void>();

      handlers.add(listener as (payload: TEvents[keyof TEvents]) => void);
      listeners.set(eventName, handlers);

      return () => {
        handlers.delete(listener as (payload: TEvents[keyof TEvents]) => void);

        if (handlers.size === 0) {
          listeners.delete(eventName);
        }
      };
    },
  };
}
