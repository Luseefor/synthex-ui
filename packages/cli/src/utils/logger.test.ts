import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";

afterEach(() => {
  vi.restoreAllMocks();
});

function mockStreams(): { stdout: string[]; stderr: string[] } {
  const stdout: string[] = [];
  const stderr: string[] = [];
  vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array): boolean => {
    stdout.push(String(chunk));
    return true;
  });
  vi.spyOn(process.stderr, "write").mockImplementation((chunk: string | Uint8Array): boolean => {
    stderr.push(String(chunk));
    return true;
  });
  return { stdout, stderr };
}

describe("logger", () => {
  it("writes info messages to stdout", () => {
    const streams = mockStreams();
    logger.info("hello");
    expect(streams.stdout).toEqual(["[INFO] hello\n"]);
    expect(streams.stderr).toEqual([]);
  });

  it("writes error messages to stderr", () => {
    const streams = mockStreams();
    logger.error("boom");
    expect(streams.stderr).toEqual(["[ERROR] boom\n"]);
    expect(streams.stdout).toEqual([]);
  });

  it("writes success messages to stdout", () => {
    const streams = mockStreams();
    logger.success("done");
    expect(streams.stdout).toEqual(["[SUCCESS] done\n"]);
  });

  it("renders string details as-is", () => {
    const streams = mockStreams();
    logger.info("hello", "extra");
    expect(streams.stdout).toEqual(["[INFO] hello\n", "extra\n"]);
  });

  it("renders object details as JSON", () => {
    const streams = mockStreams();
    logger.error("boom", { path: "layout.json" });
    expect(streams.stderr[0]).toBe("[ERROR] boom\n");
    expect(JSON.parse(streams.stderr[1] ?? "{}")).toEqual({ path: "layout.json" });
  });
});
