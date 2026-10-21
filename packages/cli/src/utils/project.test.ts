import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  detectPackageManager,
  detectProject,
  getInstallCommand,
  getRunCommand,
} from "./project";
import { CliError } from "./errors";

async function fixture(
  files: Record<string, string>,
  dirs: string[] = [],
): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "synthex-project-"));
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

describe("detectProject framework", () => {
  it("detects vite with srcDir src", async () => {
    const root = await fixture({ "package.json": pkg({ vite: "^5.0.0" }) }, ["src"]);
    const info = await detectProject({ cwd: root });
    expect(info.framework).toBe("vite");
    expect(info.cwd).toBe(path.resolve(root));
    expect(info.srcDir).toBe("src");
    expect(info.appDir).toBeNull();
  });

  it("detects expo and defaults package manager to npm", async () => {
    const root = await fixture({ "package.json": pkg({ expo: "~51.0.0" }) });
    const info = await detectProject({ cwd: root });
    expect(info.framework).toBe("expo");
    expect(info.packageManager).toBe("npm");
    expect(info.srcDir).toBe(".");
    expect(info.workspaceRoot).toBeNull();
  });

  it("detects next with src/app", async () => {
    const root = await fixture({ "package.json": pkg({ next: "^14.0.0" }) }, ["src/app"]);
    const info = await detectProject({ cwd: root });
    expect(info.framework).toBe("next");
    expect(info.appDir).toBe(path.join("src", "app"));
    expect(info.srcDir).toBe("src");
  });

  it("detects next with app/", async () => {
    const root = await fixture({ "package.json": pkg({ next: "^14.0.0" }) }, ["app"]);
    const info = await detectProject({ cwd: root });
    expect(info.appDir).toBe("app");
  });

  it("prefers root app/ over src/app when both exist", async () => {
    const root = await fixture({ "package.json": pkg({ next: "^14.0.0" }) }, ["app", "src/app"]);
    const info = await detectProject({ cwd: root });
    expect(info.framework).toBe("next");
    expect(info.appDir).toBe("app");
  });

  it("rejects next pages-router only", async () => {
    const root = await fixture({ "package.json": pkg({ next: "^14.0.0" }) }, ["pages"]);
    await expect(detectProject({ cwd: root })).rejects.toThrow(/app router/i);
  });

  it("errors on unknown framework with actionable message", async () => {
    const root = await fixture({ "package.json": pkg({ react: "^18.0.0" }) });
    await expect(detectProject({ cwd: root })).rejects.toThrow(/could not detect/i);
  });

  it("errors on expo+vite ambiguity unless override", async () => {
    const root = await fixture({ "package.json": pkg({ expo: "1.0.0", vite: "5.0.0" }) }, ["src"]);
    await expect(detectProject({ cwd: root })).rejects.toThrow(/ambiguous/i);
    const info = await detectProject({ cwd: root, framework: "expo" });
    expect(info.framework).toBe("expo");
  });

  it("requires package.json in target cwd and never picks workspace root silently", async () => {
    const root = await fixture({
      "package.json": JSON.stringify(
        { name: "root", private: true, workspaces: ["apps/*"], dependencies: { vite: "^5.0.0" } },
        null,
        2,
      ),
    });
    const app = path.join(root, "apps", "web");
    await mkdir(app, { recursive: true });
    await expect(detectProject({ cwd: app })).rejects.toThrow(/no package\.json/i);
  });

  it("rejects malformed package.json", async () => {
    const root = await fixture({ "package.json": "{ not json" });
    await expect(detectProject({ cwd: root })).rejects.toThrow(/invalid package\.json/i);
  });

  it("validates framework and packageManager input", async () => {
    const root = await fixture({ "package.json": pkg({ vite: "1.0.0" }) }, ["src"]);
    await expect(
      detectProject({ cwd: root, framework: "remix" as never }),
    ).rejects.toBeInstanceOf(CliError);
    await expect(
      detectProject({ cwd: root, packageManager: "deno" as never }),
    ).rejects.toBeInstanceOf(CliError);
  });
});

