export interface OTPEditResult {
  readonly focusIndex: number | null;
  readonly value: string;
}

function assertLength(length: number): void {
  if (!Number.isInteger(length) || length <= 0) {
    throw new RangeError("OTP length must be a positive integer.");
  }
}

function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function canonicalChars(value: string, length: number): string[] {
  return Array.from(value).slice(0, length);
}

export function editOTPValue(value: string, length: number, index: number, text: string): OTPEditResult {
  assertLength(length);
  const current = canonicalChars(value, length);
  const canonical = current.join("");
  if (!isValidIndex(index, length)) {
    return { value: canonical, focusIndex: null };
  }
  if (text === "") {
    return deleteOTPValue(value, length, index);
  }
  const incoming = Array.from(text);
  if (incoming.length >= length) {
    return { value: incoming.slice(0, length).join(""), focusIndex: length - 1 };
  }
  const start = Math.min(index, current.length);
  const head = current.slice(0, start);
  const tail = current.slice(start + incoming.length);
  const next = head.concat(incoming, tail).slice(0, length).join("");
  return { value: next, focusIndex: Math.min(start + incoming.length, length - 1) };
}

export function deleteOTPValue(value: string, length: number, index: number): OTPEditResult {
  assertLength(length);
  const current = canonicalChars(value, length);
  const canonical = current.join("");
  if (!isValidIndex(index, length)) {
    return { value: canonical, focusIndex: null };
  }
  if (current.length === 0) {
    return { value: canonical, focusIndex: Math.max(index - 1, 0) };
  }
  if (index < current.length) {
    const next = current.slice(0, index).concat(current.slice(index + 1)).join("");
    return { value: next, focusIndex: Math.max(index - 1, 0) };
  }
  const last = current.length - 1;
  return { value: current.slice(0, last).join(""), focusIndex: last };
}
