import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import type { Command } from "commander";
import { CliError } from "../utils/errors";
import { logger } from "../utils/logger";
import { detectProject, getInstallCommand } from "../utils/project";
import type { Framework, PackageManager } from "../utils/project";
import { UI_CONFIG_FILENAME, assertSafeUiConfigPaths, type UiConfig } from "../utils/uiConfig";

export type SetupFileStatus = "planned" | "written" | "skipped-existing";

export interface SetupFileEntry {
  readonly relativePath: string;
  readonly path: string;
  readonly status: SetupFileStatus;
  readonly content: string;
}

export interface SetupManifest {
  readonly cwd: string;
  readonly framework: Framework;
  readonly packageManager: PackageManager;
  readonly workspaceRoot: string | null;
  readonly srcDir: "src" | ".";
  readonly appDir: string | null;
  readonly config: UiConfig;
  readonly dryRun: boolean;
  readonly files: readonly SetupFileEntry[];
  readonly installCommands: readonly string[];
  readonly instructions: readonly string[];
}

export interface SetupProjectOptions {
  readonly cwd?: string;
  readonly framework?: Framework;
  readonly packageManager?: PackageManager;
  readonly dryRun?: boolean;
}

interface SetupCommandCliOptions {
  cwd?: string;
  framework?: string;
  packageManager?: string;
  dryRun?: boolean;
}

function toPosix(target: string): string {
  return target.split(sep).join("/");
}

function cssSourceLine(fromDirAbs: string, libDistAbs: string): string {
  let rel = toPosix(relative(fromDirAbs, libDistAbs));
  if (!rel.startsWith(".")) {
    rel = `./${rel}`;
  }
  return `@source "${rel}";`;
}

function buildCssContent(cwdAbs: string, workspaceRoot: string | null, cssAbs: string): string {
  const fromDir = dirname(cssAbs);
  const appLib = join(cwdAbs, "node_modules", "synthex-ui", "dist");
  const lines = [
    '@import "tailwindcss";',
    '@import "synthex-ui/styles.css";',
    "",
    cssSourceLine(fromDir, appLib),
  ];
  if (workspaceRoot !== null && resolve(workspaceRoot) !== cwdAbs) {
    const workspaceLib = join(resolve(workspaceRoot), "node_modules", "synthex-ui", "dist");
    const workspaceLine = cssSourceLine(fromDir, workspaceLib);
    if (workspaceLine !== lines[lines.length - 1]) {
      lines.push(workspaceLine);
    }
  }
  return `${lines.join("\n")}\n`;
}

function buildProviderContent(framework: Framework): string {
  const themeImport = framework === "expo" ? "synthex-ui/native" : "synthex-ui/theme";
  const header = framework === "next" ? '"use client";\n\n' : "";
  return (
    `${header}import type { ReactNode } from "react";\n` +
    `import { ThemeProvider } from "${themeImport}";\n` +
    `\n` +
    `export function SynthexProvider({ children }: { children: ReactNode }) {\n` +
    `  return <ThemeProvider>{children}</ThemeProvider>;\n` +
    `}\n`
  );
}

function relativeImportSpecifier(fromRel: string, toRel: string): string {
  let rel = posix.relative(posix.dirname(fromRel), toRel);
  if (!rel.startsWith(".")) {
    rel = `./${rel}`;
  }
  return rel;
}

