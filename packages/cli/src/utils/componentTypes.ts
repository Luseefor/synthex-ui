export type ComponentPlatform = "web" | "native" | null;

export interface RegistryComponentFile {
  readonly component: string;
  readonly relativePath: string;
  readonly source: string;
  readonly destination: string;
  readonly content: Buffer;
  readonly registryVersion: string | null;
}

export interface ComponentPlan {
  readonly cwd: string;
  readonly destinationRoot: string;
  readonly platform: ComponentPlatform;
  readonly files: readonly RegistryComponentFile[];
  /** Previously installed roots explicitly retired from valid registry metadata. */
  readonly removedComponents?: readonly string[];
}

export interface InstalledComponentFile {
  readonly component: string;
  readonly path: string;
  readonly source: string;
  readonly registryVersion: string | null;
  /** Original registry bytes, encoded as base64. */
  readonly base: string;
  readonly sha256: string;
}

export interface ComponentState {
  readonly version: 1;
  readonly destinationRoot: string;
  readonly platform: ComponentPlatform;
  readonly requests: readonly string[];
  readonly files: Readonly<Record<string, InstalledComponentFile>>;
}

export interface ComponentMutation {
  /** POSIX path relative to the target project. */
  readonly path: string;
  /** Null removes the file. */
  readonly content: Buffer | null;
  /** Bytes observed during preflight; null means the file was absent. */
  readonly expected: Buffer | null;
}
