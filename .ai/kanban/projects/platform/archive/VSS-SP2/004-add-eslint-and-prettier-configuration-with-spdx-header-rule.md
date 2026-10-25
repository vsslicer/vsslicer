---
id: 4
title: Add ESLint and Prettier configuration with SPDX header rule
type: feature
priority: P0
effort: S
model: sonnet
area: [monorepo]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-4-worker
depends_on: [2]
created: 2026-10-25
---

Module: `tooling`. One shared ESLint and Prettier configuration in `@vsslicer/tooling`, consumed by every module, including the SPDX header rule and the layer-boundary rule that enforces the Clean architecture layers. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [x] `pnpm lint` in a module fails on a deliberately mis-formatted fixture, on an unused import, and on a source file without the SPDX header
- [x] `import/no-extraneous-dependencies` is an error
- [x] A layer-boundary rule (`eslint-plugin-boundaries` or `dependency-cruiser`) fails `lint` when `domain` imports `application`, `adapters` or `presentation`, when `application` imports `adapters` or `presentation`, or when any file outside `presentation` imports `vscode`; proven on deliberate-violation fixtures
- [x] Config is one shared export of `@vsslicer/tooling`, consumed by every module

## Tasks

- [x] Create `packages/eslint-config` (private)
- [x] Add Prettier config and `format` script
- [x] Wire `lint` into every package template

## Progress

"Repository root" read as `vsslicer/`; packages as `vsslicer/modules/<name>`.

Done: `@vsslicer/tooling` 0.4.0 (published to the local registry) exports `./eslint` and `./prettier`. ESLint 10 flat config: typescript-eslint recommended (unused imports error), `import-x/no-extraneous-dependencies` error, local SPDX header rule, `eslint-plugin-boundaries` layer policies by `src/<layer>/` (domain none, application domain, adapters domain+application), `vscode` restricted outside `src/presentation`. `lint` = `eslint . && prettier --check .` (+ tsc); `format` = `prettier --write .`. tooling, example, example-extension all use it (`eslint.config.mjs`, `"prettier"` key, `.prettierignore`, `allowBuilds: unrs-resolver: false`); example/example-extension on tooling ^0.4.0, not bumped (published files unchanged). Tooling description fixed. `scripts/run.mjs` sets `CI=true` for children. CONTRIBUTING.md has a "Lint and format" section (commands, layer rule, adoption steps).

Verified: `modules/tooling/test/lint.test.mjs` (in `pnpm test`) runs ESLint and prettier on deliberate-violation fixtures in `test/fixtures/lint/` and asserts the expected rule for missing SPDX, unused import, extraneous dependency, each of the 5 forbidden layer imports, `vscode` in domain/application/adapters, misformatted file; clean fixtures (incl. `vscode` in presentation) pass. `env -u CI node scripts/run.mjs ci` green for all modules; runner tests 6/6; empty-store frozen installs OK for the three modules.

Not done: gcode-api adoption (other lane). Registry left running.

Files: CONTRIBUTING.md; vsslicer/scripts/run.mjs; vsslicer/modules/tooling/{eslint.mjs,eslint.config.mjs,prettier.config.mjs,.prettierignore,package.json,pnpm-lock.yaml,pnpm-workspace.yaml,CHANGELOG.md,test/lint.test.mjs,test/bundle.test.mjs (formatted),test/fixtures/lint/**}; vsslicer/modules/{example,example-extension}/{eslint.config.mjs,.prettierignore,package.json,pnpm-lock.yaml,pnpm-workspace.yaml}; .reference/notes/PLT-4-eslint.md.
