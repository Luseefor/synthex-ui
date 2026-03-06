export interface UseControllableStateOptions<TValue> {
    readonly defaultValue: TValue;
    readonly onChange?: (value: TValue) => void;
    readonly value?: TValue;
}
export declare function useControllableState<TValue>({ defaultValue, onChange, value, }: UseControllableStateOptions<TValue>): readonly [TValue, (nextValue: TValue) => void];
//# sourceMappingURL=useControllableState.d.ts.map