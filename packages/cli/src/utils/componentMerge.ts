import { TextDecoder } from "node:util";
import { createTwoFilesPatch } from "diff";
import { diff3Merge } from "node-diff3";

export type ComponentMergeStatus =
  | "unchanged"
  | "updated"
  | "merged"
  | "local-only"
  | "created"
  | "deleted"
  | "conflict";

export interface ComponentMergeResult {
  status: ComponentMergeStatus;
  content: Buffer | null;
  reason?: string;
}

/** Above this byte size a file is never fed into the O(n*m) three-way merge. */
const MAX_MERGE_BYTES = 512 * 1024;
/** Above this line count a file is never fed into the three-way merge. */
const MAX_MERGE_LINES = 20000;
/** Above this combined byte size unifiedComponentDiff returns a summary instead of diffing. */
const DIFF_MAX_BYTES = 1024 * 1024;
const DIFF_CONTEXT_LINES = 3;
const DIFF_TIMEOUT_MS = 2000;
const DIFF_MAX_EDIT_LENGTH = 200000;

function buffersEqual(a: Buffer | null, b: Buffer | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  return a.equals(b);
}

function isBinaryLike(buf: Buffer): boolean {
  return buf.indexOf(0) !== -1;
}

function decodeStrict(buf: Buffer): string {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return BOM_CHAR + decoder.decode(buf.subarray(3));
  }
  return decoder.decode(buf);
}

/** BOM prefix preserved through strict decoding (see decodeStrict). */
const BOM_CHAR = "\uFEFF";

/**
 * Split text into lines keeping every line ending attached to its line, so
 * CRLF, lone CR, a missing trailing newline, BOM and unicode survive a
 * split followed by join("") byte-exactly.
 */
function splitLinesRetaining(text: string): string[] {
  if (text === "") {
    return [];
  }
  const parts = text.split(/(\r\n|\n|\r)/);
  const lines: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const content = parts[i] ?? "";
    const separator = parts[i + 1] ?? "";
    if (content === "" && separator === "") {
      continue;
    }
    lines.push(content + separator);
  }
  return lines;
}

function conflict(content: Buffer | null, reason: string): ComponentMergeResult {
  return { status: "conflict", content, reason };
}

/**
 * Pure three-way merge of a component file. `null` means missing/deleted.
 * Never performs I/O; never embeds conflict markers in `content` (on
 * conflict the local content is returned unchanged).
 */
export function mergeComponentFile(
  base: Buffer | null,
  local: Buffer | null,
  incoming: Buffer | null,
): ComponentMergeResult {
  if (buffersEqual(local, incoming)) {
    return { status: "unchanged", content: local };
  }

  if (buffersEqual(local, base)) {
    if (incoming === null) {
      return {
        status: "deleted",
        content: null,
        reason: "Local file matches base and upstream removed the file.",
      };
    }
    if (base === null) {
      return { status: "created", content: incoming, reason: "File is new upstream." };
    }
    return {
      status: "updated",
      content: incoming,
      reason: "Local file matches base; taking the upstream update.",
    };
  }

  if (buffersEqual(incoming, base)) {
    return {
      status: "local-only",
      content: local,
      reason: "Upstream matches base; keeping the local version.",
    };
  }

  if (local === null || incoming === null) {
    return conflict(
      local,
      local === null
        ? "Local file was deleted while upstream modified it; manual resolution required."
        : "Upstream removed the file while local modifications exist; manual resolution required.",
    );
  }

  if (base === null) {
    return conflict(
      local,
      "File was added independently locally and upstream with different content; manual resolution required.",
    );
  }

  const largest = Math.max(base.length, local.length, incoming.length);
  if (largest > MAX_MERGE_BYTES) {
    return conflict(
      local,
      `File too large for automatic three-way merge (${largest} bytes exceeds the ${MAX_MERGE_BYTES} byte limit); manual resolution required.`,
    );
  }

  if (isBinaryLike(base) || isBinaryLike(local) || isBinaryLike(incoming)) {
    return conflict(
      local,
      "Binary content changed on both sides and cannot be line-merged; manual resolution required.",
    );
  }

  let baseText: string;
  let localText: string;
  let incomingText: string;
  try {
    baseText = decodeStrict(base);
    localText = decodeStrict(local);
    incomingText = decodeStrict(incoming);
  } catch {
    return conflict(
      local,
      "Content is not valid UTF-8 on both changed sides and cannot be merged; manual resolution required.",
    );
  }

  const baseLines = splitLinesRetaining(baseText);
  const localLines = splitLinesRetaining(localText);
  const incomingLines = splitLinesRetaining(incomingText);
  if (baseLines.length + localLines.length + incomingLines.length > MAX_MERGE_LINES * 3) {
    return conflict(
      local,
      `File has too many lines for automatic three-way merge; manual resolution required.`,
    );
  }

  const regions = diff3Merge(localLines, baseLines, incomingLines, {
    excludeFalseConflicts: true,
  });
  const merged: string[] = [];
  for (const region of regions) {
    if (region.conflict !== undefined) {
      return conflict(
        local,
        "Overlapping changes on both sides; manual resolution required.",
      );
    }
    if (region.ok !== undefined) {
      merged.push(...region.ok);
    }
  }

  return {
    status: "merged",
    content: Buffer.from(merged.join(""), "utf8"),
    reason: "Merged non-overlapping changes from both sides.",
  };
}

/**
 * Unified diff of `local` vs `incoming` for display. Returns "" when both
 * sides are byte-identical. Binary content yields an honest one-line summary;
 * oversized or overly complex inputs yield an explanatory message instead of
 * an empty or unbounded computation.
 */
export function unifiedComponentDiff(
  path: string,
  local: Buffer | null,
  incoming: Buffer | null,
): string {
  if (buffersEqual(local, incoming)) {
    return "";
  }

  const localBinary = local !== null && isBinaryLike(local);
  const incomingBinary = incoming !== null && isBinaryLike(incoming);
  if (localBinary || incomingBinary) {
    if (local === null) {
      return `Binary file ${path} added (${incoming?.length ?? 0} bytes).\n`;
    }
    if (incoming === null) {
      return `Binary file ${path} removed (${local.length} bytes).\n`;
    }
    return `Binary files ${path} differ (local ${local.length} bytes, incoming ${incoming.length} bytes).\n`;
  }

  const localSize = local?.length ?? 0;
  const incomingSize = incoming?.length ?? 0;
  if (localSize + incomingSize > DIFF_MAX_BYTES) {
    return `Diff for ${path} omitted: content too large to display (local ${localSize} bytes, incoming ${incomingSize} bytes).\n`;
  }

  const oldStr = local?.toString("utf8") ?? "";
  const newStr = incoming?.toString("utf8") ?? "";
  const options = {
    context: DIFF_CONTEXT_LINES,
    timeout: DIFF_TIMEOUT_MS,
    maxEditLength: DIFF_MAX_EDIT_LENGTH,
  };
  const patch = createTwoFilesPatch(
    local === null ? "/dev/null" : `a/${path}`,
    incoming === null ? "/dev/null" : `b/${path}`,
    oldStr,
    newStr,
    undefined,
    undefined,
    options,
  );
  if (patch === undefined) {
    return `Diff for ${path} omitted: content too complex to diff within limits (local ${localSize} bytes, incoming ${incomingSize} bytes).\n`;
  }
  return patch;
}
