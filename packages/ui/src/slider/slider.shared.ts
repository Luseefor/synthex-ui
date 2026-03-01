export interface SliderSharedProps {
  readonly defaultValue?: number[];
  readonly max?: number;
  readonly min?: number;
  readonly onValueChange?: (value: number[]) => void;
  readonly step?: number;
  readonly value?: number[];
}
