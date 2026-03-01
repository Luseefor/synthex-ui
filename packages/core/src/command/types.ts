export type MaybePromise<T> = T | Promise<T>;

export interface Command<TContext, TPayload = void, TResult = void> {
  id: string;
  execute: (context: TContext, payload: TPayload) => MaybePromise<TResult>;
  mergeHistory?: (
    previous: {
      readonly payload: TPayload;
      readonly result: TResult;
    },
    next: {
      readonly payload: TPayload;
      readonly result: TResult;
    },
  ) => {
    readonly payload: TPayload;
    readonly result: TResult;
  } | null;
  undo?: (context: TContext, payload: TPayload, result: TResult) => MaybePromise<void>;
}
