import { describe, expect, it } from "vitest";
import { mergeComponentFile, unifiedComponentDiff } from "./componentMerge";

function text(value: string): Buffer {
  return Buffer.from(value, "utf8");
}

function expectBytes(actual: Buffer | null, expected: string): void {
  expect(actual).not.toBeNull();
  expect(actual?.toString("utf8")).toBe(expected);
}

describe("mergeComponentFile", () => {
  it("reports unchanged when all three sides are identical", () => {
    const base = text("a\nb\n");
    const result = mergeComponentFile(base, text("a\nb\n"), text("a\nb\n"));
    expect(result.status).toBe("unchanged");
    expectBytes(result.content, "a\nb\n");
  });

  it("reports unchanged when local and incoming agree (same edits both sides)", () => {
    const result = mergeComponentFile(
      text("a\nb\n"),
      text("a\nB\n"),
      text("a\nB\n"),
    );
    expect(result.status).toBe("unchanged");
    expectBytes(result.content, "a\nB\n");
  });

  it("takes a clean upstream update when local matches base", () => {
    const result = mergeComponentFile(
      text("a\nb\n"),
      text("a\nb\n"),
      text("a\nb\nc\n"),
    );
    expect(result.status).toBe("updated");
    expectBytes(result.content, "a\nb\nc\n");
  });

  it("reports deleted when upstream removed the file and local is untouched", () => {
    const result = mergeComponentFile(text("a\n"), text("a\n"), null);
    expect(result.status).toBe("deleted");
    expect(result.content).toBeNull();
  });

  it("reports created for a new upstream file", () => {
    const result = mergeComponentFile(null, null, text("new\n"));
    expect(result.status).toBe("created");
    expectBytes(result.content, "new\n");
  });

  it("preserves local changes when upstream matches base", () => {
    const result = mergeComponentFile(
      text("a\nb\n"),
      text("a\nlocal\n"),
      text("a\nb\n"),
    );
    expect(result.status).toBe("local-only");
    expectBytes(result.content, "a\nlocal\n");
  });

  it("preserves a local deletion when upstream matches base", () => {
    const result = mergeComponentFile(text("a\n"), null, text("a\n"));
    expect(result.status).toBe("local-only");
    expect(result.content).toBeNull();
  });

  it("preserves a local addition when upstream has nothing", () => {
    const result = mergeComponentFile(null, text("mine\n"), null);
    expect(result.status).toBe("local-only");
    expectBytes(result.content, "mine\n");
  });

  it("merges non-overlapping edits from both sides", () => {
    const result = mergeComponentFile(
      text("one\ntwo\nthree\nfour\n"),
      text("ONE\ntwo\nthree\nfour\n"),
      text("one\ntwo\nthree\nFOUR\n"),
    );
    expect(result.status).toBe("merged");
    expectBytes(result.content, "ONE\ntwo\nthree\nFOUR\n");
  });

  it("merges an addition on one side with an edit on the other", () => {
    const result = mergeComponentFile(
      text("a\nb\n"),
      text("a\nb\nc\n"),
      text("A\nb\n"),
    );
    expect(result.status).toBe("merged");
    expectBytes(result.content, "A\nb\nc\n");
  });

  it("conflicts on overlapping edits without embedding markers", () => {
    const local = text("a\nlocal\n");
    const result = mergeComponentFile(text("a\nb\n"), local, text("a\nremote\n"));
    expect(result.status).toBe("conflict");
    expect(result.content).not.toBeNull();
    expect(result.content?.equals(local)).toBe(true);
    const content = result.content?.toString("utf8") ?? "";
    expect(content).not.toContain("<<<<<<<");
    expect(content).not.toContain(">>>>>>>");
    expect(content).not.toContain("|||||||");
    expect(result.reason).toBeTruthy();
  });

  it("conflicts when local deleted the file but upstream modified it", () => {
    const result = mergeComponentFile(text("a\nb\n"), null, text("a\nB\n"));
    expect(result.status).toBe("conflict");
    expect(result.content).toBeNull();
  });

  it("conflicts when upstream deleted the file but local modified it", () => {
    const local = text("a\nlocal\n");
    const result = mergeComponentFile(text("a\nb\n"), local, null);
    expect(result.status).toBe("conflict");
    expect(result.content?.equals(local)).toBe(true);
  });

  it("conflicts on two differing independent additions with no base", () => {
    const local = text("local\n");
    const result = mergeComponentFile(null, local, text("remote\n"));
    expect(result.status).toBe("conflict");
    expect(result.content?.equals(local)).toBe(true);
  });

  it("conflicts on binary content changed on both sides", () => {
    const local = Buffer.from([0x00, 0x01, 0x02, 0x41]);
    const result = mergeComponentFile(
      Buffer.from([0x00, 0x01, 0x02, 0x40]),
      local,
      Buffer.from([0x00, 0x01, 0x02, 0x42]),
    );
    expect(result.status).toBe("conflict");
    expect(result.content?.equals(local)).toBe(true);
    expect(result.reason).toMatch(/binary/i);
  });

  it("still fast-paths binary content when one side matches base", () => {
    const base = Buffer.from([0x00, 0x01, 0x02]);
    const incoming = Buffer.from([0x00, 0x01, 0x03]);
    const result = mergeComponentFile(base, base, incoming);
    expect(result.status).toBe("updated");
    expect(result.content?.equals(incoming)).toBe(true);
  });

  it("conflicts when both changed sides are not valid UTF-8", () => {
    const local = Buffer.from([0xff, 0xfe, 0x41]);
    const result = mergeComponentFile(
      text("base\n"),
      local,
      text("other\n"),
    );
    expect(result.status).toBe("conflict");
    expect(result.content?.equals(local)).toBe(true);
  });

  it("preserves CRLF endings exactly through a merge", () => {
    const result = mergeComponentFile(
      text("one\r\ntwo\r\nthree\r\n"),
      text("ONE\r\ntwo\r\nthree\r\n"),
      text("one\r\ntwo\r\nTHREE\r\n"),
    );
    expect(result.status).toBe("merged");
    expect(result.content?.equals(text("ONE\r\ntwo\r\nTHREE\r\n"))).toBe(true);
  });

  it("preserves a missing final newline through a merge", () => {
    const result = mergeComponentFile(
      text("one\ntwo\nthree"),
      text("ONE\ntwo\nthree"),
      text("one\ntwo\nTHREE"),
    );
    expect(result.status).toBe("merged");
    expect(result.content?.equals(text("ONE\ntwo\nTHREE"))).toBe(true);
  });

  it("treats a boundary-touching append as a conflict", () => {
    const local = text("one\nTWO");
    const result = mergeComponentFile(text("one\ntwo"), local, text("one\ntwo\nthree"));
    expect(result.status).toBe("conflict");
    expect(result.content?.equals(local)).toBe(true);
  });

  it("keeps unicode and BOM byte-exact through a merge", () => {
    const bom = "\uFEFF";
    const result = mergeComponentFile(
      text(`${bom}héllo 🌍\nplain\n`),
      text(`${bom}héllo 🌎\nplain\n`),
      text(`${bom}héllo 🌍\nplain\nREMOTE\n`),
    );
    expect(result.status).toBe("merged");
    expect(result.content?.equals(text(`${bom}héllo 🌎\nplain\nREMOTE\n`))).toBe(true);
  });

  it("conflicts with a clear reason instead of merging pathological huge files", () => {
    const line = "x".repeat(100);
    const base = text(`${line}\n`);
    const local = Buffer.concat([base, Buffer.alloc(600 * 1024, 0x61)]);
    const incoming = Buffer.concat([base, Buffer.alloc(600 * 1024, 0x62)]);
    const result = mergeComponentFile(base, local, incoming);
    expect(result.status).toBe("conflict");
    expect(result.content?.equals(local)).toBe(true);
    expect(result.reason).toMatch(/too large/i);
  });
});

