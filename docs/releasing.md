# Releasing

Primary path is Changesets automation; the manual script is a fallback.

1. Add a changeset (`bunx changeset`), open a PR, get CI (`verify`, `e2e`) green.
2. Maintainer merges the `Version Packages` PR (do not recreate it by hand).
3. `CI` push run on `main` must succeed; the `Release` workflow only runs on
   `CI` success for the same `main` SHA and rebuilds + revalidates artifacts
   (`registry:check`, `build`, `release:check`, `pack:check`) before publish.
   Releases serialize (`release-main`, no cancel); a run whose SHA is no
   longer the `main` tip, or whose context SHA mismatches, never publishes.
4. Check the release logs and npm tags before announcing.

Manual fallback (no versioning, gates first, stops on first failure):

- `node ./scripts/publish-packages.mjs --dry-run` (no npm auth needed)
- `node ./scripts/publish-packages.mjs` (runs `npm whoami`, then publishes)

The publication dry run still checks npm version availability. Apply the
Changesets version bumps first; npm refuses even a dry run of a version that
has already been published.

Release commits use the maintainer git identity, not a bot account.
