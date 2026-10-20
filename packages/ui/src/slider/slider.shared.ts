export type SliderOrientation = "horizontal" | "vertical";

/** Single-thumb only; range (multi-thumb) is a future enhancement. */
export interface SliderSharedProps {
  readonly defaultValue?: number[];
  readonly max?: number;
  readonly min?: number;
  readonly onValueChange?: (value: number[]) => void;
  readonly onValueCommit?: (value: number[]) => void;
  readonly step?: number;
  readonly value?: number[];
  readonly disabled?: boolean;
  readonly orientation?: SliderOrientation;
}
