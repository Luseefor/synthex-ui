import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import type { Command } from "commander";
import { CliError } from "../utils/errors";
import { logger } from "../utils/logger";
import {
  FRAMEWORKS,
  PACKAGE_MANAGERS,
  getDefaultTemplateRoot as resolveDefaultTemplateRoot,
} from "../utils/assets";
import { detectPackageManager, getInstallCommand, getRunCommand } from "../utils/project";
import type { Framework, PackageManager } from "../utils/project";

export type { Framework, PackageManager };

export function getDefaultStarterRoot(): string {
  return resolveDefaultTemplateRoot("vite");
}

export function getDefaultTemplateRoot(template: Framework = "vite"): string {
  return resolveDefaultTemplateRoot(validateTemplate(template));
}

export interface CreateProjectOptions {
  readonly cwd?: string;
  readonly templateRoot?: string;
  readonly template?: Framework;
  readonly packageManager?: PackageManager;
  readonly dryRun?: boolean;
}

export interface CreateProjectCommands {
  readonly install: string;
  readonly dev: string;
}

export interface CreateProjectResult {
  readonly name: string;
  readonly cwd: string;
  readonly destination: string;
  readonly files: readonly string[];
  readonly template: Framework;
  readonly packageManager: PackageManager;
  readonly commands: CreateProjectCommands;
  readonly dryRun: boolean;
}

interface CreateCommandCliOptions {
  cwd?: string;
  template?: string;
  packageManager?: string;
  dryRun?: boolean;
}

const PROJECT_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,213}$/;

const DEV_SCRIPT_BY_TEMPLATE: Record<Framework, string> = {
  vite: "dev",
  next: "dev",
  expo: "start",
};

export async function createProject(name: string, options: CreateProjectOptions = {}): Promise<CreateProjectResult> {
  validateProjectName(name);
  const template = validateTemplate(options.template ?? "vite");
  const override = validatePackageManagerOption(options.packageManager);
  const dryRun = options.dryRun ?? false;

  const cwd = resolve(options.cwd ?? process.cwd());
  const destination = join(cwd, name);

  if (await pathExists(destination)) {
    throw new CliError(`Destination "${destination}" already exists.`);
  }

  const packageManager = validatePackageManager(await detectPackageManager(cwd, override));

  const templateRoot = options.templateRoot ?? resolveDefaultTemplateRoot(template);
  await assertTemplateRoot(templateRoot, template);
  const packageJson = await readTemplatePackageJson(templateRoot, template);
  const devScript = selectDevScript(template, templateRoot, packageJson);

  const files = dryRun
    ? await collectRelativeFiles(templateRoot)
    : await copyDir(templateRoot, destination);
  if (!dryRun) {
    await writePackageName(destination, name, packageJson);
  }

  const commands: CreateProjectCommands = {
    install: getInstallCommand(packageManager, [], {}),
    dev: getRunCommand(packageManager, devScript),
  };

  return { name, cwd, destination, files, template, packageManager, commands, dryRun };
}

export function registerCreateCommand(program: Command): void {
  program
    .command("create")
    .description("Scaffold a new project (templates: vite, next, expo).")
    .argument("<name>", "New project directory name")
    .option("--template <framework>", "Starter template (vite|next|expo)", "vite")
    .option("--package-manager <manager>", "Package manager (npm|pnpm|yarn|bun)")
    .option("--cwd <dir>", "Parent directory for the new project")
    .option("--dry-run", "Preview files without writing", false)
    .action(async (name: string, cliOptions: CreateCommandCliOptions) => {
      const result = await createProject(name, {
        cwd: cliOptions.cwd,
        template: cliOptions.template as Framework | undefined,
        packageManager: cliOptions.packageManager as PackageManager | undefined,
        dryRun: cliOptions.dryRun,
      });

      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (result.dryRun) {
        logger.info(`Dry run: ${result.files.length} file(s) would be copied.`);
      } else {
        logger.success(`Created project "${result.name}".`);
      }
    });
}

function validateProjectName(name: string): void {
  if (!PROJECT_NAME_PATTERN.test(name)) {
    throw new CliError(`Invalid project name "${name}".`);
  }
}

function validateTemplate(template: Framework): Framework {
  if (typeof template !== "string" || !(FRAMEWORKS as readonly string[]).includes(template)) {
    throw new CliError(`Unknown template "${String(template)}". Expected one of: vite, next, expo.`);
  }
  return template;
}

function validatePackageManagerOption(value: PackageManager | undefined): PackageManager | undefined {
  if (value === undefined) {
    return undefined;
  }
  return validatePackageManager(value);
}

function validatePackageManager(value: PackageManager): PackageManager {
  if (typeof value !== "string" || !(PACKAGE_MANAGERS as readonly string[]).includes(value)) {
    throw new CliError(`Unknown package manager "${String(value)}". Expected one of: npm, pnpm, yarn, bun.`);
  }
  return value;
}

function selectDevScript(
  template: Framework,
  templateRoot: string,
  packageJson: Record<string, unknown>,
): string {
  const script = DEV_SCRIPT_BY_TEMPLATE[template];
  const packagePath = join(templateRoot, "package.json");
  const scripts = packageJson["scripts"];
  if (!scripts || typeof scripts !== "object" || Array.isArray(scripts)) {
    throw new CliError(`${templateLabel(template)} template package.json is missing scripts (at "${packagePath}").`);
  }
  if (typeof (scripts as Record<string, unknown>)[script] !== "string") {
    throw new CliError(
      `${templateLabel(template)} template package.json is missing script "${script}" (at "${packagePath}").`,
    );
  }
  return script;
}

function templateLabel(template: Framework): string {
  switch (template) {
    case "vite":
      return "Starter";
    case "next":
      return "Next";
    case "expo":
      return "Native";
  }
}

async function assertTemplateRoot(templateRoot: string, template: Framework): Promise<void> {
  const label = templateLabel(template);
  try {
    const stats = await stat(templateRoot);
    if (!stats.isDirectory()) {
      throw new CliError(`${label} template not found at "${templateRoot}".`);
    }
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }
    throw new CliError(`${label} template not found at "${templateRoot}".`);
  }
}

async function readTemplatePackageJson(templateRoot: string, template: Framework): Promise<Record<string, unknown>> {
  const label = templateLabel(template);
  const packagePath = join(templateRoot, "package.json");
  let raw: string;
  try {
    raw = await readFile(packagePath, "utf8");
  } catch {
    throw new CliError(`${label} template is missing package.json (expected at "${packagePath}").`);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new CliError(`${label} template package.json is invalid JSON (at "${packagePath}").`);
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new CliError(`${label} template package.json is invalid (at "${packagePath}").`);
  }

  return data as Record<string, unknown>;
}

async function collectRelativeFiles(source: string, base: string = source): Promise<string[]> {
  const entries = await readdir(source, { withFileTypes: true });
  const files: string[] = [];
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of sorted) {
    const from = join(source, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRelativeFiles(from, base)));
    } else if (entry.isFile()) {
      files.push(relative(base, from));
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
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

async function writePackageName(destination: string, name: string, packageJson: Record<string, unknown>): Promise<void> {
  const packagePath = join(destination, "package.json");
  await writeFile(packagePath, `${JSON.stringify({ ...packageJson, name }, null, 2)}\n`, "utf8");
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}
