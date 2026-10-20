export type SliderOrientation = "horizontal" | "vertical";

/** Multi-thumb range slider; each entry in `value` renders its own thumb. */
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
