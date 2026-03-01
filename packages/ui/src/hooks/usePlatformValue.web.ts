export function usePlatformValue<TValue>(values: {
  readonly native: TValue;
  readonly web: TValue;
}) {
  return values.web;
}
