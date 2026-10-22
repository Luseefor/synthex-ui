import { describe, expect, it } from "vitest";
import { deleteOTPValue, editOTPValue } from "./input-otp.edit";

describe("editOTPValue length validation", () => {
  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])("throws RangeError for length %p", (length) => {
    expect(() => editOTPValue("", length, 0, "A")).toThrow(RangeError);
    expect(() => deleteOTPValue("", length, 0)).toThrow(RangeError);
  });
});

describe("editOTPValue invalid slot index", () => {
  it("returns capped canonical value with null focus", () => {
    expect(editOTPValue("12", 4, -1, "X")).toEqual({ value: "12", focusIndex: null });
    expect(editOTPValue("12", 4, 4, "X")).toEqual({ value: "12", focusIndex: null });
    expect(editOTPValue("12", 4, 99, "X")).toEqual({ value: "12", focusIndex: null });
    expect(editOTPValue("12", 4, 1.5, "X")).toEqual({ value: "12", focusIndex: null });
    expect(editOTPValue("ABCDEFGH", 4, 9, "X")).toEqual({ value: "ABCD", focusIndex: null });
    expect(deleteOTPValue("12", 4, -1)).toEqual({ value: "12", focusIndex: null });
    expect(deleteOTPValue("12", 4, 4)).toEqual({ value: "12", focusIndex: null });
  });
});

describe("editOTPValue canonical capping", () => {
  it("caps overlong values", () => {
    expect(editOTPValue("ABCDEFGH", 4, 9, "X")).toEqual({ value: "ABCD", focusIndex: null });
    expect(deleteOTPValue("ABCDEFGH", 4, 9)).toEqual({ value: "ABCD", focusIndex: null });
    expect(editOTPValue("ABCDEFGH", 6, 0, "X")).toEqual({ value: "XBCDEF", focusIndex: 1 });
  });
});

describe("editOTPValue empty and later-slot inserts", () => {
  it("writes into empty value without holes", () => {
    expect(editOTPValue("", 4, 0, "X")).toEqual({ value: "X", focusIndex: 1 });
  });

  it("clamps later-slot inserts to current length", () => {
    expect(editOTPValue("", 4, 2, "X")).toEqual({ value: "X", focusIndex: 1 });
    expect(editOTPValue("12", 6, 4, "X")).toEqual({ value: "12X", focusIndex: 3 });
    expect(editOTPValue("12", 6, 5, "AB")).toEqual({ value: "12AB", focusIndex: 4 });
  });
});

describe("editOTPValue partial and full pastes", () => {
  it("overwrites a single slot and preserves the suffix", () => {
    expect(editOTPValue("abcdef", 6, 1, "X")).toEqual({ value: "aXcdef", focusIndex: 2 });
  });

  it("writes partial text from the start", () => {
    expect(editOTPValue("", 6, 0, "AB")).toEqual({ value: "AB", focusIndex: 2 });
  });

  it("writes partial text from the middle", () => {
    expect(editOTPValue("123456", 6, 2, "AB")).toEqual({ value: "12AB56", focusIndex: 4 });
  });

  it("replaces the full code when pasted text fills length", () => {
    expect(editOTPValue("123", 6, 2, "ABCDEF")).toEqual({ value: "ABCDEF", focusIndex: 5 });
    expect(editOTPValue("", 6, 0, "ABCDEFGH")).toEqual({ value: "ABCDEF", focusIndex: 5 });
    expect(editOTPValue("12", 6, 4, "WXYZ12")).toEqual({ value: "WXYZ12", focusIndex: 5 });
  });

  it("clamps overwrites that would exceed length", () => {
    expect(editOTPValue("12345", 6, 4, "XYZ")).toEqual({ value: "1234XY", focusIndex: 5 });
    expect(editOTPValue("123456", 6, 5, "AB")).toEqual({ value: "12345A", focusIndex: 5 });
  });

  it("routes empty text through delete", () => {
    expect(editOTPValue("123", 6, 1, "")).toEqual(deleteOTPValue("123", 6, 1));
    expect(editOTPValue("123", 6, 1, "")).toEqual({ value: "13", focusIndex: 0 });
    expect(editOTPValue("", 6, 2, "")).toEqual({ value: "", focusIndex: 1 });
  });
});

describe("deleteOTPValue positions", () => {
  it("removes the occupied slot and shifts the suffix left", () => {
    expect(deleteOTPValue("123", 6, 1)).toEqual({ value: "13", focusIndex: 0 });
    expect(deleteOTPValue("123", 6, 0)).toEqual({ value: "23", focusIndex: 0 });
    expect(deleteOTPValue("123", 6, 2)).toEqual({ value: "12", focusIndex: 1 });
  });

  it("deletes the last filled slot when the index is empty", () => {
    expect(deleteOTPValue("12", 6, 4)).toEqual({ value: "1", focusIndex: 1 });
    expect(deleteOTPValue("12", 6, 2)).toEqual({ value: "1", focusIndex: 1 });
  });

  it("keeps empty value and focuses the previous valid index", () => {
    expect(deleteOTPValue("", 6, 2)).toEqual({ value: "", focusIndex: 1 });
    expect(deleteOTPValue("", 6, 0)).toEqual({ value: "", focusIndex: 0 });
  });
});

describe("unicode codepoints", () => {
  it("inserts and deletes emoji as single codepoints", () => {
    expect(editOTPValue("", 4, 0, "💙")).toEqual({ value: "💙", focusIndex: 1 });
    expect(editOTPValue("a💙", 4, 2, "X")).toEqual({ value: "a💙X", focusIndex: 3 });
    expect(editOTPValue("a💙c", 4, 1, "X")).toEqual({ value: "aXc", focusIndex: 2 });
    expect(deleteOTPValue("a💙c", 4, 1)).toEqual({ value: "ac", focusIndex: 0 });
    expect(deleteOTPValue("a💙", 4, 2)).toEqual({ value: "a", focusIndex: 1 });
  });

  it("counts a full paste by codepoints", () => {
    expect(editOTPValue("", 3, 0, "a💙c")).toEqual({ value: "a💙c", focusIndex: 2 });
    expect(editOTPValue("", 2, 0, "a💙c")).toEqual({ value: "a💙", focusIndex: 1 });
  });
});
