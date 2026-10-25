---
id: 2
title: "Scaffold the module layout, the module runner and the local registry"
type: feature
priority: P0
effort: M
model: sonnet
area: [monorepo]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-2-worker
created: 2026-10-25
---

The layout every other card builds in, under the independent-module model: `vsslicer/modules/<name>/` (each module a self-contained pnpm project), `vsslicer/scripts/` (module runner and local registry), `vsslicer/fixtures/`, `.nvmrc`, `.gitignore`, `.gitattributes`. No root workspace, root lockfile or Turborepo. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [x] `vsslicer/modules/` holds `tooling` (`@vsslicer/tooling`), a sample library `example` (`@vsslicer/example`) and a sample extension `example-extension` that depends on `@vsslicer/example` through a semver range; each has its own `package.json`, `pnpm-lock.yaml`, `CHANGELOG.md`, `.npmrc`, `engines` and `packageManager`
- [x] `scripts/registry.sh start|stop` runs a pinned Verdaccio on `localhost:4873` with storage in `vsslicer/.registry/` (gitignored), per D12
- [x] `node scripts/run.mjs <command> [--changed <ref>]` runs a command in every module in dependency order; ordering, changed-plus-dependents selection and a named dependency cycle error are unit tested
- [x] From a clean clone, `scripts/registry.sh start && node scripts/run.mjs ci` installs with a frozen lockfile, lints, builds, tests and publishes every module in order; afterwards `cd modules/example-extension && pnpm install --frozen-lockfile && pnpm test && pnpm build` works on its own
- [x] Publishing skips a version already in the registry and never overwrites it; packing a module twice gives the same tarball hash (tested)
- [x] No `pnpm-workspace.yaml`, `turbo.json` or root lockfile; `.nvmrc` pins the Node line of VS Code's Electron (24.x at `vscode@4ef6bab7`)

## Tasks

- [x] Replace the workspace scaffold with `modules/`, `scripts/` and `fixtures/`
- [x] Add the Verdaccio registry script and config
- [x] Write `scripts/run.mjs` with tests
- [x] Port the sample library and extension to modules and verify a clean run

## Progress

Reopened for the independent-module model (owner decision, `.ai/instructions.md` "Architecture rules" at 241f7cf; D12). The first version (commit 62b9723: pnpm workspace + Turborepo under `vsslicer/`) is replaced: criteria rewritten to modules, runner and local registry. Not started on the new criteria.

Done (all paths under `vsslicer/`, which is the code root):
- Removed the workspace scaffold (root package.json, pnpm-workspace.yaml, turbo.json, lockfile, packages/, extensions/, apps/, tools/, node_modules). `apply-repo-settings.sh` moved to `scripts/github/` unchanged (relative path to `.github/rulesets/main.json` still resolves).
- `modules/tooling`, `modules/example`, `modules/example-extension` (plain CJS, node:test, SPDX headers), each with package.json, own pnpm-lock.yaml, CHANGELOG.md, .npmrc (only the `@vsslicer` registry), engines, packageManager, publishConfig.
- `scripts/registry.sh start|stop|status` with Verdaccio 6.11.1 pinned exactly (7.0.1 depends on prereleases that fail pnpm's minimumReleaseAge), config in `scripts/verdaccio/config.yaml`, storage `.registry/`. Publish token is passed by env from `run.mjs`, never stored.
- `scripts/run.mjs` + pure `scripts/lib.mjs`: topological order, named cycle error, `--changed <ref>` (diff + untracked + transitive dependents), `install`, `publish` (skips existing name@version), `ci`, any script name.
- `.gitignore`, `.gitattributes` (`* text=auto eol=lf`), `.nvmrc` 24 kept.

Verified: from scratch (registry stopped, `.registry` and node_modules/dist removed) `registry.sh start && node scripts/run.mjs ci` passes and publishes example, example-extension, tooling; a second run skips all; extension `pnpm install --frozen-lockfile && pnpm test && pnpm build` passes alone; `scripts` tests 6/6 (ordering, cycle, changed, pack-twice hash equality); same sequence passes in a copy of the non-ignored files in a scratch dir (a real clone is not possible before commit). Registry stopped at the end.

Notes: pnpm 11 writes two small settings-only `pnpm-workspace.yaml` files, `scripts/` (minimumReleaseAgeExclude for verdaccio) and `modules/example-extension/` (`@vsslicer/*` excluded from the release-age gate because fresh local publishes are new); there is no root one. `run.mjs publish` does not build; `ci` does. Not covered: Linux/CI runners (tarball hash across OS), changes under `scripts/` do not select modules.

Files:
- `vsslicer/.gitattributes`
- `vsslicer/modules/example-extension/.npmrc`
- `vsslicer/modules/example-extension/CHANGELOG.md`
- `vsslicer/modules/example-extension/package.json`
- `vsslicer/modules/example-extension/pnpm-lock.yaml`
- `vsslicer/modules/example-extension/pnpm-workspace.yaml`
- `vsslicer/modules/example-extension/src/extension.js`
- `vsslicer/modules/example-extension/test/extension.test.js`
- `vsslicer/modules/example/.npmrc`
- `vsslicer/modules/example/CHANGELOG.md`
- `vsslicer/modules/example/package.json`
- `vsslicer/modules/example/pnpm-lock.yaml`
- `vsslicer/modules/example/src/domain/greeting.js`
- `vsslicer/modules/example/src/index.js`
- `vsslicer/modules/example/test/greeting.test.js`
- `vsslicer/modules/tooling/.npmrc`
- `vsslicer/modules/tooling/CHANGELOG.md`
- `vsslicer/modules/tooling/package.json`
- `vsslicer/modules/tooling/pnpm-lock.yaml`
- `vsslicer/modules/tooling/src/index.js`
- `vsslicer/modules/tooling/test/index.test.js`
- `vsslicer/scripts/github/apply-repo-settings.sh`
- `vsslicer/scripts/lib.mjs`
- `vsslicer/scripts/package.json`
- `vsslicer/scripts/pnpm-lock.yaml`
- `vsslicer/scripts/pnpm-workspace.yaml`
- `vsslicer/scripts/registry.sh`
- `vsslicer/scripts/run.mjs`
- `vsslicer/scripts/test/lib.test.mjs`
- `vsslicer/scripts/test/pack.test.mjs`
- `vsslicer/scripts/verdaccio/config.yaml`
- `vsslicer/.gitignore`
- `vsslicer/.nvmrc`
- `vsslicer/fixtures/.gitkeep`
