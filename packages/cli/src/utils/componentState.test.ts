import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CliError } from "./errors";
import {
  assertSafeComponentPath,
  createInstalledFile,
  readComponentState,
  readComponentStateSnapshot,
  serializeComponentState,
  validateComponentState,
} from "./componentState";
import type {
  ComponentState,
  InstalledComponentFile,
} from "./componentTypes";

const DEST = "components/ui";
const KEY = "components/ui/button/index.ts";
const CONTENT = Buffer.from("export const Button = 1;\n", "utf8");

function installedFile(
  overrides: Partial<InstalledComponentFile> = {},
): InstalledComponentFile {
  return {
    component: "button",
    path: KEY,
    source: "registry/button/index.ts",
    registryVersion: "1.0.0",
    base: CONTENT.toString("base64"),
    sha256: createHash("sha256").update(CONTENT).digest("hex"),
    ...overrides,
  };
}

function validState(overrides: Partial<ComponentState> = {}): ComponentState {
  return {
    version: 1,
    destinationRoot: DEST,
    platform: "web",
    requests: ["button"],
    files: { [KEY]: installedFile() },
    ...overrides,
  };
}

function filesState(
  files: Record<string, InstalledComponentFile>,
): ComponentState {
  return validState({ files });
}

async function makeRoot(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "synthex-state-"));
}

async function writeStateFile(cwd: string, raw: Buffer): Promise<string> {
  await mkdir(path.join(cwd, ".synthex"), { recursive: true });
  const target = path.join(cwd, ".synthex", "components.json");
  await writeFile(target, raw);
  return target;
}

