import { mkdtemp, mkdir, readFile, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Command } from "commander";
import { describe, expect, it } from "vitest";
import { registerSetupCommand, setupProject } from "./setup";
import { readUiConfig } from "../utils/uiConfig";

async function fixture(
  files: Record<string, string>,
  dirs: string[] = [],
): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "synthex-setup-"));
  for (const dir of dirs) {
    await mkdir(path.join(root, dir), { recursive: true });
  }
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, content, "utf8");
  }
  return root;
}

function pkg(deps: Record<string, unknown>, extra: Record<string, unknown> = {}): string {
  return `${JSON.stringify({ name: "fixture", version: "0.0.0", ...extra, dependencies: deps }, null, 2)}\n`;
}

async function exists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

describe("setupProject web frameworks", () => {
  it("sets up vite with src/", async () => {
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) }, ["src"]);
    const manifest = await setupProject({ cwd: root });

    expect(manifest.framework).toBe("vite");
    expect(manifest.dryRun).toBe(false);
    expect(manifest.config).toEqual({
      version: 1,
      framework: "vite",
      packageManager: "npm",
      componentsDir: "src/components/ui",
      css: "src/synthex.css",
      provider: "src/components/synthex-provider.tsx",
    });
    expect(manifest.files.every((f) => f.status === "written")).toBe(true);
    expect(manifest.files).toHaveLength(3);

    const css = await readFile(path.join(root, "src", "synthex.css"), "utf8");
    expect(css).toContain('@import "tailwindcss";');
    expect(css).toContain('@import "synthex-ui/styles.css";');
    expect(css).toContain('@source "../node_modules/synthex-ui/dist";');

    const provider = await readFile(path.join(root, "src", "components", "synthex-provider.tsx"), "utf8");
    expect(provider).not.toContain("use client");
    expect(provider).toContain('from "synthex-ui/theme"');
    expect(provider).toContain("ReactNode");

    const configRaw = await readFile(path.join(root, "synthex-ui.json"), "utf8");
    expect(JSON.parse(configRaw)).toEqual(manifest.config);

    expect(manifest.installCommands).toEqual([
      "npm install synthex-ui",
      "npm install -D tailwindcss @tailwindcss/vite",
    ]);
    const joined = manifest.instructions.join("\n");
    for (const cmd of manifest.installCommands) {
      expect(joined).toContain(`"${cmd}"`);
    }
    expect(joined).toMatch(/vite\.config/i);
    expect(joined).toMatch(/ThemeProvider/);
    expect(joined).toContain('Import "./synthex.css"');
  });

  it("sets up vite without src/", async () => {
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) });
    const manifest = await setupProject({ cwd: root });

    expect(manifest.config.componentsDir).toBe("components/ui");
    expect(manifest.config.css).toBe("synthex.css");
    expect(manifest.config.provider).toBe("components/synthex-provider.tsx");
    const css = await readFile(path.join(root, "synthex.css"), "utf8");
    expect(css).toContain("node_modules/synthex-ui/dist");
  });

  it("sets up next with src/app and a client-boundary provider", async () => {
    const root = await fixture({ "package.json": pkg({ next: "^14.0.0" }) }, ["src/app"]);
    const manifest = await setupProject({ cwd: root });

    expect(manifest.config.css).toBe("src/app/synthex.css");
    expect(manifest.config.provider).toBe("src/components/synthex-provider.tsx");
    const css = await readFile(path.join(root, "src", "app", "synthex.css"), "utf8");
    expect(css).toContain('@source "../../node_modules/synthex-ui/dist";');
    const provider = await readFile(path.join(root, "src", "components", "synthex-provider.tsx"), "utf8");
    expect(provider.split("\n")[0]).toBe('"use client";');
    expect(provider).toContain('from "synthex-ui/theme"');
    expect(manifest.installCommands).toEqual([
      "npm install synthex-ui",
      "npm install -D tailwindcss @tailwindcss/postcss postcss",
    ]);
    const joined = manifest.instructions.join("\n");
    for (const cmd of manifest.installCommands) {
      expect(joined).toContain(`"${cmd}"`);
    }
    expect(joined).toMatch(/postcss/i);
    expect(joined).toMatch(/root layout/i);
    expect(joined).not.toMatch(/server component/i);
    expect(joined).toContain('Import "./synthex.css"');
  });

  it("sets up next with app/ and no src/", async () => {
    const root = await fixture({ "package.json": pkg({ next: "^14.0.0" }) }, ["app"]);
    const manifest = await setupProject({ cwd: root });

    expect(manifest.config.componentsDir).toBe("components/ui");
    expect(manifest.config.css).toBe("app/synthex.css");
    await expect(readFile(path.join(root, "app", "synthex.css"), "utf8")).resolves.toContain(
      "synthex-ui/dist",
    );
  });

  it("honors explicit package manager in install commands", async () => {
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) }, ["src"]);
    const manifest = await setupProject({ cwd: root, packageManager: "pnpm" });
    expect(manifest.installCommands).toEqual([
      "pnpm add synthex-ui",
      "pnpm add -D tailwindcss @tailwindcss/vite",
    ]);
  });

