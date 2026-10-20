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

function lineOf(source: string, index: number): number {
  return source.slice(0, Math.max(0, index)).split("\n").length;
}

function inferToastAltText(inner: string): string {
  const withoutTags = inner
    .replace(/<[^>]*>/g, " ")
    .replace(/\{[^}]*\}/g, (match) => {
      const literal = match.match(/["']([^"']+)["']/);
      return literal && literal[1] ? ` ${literal[1]} ` : " ";
    });
  const collapsed = withoutTags.replace(/\s+/g, " ").trim();
  if (collapsed) {
    return collapsed;
  }
  const literal = inner.match(/["']([^"']+)["']/);
  if (literal && literal[1] && literal[1].trim()) {
    return literal[1].trim();
  }
  return "Action";
}

function escapeJsxAttribute(value: string): string {
  return value.replace(/"/g, "&quot;");
}

export function transformToastAction(source: string): string {
  const paired = /<ToastAction(?=[\s/>])((?:(?!\saltText\b)[^>])*?)>([\s\S]*?)<\/ToastAction\s*>/g;
  let next = source.replace(paired, (_match, attrs: string, inner: string) => {
    const text = escapeJsxAttribute(inferToastAltText(inner));
    const prefix = typeof attrs === "string" ? attrs : "";
    return `<ToastAction${prefix} altText="${text}">${inner}</ToastAction>`;
  });

  const selfClosing =
    /<ToastAction(?=[\s/>])((?:(?!\saltText\b)[^>])*?)\/>/g;
  next = next.replace(selfClosing, (_match, attrs: string) => {
    const prefix = typeof attrs === "string" ? attrs : "";
    return `<ToastAction${prefix} altText="Action" />`;
  });

  return next;
}

function hasMenubarOpenProp(attrs: string): boolean {
  return /\b(open|defaultOpen|onOpenChange)\b/.test(attrs);
}

function stripMenubarOpenProps(attrs: string): string {
  return attrs
    .replace(/\s*\bopen\s*(=\s*(\{[^{}]*\}|"[^"]*"|'[^']*'|[^\s/>]+))?/g, "")
    .replace(/\s*\bdefaultOpen\s*(=\s*(\{[^{}]*\}|"[^"]*"|'[^']*'|[^\s/>]+))?/g, "")
    .replace(
      /\s*\bonOpenChange\s*(=\s*(\{[^{}]*\}|"[^"]*"|'[^']*'|[^\s/>]+))?/g,
      "",
    );
}

function getMenubarLiteralValue(attrs: string): string | null {
  const doubleQuoted = attrs.match(/\bvalue\s*=\s*"([^"]*)"/);
  if (doubleQuoted && doubleQuoted[1] !== undefined) {
    return doubleQuoted[1];
  }
  const singleQuoted = attrs.match(/\bvalue\s*=\s*'([^']*)'/);
  if (singleQuoted && singleQuoted[1] !== undefined) {
    return singleQuoted[1];
  }
  return null;
}

function hasMenubarValueProp(attrs: string): boolean {
  return /\bvalue\s*=/.test(attrs) || /\bdefaultValue\s*=/.test(attrs);
}

const MENUBAR_MENU_OPEN_PATTERN =
  /<MenubarMenu(?=[\s/>])((?:[^>]*)?)>/g;

export interface MenubarTransformResult {
  readonly source: string;
  readonly warnings: readonly string[];
}

export function transformMenubar(
  source: string,
  fileLabel = "file",
): MenubarTransformResult {
  const warnings: string[] = [];
  const blockRanges: Array<{ start: number; end: number }> = [];

  const blockPattern =
    /<Menubar(?=[\s/>])((?:[^>]*)?)>([\s\S]*?)<\/Menubar\s*>/g;

  let next = source;
  let offsetShift = 0;

  const blocks: Array<{
    start: number;
    end: number;
    full: string;
    parentAttrs: string;
    inner: string;
  }> = [];
  let blockMatch: RegExpExecArray | null;
  blockPattern.lastIndex = 0;
  while ((blockMatch = blockPattern.exec(source)) !== null) {
    blocks.push({
      start: blockMatch.index,
      end: blockMatch.index + blockMatch[0].length,
      full: blockMatch[0],
      parentAttrs: blockMatch[1] ?? "",
      inner: blockMatch[2] ?? "",
    });
    blockRanges.push({
      start: blockMatch.index,
      end: blockMatch.index + blockMatch[0].length,
    });
    if (blockMatch[0].length === 0) {
      blockPattern.lastIndex += 1;
    }
  }

  const menuOutsideRanges = (index: number): boolean =>
    !blockRanges.some((range) => index >= range.start && index < range.end);

  for (const block of blocks) {
    const menus: Array<{ indexInInner: number; full: string; attrs: string }> =
      [];
    MENUBAR_MENU_OPEN_PATTERN.lastIndex = 0;
    let menuMatch: RegExpExecArray | null;
    while (
      (menuMatch = MENUBAR_MENU_OPEN_PATTERN.exec(block.inner)) !== null
    ) {
      menus.push({
        indexInInner: menuMatch.index,
        full: menuMatch[0],
        attrs: menuMatch[1] ?? "",
      });
      if (menuMatch[0].length === 0) {
        MENUBAR_MENU_OPEN_PATTERN.lastIndex += 1;
      }
    }

    const withOpen = menus.filter((menu) => hasMenubarOpenProp(menu.attrs));
    if (withOpen.length === 0) {
      continue;
    }

    let newInner = block.inner;
    for (const menu of withOpen) {
      const stripped = stripMenubarOpenProps(menu.attrs);
      const replacement = `<MenubarMenu${stripped}>`;
      newInner = newInner.replace(menu.full, replacement);
    }

    let newParentAttrs = block.parentAttrs;
    const parentHasValue = hasMenubarValueProp(block.parentAttrs);

    if (!parentHasValue && withOpen.length === 1) {
      const only = withOpen[0];
      if (only) {
        const literal = getMenubarLiteralValue(only.attrs);
        if (literal !== null) {
          newParentAttrs = `${block.parentAttrs} value="${literal}"`;
        } else {
          const parentOpenTagLength = `<Menubar${block.parentAttrs}>`.length;
          const absoluteIndex =
            block.start + parentOpenTagLength + only.indexInInner;
          warnings.push(
            `${fileLabel}:${lineOf(source, absoluteIndex)}: MenubarMenu with open/defaultOpen/onOpenChange needs manual value mapping to parent Menubar value (add value="..." to both <Menubar> and <MenubarMenu>)`,
          );
        }
      }
    } else if (!parentHasValue && withOpen.length > 1) {
      const parentOpenTagLength = `<Menubar${block.parentAttrs}>`.length;
      for (const menu of withOpen) {
        const absoluteIndex =
          block.start + parentOpenTagLength + menu.indexInInner;
        warnings.push(
          `${fileLabel}:${lineOf(source, absoluteIndex)}: Ambiguous MenubarMenu open state (${withOpen.length} menus with open props in one <Menubar>); map each to parent <Menubar value="..."> manually`,
        );
      }
    }

    const parentOpenTag = `<Menubar${block.parentAttrs}>`;
    const newParentOpenTag = `<Menubar${newParentAttrs}>`;
    const oldBlock = `${parentOpenTag}${block.inner}</Menubar>`;
    const newBlock = `${newParentOpenTag}${newInner}</Menubar>`;
    const adjustedStart = block.start + offsetShift;
    next =
      next.slice(0, adjustedStart) +
      newBlock +
      next.slice(adjustedStart + oldBlock.length);
    offsetShift += newBlock.length - oldBlock.length;
  }

  MENUBAR_MENU_OPEN_PATTERN.lastIndex = 0;
  let outsideMatch: RegExpExecArray | null;
  const outsidePattern = /<MenubarMenu(?=[\s/>])((?:[^>]*)?)>/g;
  while ((outsideMatch = outsidePattern.exec(source)) !== null) {
    const attrs = outsideMatch[1] ?? "";
    if (!hasMenubarOpenProp(attrs)) {
      continue;
    }
    if (!menuOutsideRanges(outsideMatch.index)) {
      continue;
    }
    const stripped = stripMenubarOpenProps(attrs);
    next = next.replace(outsideMatch[0], `<MenubarMenu${stripped}>`);
    warnings.push(
      `${fileLabel}:${lineOf(source, outsideMatch.index)}: MenubarMenu with open/defaultOpen/onOpenChange outside <Menubar> needs manual value mapping to parent Menubar value`,
    );
    if (outsideMatch[0].length === 0) {
      outsidePattern.lastIndex += 1;
    }
  }

  return { source: next, warnings };
}

export function collectManualReviewWarnings(
  source: string,
  fileLabel = "file",
): string[] {
  const warnings: string[] = [];

  const triggerPattern = /<SelectTrigger(?=[\s/>])[^>]*>/g;
  let triggerMatch: RegExpExecArray | null;
  while ((triggerMatch = triggerPattern.exec(source)) !== null) {
    const tag = triggerMatch[0];
    const line = lineOf(source, triggerMatch.index);
    const roleMatch = tag.match(/\brole\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\})/);
    if (roleMatch) {
      warnings.push(
        `${fileLabel}:${line}: SelectTrigger overrides ${roleMatch[0].trim()}; Radix renders role="combobox" automatically — remove role prop (put dir on <Select> instead)`,
      );
    }
    if (/\bdir\s*=/.test(tag)) {
      warnings.push(
        `${fileLabel}:${line}: SelectTrigger has dir prop; put dir="ltr" | "rtl" on <Select> root instead`,
      );
    }
  }

  const tabsPattern = /<Tabs(?=[\s/>])((?:[^>]*)?)>/g;
  let tabsMatch: RegExpExecArray | null;
  while ((tabsMatch = tabsPattern.exec(source)) !== null) {
    const attrs = tabsMatch[1] ?? "";
    const line = lineOf(source, tabsMatch.index);
    if (!/\borientation\s*=/.test(attrs)) {
      warnings.push(
        `${fileLabel}:${line}: <Tabs> missing orientation="horizontal" | "vertical"; arrow-key navigation requires explicit orientation`,
      );
    }
    if (!/\bactivationMode\s*=/.test(attrs)) {
      warnings.push(
        `${fileLabel}:${line}: <Tabs> missing activationMode="automatic" | "manual"; manual requires Space/Enter to select`,
      );
    }
    if (!/\b(value|defaultValue)\s*=/.test(attrs)) {
      warnings.push(
        `${fileLabel}:${line}: <Tabs> missing value/defaultValue; use value + onValueChange for controlled tabs`,
      );
    }
  }

  const tabsTriggerPattern = /<TabsTrigger(?=[\s/>])((?:[^>]*)?)>/g;
  let tabsTriggerMatch: RegExpExecArray | null;
  while (
    (tabsTriggerMatch = tabsTriggerPattern.exec(source)) !== null
  ) {
    const attrs = tabsTriggerMatch[1] ?? "";
    if (/\/\s*$/.test(attrs)) {
      continue;
    }
    if (!/\bvalue\s*=/.test(attrs)) {
      warnings.push(
        `${fileLabel}:${lineOf(source, tabsTriggerMatch.index)}: <TabsTrigger> missing value="..."; each trigger needs a value matching its <TabsContent>`,
      );
    }
  }

  const tabsContentPattern = /<TabsContent(?=[\s/>])((?:[^>]*)?)>/g;
  let tabsContentMatch: RegExpExecArray | null;
  while (
    (tabsContentMatch = tabsContentPattern.exec(source)) !== null
  ) {
    const attrs = tabsContentMatch[1] ?? "";
    if (!/\bvalue\s*=/.test(attrs)) {
      warnings.push(
        `${fileLabel}:${lineOf(source, tabsContentMatch.index)}: <TabsContent> missing value="..."; each panel needs a value matching its <TabsTrigger>`,
      );
    }
  }

  return warnings;
}

export interface BreaksTransformResult {
  readonly source: string;
  readonly warnings: readonly string[];
}

export function transformBreaks(
  source: string,
  fileLabel = "file",
): BreaksTransformResult {
  const afterToast = transformToastAction(source);
  const menubar = transformMenubar(afterToast, fileLabel);
  const manual = collectManualReviewWarnings(menubar.source, fileLabel);
  return { source: menubar.source, warnings: [...menubar.warnings, ...manual] };
}

export function needsBreakMigrate(source: string): boolean {
  return transformBreaks(source).source !== source;
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
  readonly warnings: readonly string[];
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
  const allWarnings: string[] = [];

  for (const file of candidates) {
    const source = await readFile(file, "utf8");
    const afterImports = transformMigrateSource(source);
    const breaks = transformBreaks(afterImports, file);
    const next = breaks.source;
    if (breaks.warnings.length > 0) {
      allWarnings.push(...breaks.warnings);
    }
    if (next === source) {
      continue;
    }
    changedFiles.push(file);
    if (!dryRun) {
      await writeFile(file, next, "utf8");
    }
  }

  changedFiles.sort((a, b) => a.localeCompare(b));
  allWarnings.sort((a, b) => a.localeCompare(b));
  return {
    cwd,
    dryRun,
    changed: changedFiles.length,
    files: changedFiles,
    warnings: allWarnings,
  };
}

export function registerMigrateCommand(program: Command): void {
  program
    .command("migrate")
    .description(
      "Migrate shadcn imports (@/components/ui/*) to synthex-ui/components plus ToastAction altText, Menubar value, and Select/Tabs manual-review warnings.",
    )
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
      if (result.warnings.length > 0) {
        logger.info(
          `Manual review needed for ${result.warnings.length} warning(s).`,
          result.warnings,
        );
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