describe("validateComponentState", () => {
  it("accepts a valid state", () => {
    expect(validateComponentState(validState())).toEqual(validState());
  });

  it("rejects key/path mismatch", () => {
    const entry = installedFile({ path: "components/ui/button/other.ts" });
    expect(() =>
      validateComponentState(filesState({ [KEY]: entry })),
    ).toThrow(CliError);
  });

  it("rejects files outside destinationRoot (e.g. README)", () => {
    const content = Buffer.from("# readme\n", "utf8");
    const entry: InstalledComponentFile = {
      component: "button",
      path: "README.md",
      source: "registry/readme.md",
      registryVersion: null,
      base: content.toString("base64"),
      sha256: createHash("sha256").update(content).digest("hex"),
    };
    expect(() =>
      validateComponentState(filesState({ "README.md": entry })),
    ).toThrow(CliError);
  });

  it("rejects files under destinationRoot with the wrong component segment", () => {
    const entry = installedFile({ path: "components/ui/card/index.ts" });
    expect(() =>
      validateComponentState(
        filesState({ "components/ui/card/index.ts": entry }),
      ),
    ).toThrow(CliError);
  });

  it("rejects a bare component dir without a file segment", () => {
    const entry = installedFile({ path: "components/ui/button" });
    expect(() =>
      validateComponentState(
        filesState({ "components/ui/button": entry }),
      ),
    ).toThrow(CliError);
  });

  it("rejects .synthex records", () => {
    const entry = installedFile({ path: ".synthex/components.json" });
    expect(() =>
      validateComponentState(
        filesState({ ".synthex/components.json": entry }),
      ),
    ).toThrow(CliError);
  });

  it("rejects prototype keys in the files dictionary", () => {
    for (const proto of ["__proto__", "constructor", "prototype"]) {
      const parsed = JSON.parse(
        `{"version":1,"destinationRoot":"${DEST}","platform":"web","requests":[],"files":{"${proto}":${JSON.stringify(installedFile())}}}`,
      ) as unknown;
      expect(() => validateComponentState(parsed)).toThrow(CliError);
    }
  });

  it("rejects prototype keys at top level and in entries", () => {
    const top = JSON.parse(
      `{"version":1,"destinationRoot":"${DEST}","platform":"web","requests":[],"files":{},"__proto__":{"x":1}}`,
    ) as unknown;
    expect(() => validateComponentState(top)).toThrow(CliError);

    const entryJson = JSON.stringify(installedFile()).replace(
      /^\{/,
      '{"__proto__":{"polluted":true},',
    );
    const entryRaw = JSON.parse(entryJson) as unknown;
    expect(() =>
      validateComponentState(filesState({ [KEY]: entryRaw as InstalledComponentFile })),
    ).toThrow(CliError);
    expect(({} as Record<string, unknown>)["polluted"]).toBeUndefined();
  });

  it("rejects bad base64, sha mismatch and bad sha format", () => {
    expect(() =>
      validateComponentState(
        filesState({ [KEY]: installedFile({ base: "!!!not-base64!!!" }) }),
      ),
    ).toThrow(CliError);
    expect(() =>
      validateComponentState(
        filesState({
          [KEY]: installedFile({ sha256: "0".repeat(64) }),
        }),
      ),
    ).toThrow(CliError);
    expect(() =>
      validateComponentState(
        filesState({ [KEY]: installedFile({ sha256: "ABC" }) }),
      ),
    ).toThrow(CliError);
  });

  it("rejects unknown fields, bad version/platform/destinationRoot", () => {
    expect(() =>
      validateComponentState({ ...validState(), extra: 1 }),
    ).toThrow(CliError);
    expect(() =>
      validateComponentState({ ...validState(), version: 2 }),
    ).toThrow(CliError);
    expect(() =>
      validateComponentState({ ...validState(), platform: "vue" }),
    ).toThrow(CliError);
    for (const dest of ["/abs", "../escape", ".synthex", "a\\b", ""]) {
      expect(() =>
        validateComponentState(validState({ destinationRoot: dest })),
      ).toThrow(CliError);
    }
  });
});

describe("serializeComponentState", () => {
  it("round-trips through validate with sorted keys and trailing newline", () => {
    const other = installedFile({
      component: "card",
      path: "components/ui/card/index.ts",
    });
    const state = filesState({
      "components/ui/card/index.ts": other,
      [KEY]: installedFile(),
    });
    const raw = serializeComponentState(state);
    expect(Buffer.isBuffer(raw)).toBe(true);
    expect(raw.toString("utf8").endsWith("\n")).toBe(true);
    expect(validateComponentState(JSON.parse(raw.toString("utf8")))).toEqual(
      validateComponentState(state),
    );
    const parsed = JSON.parse(raw.toString("utf8")) as {
      files: Record<string, unknown>;
    };
    expect(Object.keys(parsed.files)).toEqual(
      [...Object.keys(parsed.files)].sort(),
    );
  });
});

describe("createInstalledFile", () => {
  it("derives POSIX path, base and sha256", async () => {
    const cwd = await makeRoot();
    const content = Buffer.from([0, 1, 2, 255]);
    const installed = createInstalledFile(
      {
        component: "button",
        relativePath: "index.ts",
        source: "registry/button/index.ts",
        destination: path.join(cwd, "components", "ui", "button", "index.ts"),
        content,
        registryVersion: "1.2.3",
      },
      cwd,
    );
    expect(installed.path).toBe("components/ui/button/index.ts");
    expect(installed.base).toBe(content.toString("base64"));
    expect(installed.sha256).toBe(
      createHash("sha256").update(content).digest("hex"),
    );
  });

  it("rejects destinations outside cwd", async () => {
    const cwd = await makeRoot();
    expect(() =>
      createInstalledFile(
        {
          component: "button",
          relativePath: "index.ts",
          source: "s",
          destination: "../escape.ts",
          content: Buffer.from("x"),
          registryVersion: null,
        },
        cwd,
      ),
    ).toThrow(CliError);
  });
});

describe("assertSafeComponentPath", () => {
  it("resolves normal missing and existing files", async () => {
    const cwd = await makeRoot();
    const missing = await assertSafeComponentPath(cwd, "a/b.txt");
    expect(missing).toBe(path.join(cwd, "a", "b.txt"));
    await mkdir(path.join(cwd, "a"), { recursive: true });
    await writeFile(path.join(cwd, "a", "b.txt"), "hi");
    await expect(assertSafeComponentPath(cwd, "a/b.txt")).resolves.toBe(
      path.join(cwd, "a", "b.txt"),
    );
  });

  it("rejects absolute, empty, backslash, dot and escaping paths", async () => {
    const cwd = await makeRoot();
    for (const bad of [
      "",
      "/abs.txt",
      "C:/win.txt",
      "a\\b.txt",
      "../escape.txt",
      "a/../../escape.txt",
      "a/./b.txt",
      "a//b.txt",
      "a/b/",
      ".",
      "..",
    ]) {
      await expect(assertSafeComponentPath(cwd, bad)).rejects.toThrow(
        CliError,
      );
    }
  });

  it("gates .synthex behind allowState", async () => {
    const cwd = await makeRoot();
    await expect(
      assertSafeComponentPath(cwd, ".synthex/components.json"),
    ).rejects.toThrow(CliError);
    await expect(
      assertSafeComponentPath(cwd, ".synthex/components.json", {
        allowState: true,
      }),
    ).resolves.toBe(path.join(cwd, ".synthex", "components.json"));
  });

  it("permits conflict artifacts with allowState but nothing else under .synthex", async () => {
    const cwd = await makeRoot();
    const id = "123e4567-e89b-12d3-a456-426614174000";
    await expect(
      assertSafeComponentPath(cwd, `.synthex/conflicts/${id}/manifest.json`, {
        allowState: true,
      }),
    ).resolves.toBe(
      path.join(cwd, ".synthex", "conflicts", id, "manifest.json"),
    );
    await expect(
      assertSafeComponentPath(
        cwd,
        `.synthex/conflicts/${id}/local/${KEY}`,
        { allowState: true },
      ),
    ).resolves.toBe(
      path.join(cwd, ".synthex", "conflicts", id, "local", ...KEY.split("/")),
    );
    for (const bad of [
      ".synthex/backups/x",
      ".synthex/random.json",
      `.synthex/conflicts/not-a-uuid/manifest.json`,
      `.synthex/conflicts/${id}/side/${KEY}`,
      `.synthex/conflicts/${id}/local/.synthex/evil`,
      ".synthex",
    ]) {
      await expect(
        assertSafeComponentPath(cwd, bad, { allowState: true }),
      ).rejects.toThrow(CliError);
    }
  });

  it("rejects symlinks, dangling links, symlinked dirs and directories as files", async () => {
    const cwd = await makeRoot();
    await writeFile(path.join(cwd, "real.txt"), "real");
    await symlink(path.join(cwd, "real.txt"), path.join(cwd, "link.txt"));
    await symlink(
      path.join(cwd, "does-not-exist.txt"),
      path.join(cwd, "dangling.txt"),
    );
    await expect(assertSafeComponentPath(cwd, "link.txt")).rejects.toThrow(
      CliError,
    );
    await expect(assertSafeComponentPath(cwd, "dangling.txt")).rejects.toThrow(
      CliError,
    );

    await mkdir(path.join(cwd, "realdir"));
    await writeFile(path.join(cwd, "realdir", "f.txt"), "f");
    await symlink(path.join(cwd, "realdir"), path.join(cwd, "dirlink"));
    await expect(
      assertSafeComponentPath(cwd, "dirlink/f.txt"),
    ).rejects.toThrow(CliError);

    await mkdir(path.join(cwd, "somedir"));
    await expect(assertSafeComponentPath(cwd, "somedir")).rejects.toThrow(
      CliError,
    );

    await writeFile(path.join(cwd, "afile"), "x");
    await expect(assertSafeComponentPath(cwd, "afile/b.txt")).rejects.toThrow(
      CliError,
    );
  });

  it("rejects a symlinked .synthex even with allowState", async () => {
    const cwd = await makeRoot();
    await mkdir(path.join(cwd, "elsewhere"));
    await symlink(path.join(cwd, "elsewhere"), path.join(cwd, ".synthex"));
    await expect(
      assertSafeComponentPath(cwd, ".synthex/components.json", {
        allowState: true,
      }),
    ).rejects.toThrow(CliError);
  });
});

describe("readComponentStateSnapshot", () => {
  it("returns nulls when state is missing and delegates in readComponentState", async () => {
    const cwd = await makeRoot();
    await expect(readComponentStateSnapshot(cwd)).resolves.toEqual({
      state: null,
      raw: null,
    });
    await expect(readComponentState(cwd)).resolves.toBeNull();
  });

  it("reads and validates the same bytes once", async () => {
    const cwd = await makeRoot();
    const raw = serializeComponentState(validState());
    await writeStateFile(cwd, raw);
    const snapshot = await readComponentStateSnapshot(cwd);
    expect(snapshot.raw?.equals(raw)).toBe(true);
    expect(snapshot.state).toEqual(validateComponentState(validState()));
    await expect(readComponentState(cwd)).resolves.toEqual(snapshot.state);
    const onDisk = await readFile(
      path.join(cwd, ".synthex", "components.json"),
    );
    expect(onDisk.equals(snapshot.raw as Buffer)).toBe(true);
  });

  it("distinguishes malformed and invalid state from missing", async () => {
    const cwd = await makeRoot();
    await writeStateFile(cwd, Buffer.from("{ not json", "utf8"));
    await expect(readComponentStateSnapshot(cwd)).rejects.toThrow(CliError);
    await expect(readComponentState(cwd)).rejects.toThrow(CliError);

    const bad = Buffer.from(
      JSON.stringify({ version: 1, destinationRoot: DEST }) + "\n",
      "utf8",
    );
    await writeStateFile(cwd, bad);
    await expect(readComponentStateSnapshot(cwd)).rejects.toThrow(CliError);
  });

  it("throws (not null) when the state path is a directory", async () => {
    const cwd = await makeRoot();
    await mkdir(path.join(cwd, ".synthex", "components.json"), {
      recursive: true,
    });
    await expect(readComponentStateSnapshot(cwd)).rejects.toThrow(CliError);
    await expect(readComponentState(cwd)).rejects.toThrow(CliError);
  });
});
