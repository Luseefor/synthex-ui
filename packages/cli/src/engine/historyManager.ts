import { createHash } from "node:crypto";
import { cloneLayout, serializeLayout, type LayoutAction, type LayoutNode } from "@synthex/core";
import type { HistoryEntry, HistoryManager, HistorySnapshot, LayoutEngineDispatchOptions } from "../types";

export function createHistoryManager(initialSnapshot?: HistorySnapshot): HistoryManager {
  const records = cloneHistoryEntries(initialSnapshot?.records ?? []);
  const past = cloneHistoryEntries(initialSnapshot?.past ?? []);
  const future = cloneHistoryEntries(initialSnapshot?.future ?? []);

  return {
    record(action, prevState, nextState, options) {
      const entry = createHistoryEntry(action, prevState, nextState, options);
      const changed = serializeLayout(prevState) !== serializeLayout(nextState);

      records.push(cloneHistoryEntry(entry));

      if (!changed || options?.recordHistory === false) {
        return;
      }

      past.push(entry);
      future.length = 0;
    },

    undo() {
      const entry = past.pop();

      if (!entry) {
        return null;
      }

      future.push(cloneHistoryEntry(entry));
      return cloneHistoryEntry(entry);
    },

    redo() {
      const entry = future.pop();

      if (!entry) {
        return null;
      }

      past.push(cloneHistoryEntry(entry));
      return cloneHistoryEntry(entry);
    },

    clear() {
      past.length = 0;
      future.length = 0;
    },

    getSnapshot() {
      return {
        version: 1,
        records: cloneHistoryEntries(records),
        past: cloneHistoryEntries(past),
        future: cloneHistoryEntries(future),
      };
    },
  };
}

function createHistoryEntry(
  action: LayoutAction,
  prevState: LayoutNode,
  nextState: LayoutNode,
  options?: LayoutEngineDispatchOptions,
): HistoryEntry {
  return {
    timestamp: new Date().toISOString(),
    commandName: options?.commandName ?? action.type,
    payload: cloneAction(action),
    snapshotHash: hashLayout(nextState),
    prevState: cloneLayout(prevState),
    nextState: cloneLayout(nextState),
  };
}

function hashLayout(layout: LayoutNode): string {
  return createHash("sha256").update(serializeLayout(layout)).digest("hex");
}

function cloneHistoryEntries(entries: readonly HistoryEntry[]): HistoryEntry[] {
  return entries.map((entry) => cloneHistoryEntry(entry));
}

function cloneHistoryEntry(entry: HistoryEntry): HistoryEntry {
  return {
    timestamp: entry.timestamp,
    commandName: entry.commandName,
    payload: cloneAction(entry.payload),
    snapshotHash: entry.snapshotHash,
    prevState: cloneLayout(entry.prevState),
    nextState: cloneLayout(entry.nextState),
  };
}

function cloneAction(action: LayoutAction): LayoutAction {
  return JSON.parse(JSON.stringify(action)) as LayoutAction;
}
