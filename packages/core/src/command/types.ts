export type MaybePromise<T> = T | Promise<T>;

export interface Command<TContext, TPayload = void, TResult = void> {
  id: string;
  execute: (context: TContext, payload: TPayload) => MaybePromise<TResult>;
  undo?: (context: TContext, payload: TPayload, result: TResult) => MaybePromise<void>;
}