function buildInstructions(
  framework: Framework,
  config: UiConfig,
  installCommands: readonly string[],
): string[] {
  const runs = installCommands.map((cmd) => `Run "${cmd}".`);
  const addHint = `Run "synthex add <component>" to copy components into "${config.componentsDir}".`;
  if (framework === "vite") {
    const entry = (config.css ?? "").startsWith("src/") ? "src/main.tsx" : "main.tsx";
    return [
      ...runs,
      "Keep the Tailwind Vite plugin (@tailwindcss/vite) in vite.config.ts; setup does not edit build config.",
      `Import "${relativeImportSpecifier(entry, config.css as string)}" once from your app entry (e.g. ${entry}).`,
      `Wrap your root with the ThemeProvider-based SynthexProvider from "${config.provider}".`,
      addHint,
    ];
  }
  if (framework === "next") {
    const layoutRel = `${posix.dirname(config.css as string)}/layout.tsx`;
    return [
      ...runs,
      'Keep "@tailwindcss/postcss" in postcss.config.mjs; setup does not edit build config.',
      `Import "${relativeImportSpecifier(layoutRel, config.css as string)}" in your root layout ("${layoutRel}").`,
      `Render <SynthexProvider> from "${config.provider}" (a "use client" boundary) around children in the root layout.`,
      addHint,
    ];
  }
  return [
    ...runs,
    "Use the Expo install command above (not a plain package-manager add) so react-native-svg and react-dom match your Expo SDK version and its React.",
    `Wrap your root component (App.tsx) with SynthexProvider from "${config.provider}".`,
    'No CSS file is used on native; theming comes from "synthex-ui/native".',
    addHint,
  ];
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

export async function setupProject(options: SetupProjectOptions = {}): Promise<SetupManifest> {
  const info = await detectProject({
    cwd: options.cwd,
    framework: options.framework,
    packageManager: options.packageManager,
  });
  const dryRun = options.dryRun ?? false;
  const cwdAbs = info.cwd;

  const prefix = info.srcDir === "src" ? "src" : null;
  const componentsDir = prefix === null ? "components/ui" : "src/components/ui";
  const providerRel = prefix === null ? "components/synthex-provider.tsx" : "src/components/synthex-provider.tsx";
  let cssRel: string | null;
  if (info.framework === "expo") {
    cssRel = null;
  } else if (info.framework === "vite") {
    cssRel = prefix === null ? "synthex.css" : "src/synthex.css";
  } else {
    const appDirPosix = toPosix(info.appDir as string);
    cssRel = `${appDirPosix}/synthex.css`;
  }

  const config: UiConfig = {
    version: 1,
    framework: info.framework,
    packageManager: info.packageManager,
    componentsDir,
    css: cssRel,
    provider: providerRel,
  };

  const configContent = `${JSON.stringify(config, null, 2)}\n`;
  const cssAbs = cssRel === null ? null : resolve(cwdAbs, cssRel);
  const cssContent = cssAbs === null ? null : buildCssContent(cwdAbs, info.workspaceRoot, cssAbs);
  const providerAbs = resolve(cwdAbs, providerRel);
  const providerContent = buildProviderContent(info.framework);

  await assertSafeUiConfigPaths(cwdAbs, config);

  const planned: Array<{ relativePath: string; path: string; content: string }> = [
    { relativePath: UI_CONFIG_FILENAME, path: resolve(cwdAbs, UI_CONFIG_FILENAME), content: configContent },
  ];
  if (cssAbs !== null && cssContent !== null && cssRel !== null) {
    planned.push({ relativePath: cssRel, path: cssAbs, content: cssContent });
  }
  planned.push({ relativePath: providerRel, path: providerAbs, content: providerContent });

  const files: SetupFileEntry[] = [];
  const conflicts: string[] = [];
  for (const entry of planned) {
    if (!(await pathExists(entry.path))) {
      files.push({ ...entry, status: "planned" });
      continue;
    }
    const existing = await readFile(entry.path, "utf8");
    if (existing === entry.content) {
      files.push({ ...entry, status: "skipped-existing" });
    } else {
      conflicts.push(entry.relativePath);
    }
  }

  if (conflicts.length > 0) {
    throw new CliError(
      `Refusing to overwrite ${conflicts.length} existing file(s) with different content: ${conflicts.join(", ")}. ` +
        `Delete or update them manually; "synthex setup" never overwrites.`,
      1,
      { files: conflicts },
    );
  }

  if (dryRun) {
    const installCommands = buildInstallCommands(info.packageManager, info.framework);
    return {
      cwd: cwdAbs,
      framework: info.framework,
      packageManager: info.packageManager,
      workspaceRoot: info.workspaceRoot,
      srcDir: info.srcDir,
      appDir: info.appDir,
      config,
      dryRun: true,
      files,
      installCommands,
      instructions: buildInstructions(info.framework, config, installCommands),
    };
  }

  const written: SetupFileEntry[] = [];
  for (const entry of files) {
    if (entry.status === "skipped-existing") {
      written.push(entry);
      continue;
    }
    await mkdir(dirname(entry.path), { recursive: true });
    await writeFile(entry.path, entry.content, "utf8");
    written.push({ ...entry, status: "written" });
  }

  const installCommands = buildInstallCommands(info.packageManager, info.framework);
  return {
    cwd: cwdAbs,
    framework: info.framework,
    packageManager: info.packageManager,
    workspaceRoot: info.workspaceRoot,
    srcDir: info.srcDir,
    appDir: info.appDir,
    config,
    dryRun: false,
    files: written,
    installCommands,
    instructions: buildInstructions(info.framework, config, installCommands),
  };
}

function getExpoSdkInstallCommand(manager: PackageManager): string {
  const packages = "react-native-svg react-dom";
  switch (manager) {
    case "npm":
      return `npx expo install ${packages} --npm`;
    case "pnpm":
      return `pnpm exec expo install ${packages} --pnpm`;
    case "yarn":
      return `yarn expo install ${packages} --yarn`;
    case "bun":
      return `bunx expo install ${packages} --bun`;
  }
}

function buildInstallCommands(manager: PackageManager, framework: Framework): string[] {
  if (framework === "expo") {
    return [
      getInstallCommand(manager, ["synthex-ui", "lucide-react-native"]),
      getExpoSdkInstallCommand(manager),
    ];
  }
  const tailwindPlugin = framework === "next" ? "@tailwindcss/postcss" : "@tailwindcss/vite";
  const tailwindDeps =
    framework === "next" ? ["tailwindcss", tailwindPlugin, "postcss"] : ["tailwindcss", tailwindPlugin];
  return [
    getInstallCommand(manager, ["synthex-ui"]),
    getInstallCommand(manager, tailwindDeps, { dev: true }),
  ];
}

export function registerSetupCommand(program: Command): void {
  program
    .command("setup")
    .description("Generate synthex-ui.json, CSS, and a ThemeProvider wrapper for an existing vite, next, or expo app.")
    .option("--cwd <dir>", "Target project directory")
    .option("--framework <framework>", "Framework (vite|next|expo)")
    .option("--package-manager <manager>", "Package manager (npm|pnpm|yarn|bun)")
    .option("--dry-run", "List files without writing", false)
    .action(async (cliOptions: SetupCommandCliOptions) => {
      const manifest = await setupProject({
        cwd: cliOptions.cwd,
        framework: cliOptions.framework as Framework | undefined,
        packageManager: cliOptions.packageManager as PackageManager | undefined,
        dryRun: cliOptions.dryRun,
      });

      process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);

      if (manifest.dryRun) {
        logger.info(`Dry run: ${manifest.files.length} file(s) would be written.`);
      } else {
        logger.success("Synthex setup complete.");
      }
    });
}