describe("install commands per package manager", () => {
  const managers = ["npm", "pnpm", "yarn", "bun"] as const;

  it("emits SDK-pinned expo commands for each manager", async () => {
    const expected: Record<(typeof managers)[number], string[]> = {
      npm: ["npm install synthex-ui lucide-react-native", "npx expo install react-native-svg react-dom --npm"],
      pnpm: ["pnpm add synthex-ui lucide-react-native", "pnpm exec expo install react-native-svg react-dom --pnpm"],
      yarn: ["yarn add synthex-ui lucide-react-native", "yarn expo install react-native-svg react-dom --yarn"],
      bun: ["bun add synthex-ui lucide-react-native", "bunx expo install react-native-svg react-dom --bun"],
    };
    for (const pm of managers) {
      const root = await fixture({ "package.json": pkg({ expo: "~51.0.0" }) });
      const manifest = await setupProject({ cwd: root, packageManager: pm });
      expect(manifest.installCommands).toEqual(expected[pm]);
      const joined = manifest.instructions.join("\n");
      for (const cmd of manifest.installCommands) {
        expect(joined, pm).toContain(`"${cmd}"`);
      }
    }
  });

  it("resolves SDK-era existing Expo app commands without legacy peer workarounds", async () => {
    const root = await fixture({
      "package.json": JSON.stringify(
        {
          name: "sdk-app",
          version: "0.0.0",
          dependencies: { expo: "~53.0.0", react: "19.0.0", "react-native": "0.79.2" },
        },
        null,
        2,
      ),
    });
    const manifest = await setupProject({ cwd: root });

    expect(manifest.framework).toBe("expo");
    expect(manifest.config.css).toBeNull();
    expect(manifest.installCommands).toEqual([
      "npm install synthex-ui lucide-react-native",
      "npx expo install react-native-svg react-dom --npm",
    ]);
    expect(manifest.installCommands[0]).toContain("lucide-react-native");
    expect(manifest.installCommands[1]).toContain("react-native-svg");
    expect(manifest.installCommands[1]).toContain("react-dom");
    expect(manifest.instructions.join("\n")).toMatch(/expo sdk version/i);
  });

  it("adds postcss to the next tailwind dev deps for each manager", async () => {
    for (const pm of managers) {
      const root = await fixture({ "package.json": pkg({ next: "^14.0.0" }) }, ["src/app"]);
      const manifest = await setupProject({ cwd: root, packageManager: pm });
      const addVerb = pm === "npm" ? "install" : "add";
      const devFlag = pm === "bun" ? "-d" : "-D";
      expect(manifest.installCommands[1]).toBe(
        `${pm} ${addVerb} ${devFlag} tailwindcss @tailwindcss/postcss postcss`,
      );
    }
  });

  it("keeps vite tailwind dev deps without postcss for each manager", async () => {
    for (const pm of managers) {
      const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) }, ["src"]);
      const manifest = await setupProject({ cwd: root, packageManager: pm });
      expect(manifest.installCommands[1]).toContain("tailwindcss @tailwindcss/vite");
      expect(manifest.installCommands[1]).not.toContain("postcss");
    }
  });
});

  it("prints every install command in the instructions", async () => {
    const viteRoot = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) }, ["src"]);
    const nextRoot = await fixture({ "package.json": pkg({ next: "^14.0.0" }) }, ["src/app"]);
    const expoRoot = await fixture({ "package.json": pkg({ expo: "~51.0.0" }) });
    for (const root of [viteRoot, nextRoot, expoRoot]) {
      const manifest = await setupProject({ cwd: root });
      const joined = manifest.instructions.join("\n");
      expect(manifest.installCommands.length).toBeGreaterThan(0);
      for (const cmd of manifest.installCommands) {
        expect(joined, root).toContain(`"${cmd}"`);
      }
    }
  });
});

