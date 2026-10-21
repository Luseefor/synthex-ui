# Deprecation policy

States how breaking changes ship with migration help.

## Version rules

Minor releases add features in a backward compatible way. Patch releases fix bugs with no API change. Breaking changes ship only in major releases.

```bash
npm run changeset
```

## Breaking change checklist

Every breaking pull request ships three artifacts. Skip none of them.

```bash
node scripts/migrate-shadcn.mjs --dry-run ./src
node scripts/migrate-shadcn.mjs ./src
```

| Artifact | Location |
| ---- | ------- |
| `Changeset` | `.changeset/<name>.md` with major bump note |
| `Migration entry` | `docs/migration.md` with old and new snippets |
| `Codemod` | `scripts/migrate-*.mjs` when the rename is automatable |

## Timeline

Mark the old API as deprecated in one minor, keep it working with a warning, then remove it in the next major. Use `console.warn` once per mount on web and native. Keep the deprecated export typed as optional so type checks still pass.

## Accessibility

Deprecation warnings use plain text without color alone. Migration entries keep old and new code blocks with labels so screen readers read the change. Keep codemod output reviewable before write.

## Native support

On native deprecated props keep the same `testID` values until removal. Pass `testID` only when a test needs a custom query value. Codemods update web and native imports together.