describe("unifiedComponentDiff", () => {
  it("returns empty string when both sides are identical", () => {
    expect(unifiedComponentDiff("a.tsx", text("x\n"), text("x\n"))).toBe("");
    expect(unifiedComponentDiff("a.tsx", null, null)).toBe("");
  });

  it("renders a unified patch for text changes", () => {
    const patch = unifiedComponentDiff("button.tsx", text("a\nb\n"), text("a\nB\n"));
    expect(patch).toContain("---");
    expect(patch).toContain("+++");
    expect(patch).toContain("-b");
    expect(patch).toContain("+B");
  });

  it("marks added and removed files with /dev/null", () => {
    expect(unifiedComponentDiff("new.tsx", null, text("hi\n"))).toContain("/dev/null");
    expect(unifiedComponentDiff("old.tsx", text("hi\n"), null)).toContain("/dev/null");
  });

  it("summarizes binary content honestly", () => {
    const binary = Buffer.from([0x00, 0x01, 0x02]);
    const other = Buffer.from([0x00, 0x01, 0x03]);
    expect(unifiedComponentDiff("logo.png", binary, other)).toMatch(/binary/i);
    expect(unifiedComponentDiff("logo.png", null, other)).toMatch(/binary/i);
  });

  it("omits oversized diffs with an explanatory message instead of empty output", () => {
    const local = Buffer.alloc(700 * 1024, 0x61);
    const incoming = Buffer.alloc(700 * 1024, 0x62);
    const patch = unifiedComponentDiff("big.tsx", local, incoming);
    expect(patch.length).toBeGreaterThan(0);
    expect(patch).toMatch(/too large/i);
  });
});
