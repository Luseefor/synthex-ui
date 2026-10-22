import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useInputOTPController } from "./input-otp.shared";

describe("useInputOTPController", () => {
  it("defaults length to 6", () => {
    const { result } = renderHook(() => useInputOTPController({}));
    expect(result.current.length).toBe(6);
    expect(result.current.value).toBe("");
  });

  it("throws RangeError for invalid length", () => {
    expect(() => renderHook(() => useInputOTPController({ length: 0 }))).toThrow(RangeError);
    expect(() => renderHook(() => useInputOTPController({ length: -2 }))).toThrow(RangeError);
    expect(() => renderHook(() => useInputOTPController({ length: 1.5 }))).toThrow(RangeError);
  });

  it("updates uncontrolled value and notifies", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useInputOTPController({ defaultValue: "", onValueChange }));
    let next: ReturnType<typeof result.current.setValueAt> | undefined;
    act(() => {
      next = result.current.setValueAt(0, "A");
    });
    expect(next).toEqual({ value: "A", focusIndex: 1 });
    expect(onValueChange).toHaveBeenCalledWith("A");
    expect(result.current.value).toBe("A");
  });

  it("notifies without mutating controlled value", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(
      (props: { value: string }) => useInputOTPController({ value: props.value, length: 4, onValueChange }),
      { initialProps: { value: "12" } },
    );
    let next: ReturnType<typeof result.current.setValueAt> | undefined;
    act(() => {
      next = result.current.setValueAt(0, "X");
    });
    expect(next).toEqual({ value: "X2", focusIndex: 1 });
    expect(onValueChange).toHaveBeenCalledWith("X2");
    expect(result.current.value).toBe("12");
  });

  it("does not notify when the value is unchanged", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useInputOTPController({ defaultValue: "12", onValueChange }));
    onValueChange.mockClear();
    let next: ReturnType<typeof result.current.setValueAt> | undefined;
    act(() => {
      next = result.current.setValueAt(0, "1");
    });
    expect(next).toEqual({ value: "12", focusIndex: 1 });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(result.current.value).toBe("12");
  });

  it("does not notify for invalid slot index", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useInputOTPController({ defaultValue: "12", length: 4, onValueChange }));
    onValueChange.mockClear();
    let next: ReturnType<typeof result.current.setValueAt> | undefined;
    act(() => {
      next = result.current.setValueAt(9, "X");
    });
    expect(next).toEqual({ value: "12", focusIndex: null });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("deletes through the controller and returns focus", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useInputOTPController({ defaultValue: "123", onValueChange }));
    let next: ReturnType<typeof result.current.deleteValueAt> | undefined;
    act(() => {
      next = result.current.deleteValueAt(1);
    });
    expect(next).toEqual({ value: "13", focusIndex: 0 });
    expect(onValueChange).toHaveBeenCalledWith("13");
    expect(result.current.value).toBe("13");
  });

  it("does not notify when delete leaves value unchanged", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useInputOTPController({ defaultValue: "", onValueChange }));
    onValueChange.mockClear();
    let next: ReturnType<typeof result.current.deleteValueAt> | undefined;
    act(() => {
      next = result.current.deleteValueAt(2);
    });
    expect(next).toEqual({ value: "", focusIndex: 1 });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders canonical value for overlong controlled value without notification", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(
      (props: { length: number; value: string }) =>
        useInputOTPController({ value: props.value, length: props.length, onValueChange }),
      { initialProps: { length: 4, value: "ABCDEFGH" } },
    );
    expect(result.current.value).toBe("ABCD");
    expect(onValueChange).not.toHaveBeenCalled();
    let next: ReturnType<typeof result.current.setValueAt> | undefined;
    act(() => {
      next = result.current.setValueAt(0, "X");
    });
    expect(next).toEqual({ value: "XBCD", focusIndex: 1 });
    expect(onValueChange).toHaveBeenCalledWith("XBCD");
    expect(result.current.value).toBe("ABCD");
  });

  it("renders canonical value for overlong default value without notification", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useInputOTPController({ defaultValue: "ABCDEFGH", length: 4, onValueChange }),
    );
    expect(result.current.value).toBe("ABCD");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("does not normalize or notify overlong value on invalid index", () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() =>
      useInputOTPController({ defaultValue: "ABCDEFGH", length: 4, onValueChange }),
    );
    onValueChange.mockClear();
    let edited: ReturnType<typeof result.current.setValueAt> | undefined;
    act(() => {
      edited = result.current.setValueAt(9, "X");
    });
    expect(edited).toEqual({ value: "ABCD", focusIndex: null });
    let deleted: ReturnType<typeof result.current.deleteValueAt> | undefined;
    act(() => {
      deleted = result.current.deleteValueAt(9);
    });
    expect(deleted).toEqual({ value: "ABCD", focusIndex: null });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(result.current.value).toBe("ABCD");
  });

  it("renders canonical value when length shrinks without notification", () => {
    const onValueChange = vi.fn();
    const { result, rerender } = renderHook(
      (props: { length: number }) =>
        useInputOTPController({ defaultValue: "123456", length: props.length, onValueChange }),
      { initialProps: { length: 6 } },
    );
    expect(result.current.value).toBe("123456");
    rerender({ length: 4 });
    expect(result.current.value).toBe("1234");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders canonical value when controlled length shrinks without notification", () => {
    const onValueChange = vi.fn();
    const { result, rerender } = renderHook(
      (props: { length: number; value: string }) =>
        useInputOTPController({ value: props.value, length: props.length, onValueChange }),
      { initialProps: { length: 6, value: "123456" } },
    );
    expect(result.current.value).toBe("123456");
    rerender({ length: 4, value: "123456" });
    expect(result.current.value).toBe("1234");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