describe("setupProject expo", () => {
  it("writes native provider with no CSS", async () => {
    const root = await fixture({ "package.json": pkg({ expo: "~51.0.0" }) });
    const manifest = await setupProject({ cwd: root });

    expect(manifest.config.css).toBeNull();
    expect(manifest.files).toHaveLength(2);
    expect(manifest.files.map((f) => f.relativePath).sort()).toEqual([
      "components/synthex-provider.tsx",
      "synthex-ui.json",
    ]);
    const provider = await readFile(path.join(root, "components", "synthex-provider.tsx"), "utf8");
    expect(provider).toContain('from "synthex-ui/native"');
    expect(provider).not.toContain("use client");
    expect(await exists(path.join(root, "synthex.css"))).toBe(false);
    expect(manifest.installCommands).toEqual([
      "npm install synthex-ui lucide-react-native",
      "npx expo install react-native-svg react-dom --npm",
    ]);
    const joined = manifest.instructions.join("\n");
    for (const cmd of manifest.installCommands) {
      expect(joined).toContain(`"${cmd}"`);
    }
    expect(joined).toMatch(/expo install/i);
  });
});

describe("setupProject workspace source paths", () => {
  it("emits app and workspace @source lines when they differ", async () => {
    const root = await fixture({
      "package.json": JSON.stringify(
        { name: "root", private: true, workspaces: ["apps/*"] },
        null,
        2,
      ),
      "apps/web/package.json": pkg({ vite: "^5.0.0" }),
    });
    const cwd = path.join(root, "apps", "web");
    await mkdir(path.join(cwd, "src"), { recursive: true });
    const manifest = await setupProject({ cwd });

    expect(manifest.workspaceRoot).toBe(path.resolve(root));
    const css = await readFile(path.join(cwd, "src", "synthex.css"), "utf8");
    const sources = css.split("\n").filter((line) => line.startsWith("@source"));
    expect(sources).toHaveLength(2);
    expect(sources[0]).toContain("node_modules/synthex-ui/dist");
    expect(sources[1]).toContain("node_modules/synthex-ui/dist");
    expect(sources[0]).not.toBe(sources[1]);
  });
});