describe("detectProject monorepo and package manager", () => {
  it("resolves workspace root and manager from apps/web", async () => {
    const root = await fixture({
      "package.json": JSON.stringify(
        { name: "root", private: true, workspaces: ["apps/*"], packageManager: "pnpm@9.0.0" },
        null,
        2,
      ),
      "apps/web/package.json": pkg({ vite: "^5.0.0" }),
    });
    const info = await detectProject({ cwd: path.join(root, "apps", "web") });
    expect(info.workspaceRoot).toBe(path.resolve(root));
    expect(info.packageManager).toBe("pnpm");
  });

  it("detects manager from nearest lockfile", async () => {
    const root = await fixture(
      {
        "package.json": pkg({ vite: "^5.0.0" }),
        "yarn.lock": "",
      },
      ["src"],
    );
    const info = await detectProject({ cwd: root });
    expect(info.packageManager).toBe("yarn");
  });

  it("errors on conflicting lockfiles in the same dir", async () => {
    const root = await fixture({
      "package.json": pkg({ vite: "^5.0.0" }),
      "package-lock.json": "{}",
      "yarn.lock": "",
    });
    await expect(detectProject({ cwd: root })).rejects.toThrow(/ambiguous package manager/i);
  });

  it("explicit manager overrides lockfiles", async () => {
    const root = await fixture({
      "package.json": pkg({ vite: "^5.0.0" }),
      "yarn.lock": "",
    });
    const info = await detectProject({ cwd: root, packageManager: "npm" });
    expect(info.packageManager).toBe("npm");
  });

  it("does not cross .git boundary for workspace root", async () => {
    const outer = await fixture({
      "package.json": JSON.stringify(
        { name: "outer", private: true, workspaces: ["*"] },
        null,
        2,
      ),
    });
    const repo = path.join(outer, "repo");
    const app = path.join(repo, "apps", "web");
    await mkdir(app, { recursive: true });
    await mkdir(path.join(repo, ".git"), { recursive: true });
    await writeFile(
      path.join(app, "package.json"),
      pkg({ vite: "^5.0.0" }),
      "utf8",
    );
    const info = await detectProject({ cwd: app });
    expect(info.workspaceRoot).toBeNull();
  });

  it("finds pnpm workspace root", async () => {
    const root = await fixture({
      "pnpm-workspace.yaml": "packages:\n  - 'apps/*'\n",
      "apps/web/package.json": pkg({ vite: "^5.0.0" }),
    });
    const info = await detectProject({ cwd: path.join(root, "apps", "web") });
    expect(info.workspaceRoot).toBe(path.resolve(root));
  });
});

describe("detectPackageManager for create", () => {
  it("resolves from empty dir via parent lockfile", async () => {
    const root = await fixture({ "pnpm-lock.yaml": "" });
    const empty = path.join(root, "new-app");
    await mkdir(empty, { recursive: true });
    expect(await detectPackageManager(empty)).toBe("pnpm");
  });

  it("honors override and validates input", async () => {
    const root = await fixture({});
    expect(await detectPackageManager(root, "bun")).toBe("bun");
    await expect(detectPackageManager(root, "deno" as never)).rejects.toBeInstanceOf(CliError);
  });
});

describe("command helpers", () => {
  it("builds install commands", () => {
    expect(getInstallCommand("npm", ["a", "b"])).toBe("npm install a b");
    expect(getInstallCommand("npm", ["a"], { dev: true })).toBe("npm install -D a");
    expect(getInstallCommand("yarn", ["a"])).toBe("yarn add a");
    expect(getInstallCommand("yarn", ["a"], { dev: true })).toBe("yarn add -D a");
    expect(getInstallCommand("pnpm", ["a"])).toBe("pnpm add a");
    expect(getInstallCommand("pnpm", ["a"], { dev: true })).toBe("pnpm add -D a");
    expect(getInstallCommand("bun", ["a"])).toBe("bun add a");
    expect(getInstallCommand("bun", ["a"], { dev: true })).toBe("bun add -d a");
  });

  it("builds run commands", () => {
    expect(getRunCommand("npm", "dev")).toBe("npm run dev");
    expect(getRunCommand("yarn", "dev")).toBe("yarn run dev");
    expect(getRunCommand("pnpm", "dev")).toBe("pnpm run dev");
    expect(getRunCommand("bun", "dev")).toBe("bun run dev");
  });

  it("validates helper input", () => {
    expect(() => getInstallCommand("deno" as never, ["a"])).toThrow(CliError);
    expect(() => getRunCommand("npm", "")).toThrow(CliError);
  });
});
