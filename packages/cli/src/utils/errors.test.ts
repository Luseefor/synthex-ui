import { describe, expect, it } from "vitest";
import { CliError, toCliError } from "./errors";

describe("CliError", () => {
  it("defaults to exit code 1", () => {
    const error = new CliError("boom");
    expect(error.message).toBe("boom");
    expect(error.name).toBe("CliError");
    expect(error.exitCode).toBe(1);
    expect(error.details).toBeUndefined();
  });

  it("stores custom exit codes and details", () => {
    const details = { path: "layout.json" };
    const error = new CliError("missing", 2, details);
    expect(error.exitCode).toBe(2);
    expect(error.details).toBe(details);
  });
});

describe("toCliError", () => {
  it("returns CliError instances unchanged", () => {
    const original = new CliError("original", 3, { reason: "test" });
    expect(toCliError(original)).toBe(original);
  });

  it("wraps generic errors", () => {
    const wrapped = toCliError(new Error("generic failure"));
    expect(wrapped).toBeInstanceOf(CliError);
    expect(wrapped.message).toBe("generic failure");
    expect(wrapped.exitCode).toBe(1);
  });

  it("wraps unknown values", () => {
    const fromString = toCliError("oops");
    expect(fromString).toBeInstanceOf(CliError);
    expect(fromString.message).toBe("Unknown CLI failure.");

    const fromUndefined = toCliError(undefined);
    expect(fromUndefined.message).toBe("Unknown CLI failure.");
  });
});