describe("setupProject idempotence and conflicts", () => {
  it("is idempotent: second run skips identical files", async () => {
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) }, ["src"]);
    const first = await setupProject({ cwd: root });
    expect(first.files.every((f) => f.status === "written")).toBe(true);

    const second = await setupProject({ cwd: root });
    expect(second.files.every((f) => f.status === "skipped-existing")).toBe(true);
    expect(second.files.map((f) => f.relativePath).sort()).toEqual(
      first.files.map((f) => f.relativePath).sort(),
    );

    const preview = await setupProject({ cwd: root, dryRun: true });
    expect(preview.files.every((f) => f.status === "skipped-existing")).toBe(true);
    expect(preview.files.map((f) => f.relativePath).sort()).toEqual(
      first.files.map((f) => f.relativePath).sort(),
    );
  });

  it("refuses conflicts before any writes", async () => {
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) }, ["src"]);
    await setupProject({ cwd: root });

    await writeFile(path.join(root, "src", "components", "synthex-provider.tsx"), "edited\n");
    const cssPath = path.join(root, "src", "synthex.css");
    const { rm } = await import("node:fs/promises");
    await rm(cssPath);

    await expect(setupProject({ cwd: root })).rejects.toThrow(/refusing to overwrite/i);
    expect(await exists(cssPath)).toBe(false);
    await expect(readFile(path.join(root, "src", "components", "synthex-provider.tsx"), "utf8")).resolves.toBe(
      "edited\n",
    );
  });

  it("dry-run previews without writing and throws on conflicts like a real run", async () => {
    const root = await fixture({ "package.json": pkg({ next: "^14.0.0" }) }, ["src/app"]);
    const preview = await setupProject({ cwd: root, dryRun: true });
    expect(preview.dryRun).toBe(true);
    expect(preview.files.every((f) => f.status === "planned")).toBe(true);
    expect(await exists(path.join(root, "synthex-ui.json"))).toBe(false);

    await setupProject({ cwd: root });
    await writeFile(path.join(root, "src", "app", "synthex.css"), "edited\n");
    await expect(setupProject({ cwd: root, dryRun: true })).rejects.toThrow(/refusing to overwrite/i);
    await expect(readFile(path.join(root, "src", "app", "synthex.css"), "utf8")).resolves.toBe("edited\n");
    expect(await exists(path.join(root, "src", "components", "synthex-provider.tsx"))).toBe(true);
  });

  it("rejects generated paths that escape through symlinks before any writes", async () => {
    const outside = await mkdtemp(path.join(tmpdir(), "synthex-outside-"));
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) });
    await symlink(outside, path.join(root, "src"), "dir");

    await expect(setupProject({ cwd: root })).rejects.toThrow(/symlink/i);
    await expect(setupProject({ cwd: root, dryRun: true })).rejects.toThrow(/symlink/i);
    expect(await exists(path.join(root, "synthex-ui.json"))).toBe(false);
  });

  it("rejects generated paths through broken symlinks before any writes", async () => {
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) });
    await symlink(path.join(root, "does-not-exist"), path.join(root, "components"), "dir");

    await expect(setupProject({ cwd: root })).rejects.toThrow(/broken symlink|cannot be resolved/i);
    expect(await exists(path.join(root, "synthex-ui.json"))).toBe(false);
  });

  it("refuses a dangling synthex-ui.json symlink in real and dry runs without writing anywhere", async () => {
    const outsideTarget = path.join(await mkdtemp(path.join(tmpdir(), "synthex-outside-")), "hijacked.json");
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) }, ["src"]);
    await symlink(outsideTarget, path.join(root, "synthex-ui.json"));

    await expect(setupProject({ cwd: root })).rejects.toThrow(/broken symlink/i);
    await expect(setupProject({ cwd: root, dryRun: true })).rejects.toThrow(/broken symlink/i);
    expect(await exists(outsideTarget)).toBe(false);
    expect(await exists(path.join(root, "src", "synthex.css"))).toBe(false);
    expect(await exists(path.join(root, "src", "components", "synthex-provider.tsx"))).toBe(false);
  });

  it("refuses a synthex-ui.json symlink pointing outside in real and dry runs", async () => {
    const outsideDir = await mkdtemp(path.join(tmpdir(), "synthex-outside-"));
    const outsideTarget = path.join(outsideDir, "synthex-ui.json");
    await writeFile(outsideTarget, "{}\n");
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) }, ["src"]);
    await symlink(outsideTarget, path.join(root, "synthex-ui.json"));

    await expect(setupProject({ cwd: root })).rejects.toThrow(/outside the project/i);
    await expect(setupProject({ cwd: root, dryRun: true })).rejects.toThrow(/outside the project/i);
    await expect(readFile(outsideTarget, "utf8")).resolves.toBe("{}\n");
    expect(await exists(path.join(root, "src", "synthex.css"))).toBe(false);
    expect(await exists(path.join(root, "src", "components", "synthex-provider.tsx"))).toBe(false);
  });
});

