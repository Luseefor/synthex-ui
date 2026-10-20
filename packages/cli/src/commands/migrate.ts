import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Command } from "commander";
import { logger } from "../utils/logger";

const IMPORT_SOURCE = String.raw`from\s*(["'])((?:@\/)?components\/ui\/[\w-]+|(?:\.{1,2}\/)+ui\/[\w-]+)\1`;
const MIGRATE_REPLACEMENT = 'from "synthex-ui/components"';

function createImportRegex(): RegExp {
  return new RegExp(IMPORT_SOURCE, "g");
}

export function transformMigrateSource(source: string): string {
  return source.replace(createImportRegex(), MIGRATE_REPLACEMENT);
}

export function needsMigrate(source: string): boolean {
  return createImportRegex().test(source);
}

const SKIP_DIRS: ReadonlySet<string> = new Set(["node_modules", "dist", ".git"]);

function isCandidateFile(name: string): boolean {
  return /\.(ts|tsx|js|jsx)$/.test(name);
}

export interface MigrateOptions {
  readonly cwd?: string;
  readonly dryRun?: boolean;
}

export interface MigrateResult {
  readonly cwd: string;
  readonly dryRun: boolean;
  readonly changed: number;
  readonly files: readonly string[];
}

interface MigrateCommandCliOptions {
  cwd?: string;
  dryRun?: boolean;
}

export async function migrateShadcn(options: MigrateOptions = {}): Promise<MigrateResult> {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const dryRun = options.dryRun ?? false;
  const candidates = await collectCandidateFiles(cwd);
  const changedFiles: string[] = [];

  for (const file of candidates) {
    const source = await readFile(file, "utf8");
    if (!needsMigrate(source)) {
      continue;
    }
    const next = transformMigrateSource(source);
    if (next === source) {
      continue;
    }
    changedFiles.push(file);
    if (!dryRun) {
      await writeFile(file, next, "utf8");
    }
  }

  changedFiles.sort((a, b) => a.localeCompare(b));
  return { cwd, dryRun, changed: changedFiles.length, files: changedFiles };
}

export function registerMigrateCommand(program: Command): void {
  program
    .command("migrate")
    .description("Migrate shadcn imports (@/components/ui/*) to synthex-ui/components.")
    .option("--cwd <dir>", "Target project directory")
    .option("--dry-run", "List files without writing", false)
    .action(async (cliOptions: MigrateCommandCliOptions) => {
      const result = await migrateShadcn({
        cwd: cliOptions.cwd,
        dryRun: cliOptions.dryRun,
      });

      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

      if (result.dryRun) {
        logger.info(`Dry run: ${result.changed} file(s) would change.`);
      } else {
        logger.success(`Migrated ${result.changed} file(s).`);
      }
    });
}

async function collectCandidateFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of sorted) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectCandidateFiles(fullPath)));
    } else if (entry.isFile() && isCandidateFile(entry.name)) {
      const stats = await stat(fullPath);
      if (stats.isFile()) {
        files.push(fullPath);
      }
    }
  }

  return files;
}
