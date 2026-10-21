import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import type { Command } from "commander";
import { CliError } from "../utils/errors";
import { logger } from "../utils/logger";
import { getDefaultStarterRoot as resolveDefaultStarterRoot } from "../utils/assets";

export function getDefaultStarterRoot(): string {
  return resolveDefaultStarterRoot();
}

export interface CreateProjectOptions {
  readonly cwd?: string;
  readonly templateRoot?: string;
}

export interface CreateProjectResult {
  readonly name: string;
  readonly cwd: string;
  readonly destination: string;
  readonly files: readonly string[];
}

interface CreateCommandCliOptions {
  cwd?: string;
}

export async function createProject(name: string, options: CreateProjectOptions = {}): Promise<CreateProjectResult> {
  validateProjectName(name);

  const cwd = resolve(options.cwd ?? process.cwd());
  const destination = join(cwd, name);

  if (await pathExists(destination)) {
    throw new CliError(`Destination "${destination}" already exists.`);
  }

  const templateRoot = options.templateRoot ?? getDefaultStarterRoot();
  await assertTemplateRoot(templateRoot);

  const files = await copyDir(templateRoot, destination);
  await rewritePackageName(destination, name);

  return { name, cwd, destination, files };
}

export function registerCreateCommand(program: Command): void {
  program
    .command("create")
    .description("Scaffold a new project from templates/starter.")
    .argument("<name>", "New project directory name")
    .option("--cwd <dir>", "Parent directory for the new project")
    .action(async (name: string, cliOptions: CreateCommandCliOptions) => {
      const result = await createProject(name, { cwd: cliOptions.cwd });

      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      logger.success(`Created project "${result.name}".`);
    });
}

function validateProjectName(name: string): void {
  if (name.length === 0 || name === "." || name === ".." || isAbsolute(name) || name.includes("/") || name.includes("\\") || name.includes("\0")) {
    throw new CliError(`Invalid project name "${name}".`);
  }
}

async function assertTemplateRoot(templateRoot: string): Promise<void> {
  try {
    const stats = await stat(templateRoot);
    if (!stats.isDirectory()) {
      throw new CliError(`Starter template not found at "${templateRoot}".`);
    }
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }
    throw new CliError(`Starter template not found at "${templateRoot}".`);
  }
}

async function copyDir(source: string, destination: string, base: string = source): Promise<string[]> {
  const entries = await readdir(source, { withFileTypes: true });
  const files: string[] = [];
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of sorted) {
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) {
      await mkdir(to, { recursive: true });
      files.push(...(await copyDir(from, to, base)));
    } else if (entry.isFile()) {
      await mkdir(dirname(to), { recursive: true });
      await copyFile(from, to);
      files.push(relative(base, from));
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

async function rewritePackageName(destination: string, name: string): Promise<void> {
  const packagePath = join(destination, "package.json");
  let raw: string;
  try {
    raw = await readFile(packagePath, "utf8");
  } catch {
    throw new CliError(`Starter template is missing package.json (expected at "${packagePath}").`);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new CliError(`Starter template package.json is invalid JSON (at "${packagePath}").`);
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new CliError(`Starter template package.json is invalid (at "${packagePath}").`);
  }

  const record = data as Record<string, unknown>;
  record["name"] = name;
  await writeFile(packagePath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}