describe("readUiConfig", () => {
  it("returns null when no config exists", async () => {
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) });
    await expect(readUiConfig(root)).resolves.toBeNull();
  });

  it("round-trips a setupProject config", async () => {
    const root = await fixture({ "package.json": pkg({ expo: "~51.0.0" }) });
    const manifest = await setupProject({ cwd: root });
    await expect(readUiConfig(root)).resolves.toEqual(manifest.config);
  });

  it("rejects malformed and escaping configs", async () => {
    const cases: Array<{ name: string; config: unknown }> = [
      { name: "bad-version", config: { version: 2, framework: "vite", packageManager: "npm", componentsDir: "components/ui", css: "synthex.css", provider: "components/p.tsx" } },
      { name: "bad-framework", config: { version: 1, framework: "remix", packageManager: "npm", componentsDir: "components/ui", css: "synthex.css", provider: "components/p.tsx" } },
      { name: "escaping-dir", config: { version: 1, framework: "vite", packageManager: "npm", componentsDir: "../evil", css: "synthex.css", provider: "components/p.tsx" } },
      { name: "absolute-dir", config: { version: 1, framework: "vite", packageManager: "npm", componentsDir: "/tmp/x", css: "synthex.css", provider: "components/p.tsx" } },
      { name: "expo-css", config: { version: 1, framework: "expo", packageManager: "npm", componentsDir: "components/ui", css: "x.css", provider: "components/p.tsx" } },
      { name: "web-null-css", config: { version: 1, framework: "vite", packageManager: "npm", componentsDir: "components/ui", css: null, provider: "components/p.tsx" } },
      { name: "provider-inside", config: { version: 1, framework: "vite", packageManager: "npm", componentsDir: "components/ui", css: "synthex.css", provider: "components/ui/p.tsx" } },
    ];
    for (const entry of cases) {
      const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) });
      await writeFile(path.join(root, "synthex-ui.json"), JSON.stringify(entry.config));
      await expect(readUiConfig(root), entry.name).rejects.toThrow(/invalid synthex-ui\.json/i);
    }
  });

  it("rejects invalid JSON", async () => {
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) });
    await writeFile(path.join(root, "synthex-ui.json"), "{ not json");
    await expect(readUiConfig(root)).rejects.toThrow(/valid JSON/i);
  });

  it("throws an actionable error when the config path is not a readable file", async () => {
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) });
    await mkdir(path.join(root, "synthex-ui.json"));
    await expect(readUiConfig(root)).rejects.toThrow(/cannot read/i);
  });

  it("rejects a dangling synthex-ui.json symlink instead of reporting missing", async () => {
    const outsideTarget = path.join(await mkdtemp(path.join(tmpdir(), "synthex-outside-")), "missing.json");
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) });
    await symlink(outsideTarget, path.join(root, "synthex-ui.json"));
    await expect(readUiConfig(root)).rejects.toThrow(/broken symlink/i);
  });

  it("rejects symlinks escaping the project", async () => {
    const outside = await mkdtemp(path.join(tmpdir(), "synthex-outside-"));
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) });
    await mkdir(path.join(root, "linked"), { recursive: true });
    await symlink(outside, path.join(root, "linked", "ui"), "dir");
    await writeFile(
      path.join(root, "synthex-ui.json"),
      JSON.stringify({
        version: 1,
        framework: "vite",
        packageManager: "npm",
        componentsDir: "linked/ui",
        css: "synthex.css",
        provider: "components/p.tsx",
      }),
    );
    await expect(readUiConfig(root)).rejects.toThrow(/symlink/i);
  });
});

describe("registerSetupCommand", () => {
  it("registers a setup command with --dry-run", () => {
    const program = new Command();
    registerSetupCommand(program);
    const found = program.commands.find((cmd) => cmd.name() === "setup");
    expect(found).toBeDefined();
    expect(found?.options.map((opt) => opt.long)).toContain("--dry-run");
  });
});
