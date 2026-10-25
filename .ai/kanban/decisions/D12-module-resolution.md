---
id: D12
title: Modules resolve each other through a local Verdaccio registry
status: accepted
date: 2026-10-25
---

## Context

The architecture rules (`.ai/instructions.md`, commit 241f7cf) make every capability an
independent module in `vsslicer/modules/<name>/`, with its own `package.json`, lockfile, version,
tests, build and release, depending on other modules only through semver ranges on published
packages. There is no root workspace and no root lockfile. Nothing is published yet (D10, Q7,
Q8), so modules need somewhere to resolve `@vsslicer/*` ranges from, locally and in CI.

## Decision (proposed)

1. **A local npm registry, Verdaccio**, pinned in `vsslicer/scripts/package.json` (its own
   lockfile) and run by `vsslicer/scripts/registry.sh start|stop` on `http://localhost:4873`,
   storage in `vsslicer/.registry/` (gitignored). No uplinks for `@vsslicer/*`; everything else
   comes straight from npmjs.
2. **Each module's `.npmrc`** sets `@vsslicer:registry=http://localhost:4873/` only. Swapping it
   for the real registry (npm, or the VSSlicer marketplace) later is a one-line change per module.
3. **Modules publish their committed version** to the local registry; the publish step skips a
   version that is already there and never overwrites one. Changing a module's published content
   means bumping its version (the release rule, PLT-20), so dependents' lockfile integrity hashes
   stay valid.
4. **`vsslicer/scripts/run.mjs`** discovers modules, orders them by their `@vsslicer/*`
   dependencies, and runs a command in each (`install`, `build`, `test`, `publish`, `ci`);
   `--changed <ref>` limits it to changed modules and their dependents. CI starts the registry
   and runs it, so a clean runner rebuilds and republishes every dependency from source.
5. **Packing is deterministic** (`.gitattributes` forces LF, pnpm pack's fixed mtimes), so a
   tarball rebuilt in CI matches the integrity recorded in a dependent's lockfile. A test asserts
   it.

## Alternatives

- `link:`/`file:` dependencies to sibling folders: simplest, but they are relative paths into
  other modules, which the rules forbid, and they don't exercise a real published version.
- A pnpm workspace: rejected by the owner (no root workspace).
- GitHub Packages: needs the remote repository and tokens (Q7 said keep local).

## Consequences

- Building a module needs the registry running and its `@vsslicer/*` dependencies published;
  `node scripts/run.mjs ci` does both in order.
- If a rebuilt tarball's integrity ever differs across operating systems, CI fails the install
  with an integrity error; the fallback is to cache `vsslicer/.registry/` between jobs keyed by
  module versions.
- PLT-2, PLT-3, PLT-9, PLT-20, PLT-21 and PLT-25 are rewritten to this model.
