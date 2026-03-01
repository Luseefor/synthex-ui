export type Reducer<TState, TAction> = (state: TState, action: TAction) => TState;

export interface Store<TState, TAction> {
  getState: () => TState;
  dispatch: (action: TAction) => TState;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<TState, TAction>(
  initialState: TState,
  reducer: Reducer<TState, TAction>,
): Store<TState, TAction> {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,

    dispatch: (action) => {
      state = reducer(state, action);

      for (const listener of listeners) {
        listener();
      }

      return state;
    },

    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
