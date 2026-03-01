import type { Command } from "./types";

interface HistoryEntry<TContext> {
  command: Command<TContext, unknown, unknown>;
  payload: unknown;
  result: unknown;
}

export interface CommandRegistry<TContext> {
  register: <TPayload, TResult>(command: Command<TContext, TPayload, TResult>) => void;
  dispatch: <TPayload, TResult>(commandId: string, payload: TPayload) => Promise<TResult>;
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
}

export function createCommandRegistry<TContext>(
  getContext: () => TContext,
): CommandRegistry<TContext> {
  const commands = new Map<string, Command<TContext, unknown, unknown>>();
  const undoStack: HistoryEntry<TContext>[] = [];
  const redoStack: HistoryEntry<TContext>[] = [];

  return {
    register(command) {
      commands.set(command.id, command as Command<TContext, unknown, unknown>);
    },

    async dispatch<TPayload, TResult>(commandId: string, payload: TPayload): Promise<TResult> {
      const command = commands.get(commandId);

      if (!command) {
        throw new Error(`Unknown command: ${commandId}`);
      }

      const result = await command.execute(getContext(), payload);

      if (command.undo) {
        undoStack.push({
          command,
          payload,
          result,
        });
        redoStack.length = 0;
      }

      return result as TResult;
    },

    async undo() {
      const entry = undoStack.pop();

      if (!entry || !entry.command.undo) {
        return false;
      }

      await entry.command.undo(getContext(), entry.payload, entry.result);
      redoStack.push(entry);
      return true;
    },

    async redo() {
      const entry = redoStack.pop();

      if (!entry) {
        return false;
      }

      const result = await entry.command.execute(getContext(), entry.payload);
      undoStack.push({
        command: entry.command,
        payload: entry.payload,
        result,
      });

      return true;
    },
  };
}
