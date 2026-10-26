---
id: 119
title: Create the `profiles-prusa` module
type: chore
priority: P0
effort: S
model: sonnet
area: [importers]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-scaffold
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Creates the independent `profiles-prusa` module from the `tooling` module. It depends on `profile-api` only, never on `profiles` or a sibling adapter.

**Code:** `vsslicer/modules/profiles-prusa/` (module: `profiles-prusa`, layer: n/a (scaffold))

## Acceptance criteria

- [x] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/profiles-prusa` with nothing else built
- [x] `domain/ application/ adapters/ presentation/` folders exist as needed; a deliberately broken import across layers fails the PLT-4 layer-boundary lint
- [x] `node scripts/run.mjs ci` picks the module up
- [x] `package.json` has name `@vsslicer/profiles-prusa`, version `0.0.0`, licence AGPL-3.0-or-later and semver ranges only on published modules it needs

## Tasks

- [x] Generate the module from the tooling template
- [x] Add one placeholder test per layer folder
- [ ] Run `run.mjs ci`

## Progress

Created `vsslicer/modules/profiles-prusa/` by copying the `profile-api` layout: `package.json` (name `@vsslicer/profiles-prusa`, 0.0.0, AGPL-3.0-or-later, `prepack` builds), `tsconfig*.json`, `eslint.config.mjs` and `prettier` from `@vsslicer/tooling`, `vitest.config.ts`, `.npmrc`, `pnpm-workspace.yaml`, `.prettierignore`, LICENSE, README, CHANGELOG, `src/{domain,application}`, `src/index.ts`, `test/domain.test.ts` (one trivial domain test), `test/layers.test.ts` (domain importing application fails the lint; application importing domain passes). `adapters/` and `presentation/` are not created (no code yet).

`@vsslicer/profile-api` is NOT a dependency yet: it is unreleased (0.0.0) until PRF-135. Stated in the README. Add it as a semver range then.

Verified in the module: `pnpm install`, `pnpm lint`, `pnpm test` (3 passed), `pnpm build` all green. Layer lint proven: a temporary `src/domain/bad.ts` with `export * from '../application/index.ts'` made `pnpm lint` fail with `boundaries/dependencies` ("Dependencies to elements of type application are not allowed in elements of type domain"); removed, lint clean again.

Discovery: `vsslicer/scripts/run.mjs` builds its module list by reading every directory under `modules/` that has a `package.json` (lines 27-31), so the module is picked up with no registration. `run.mjs ci` was not run (rules forbid it).

Not done: the `run.mjs ci` task run (not allowed), adapters/presentation folders, the profile-api dependency.

### Coordinator: shared-file changes

None (the module is new and entirely mine). After PRF-135 publishes profile-api: add `"@vsslicer/profile-api": "^<version>"` to dependencies in `modules/profiles-prusa/package.json`.

Review (sp7-rev-b): PASS. Checked: package.json (name @vsslicer/profiles-prusa, 0.0.0, AGPL-3.0-or-later, prepack builds, files [dist, LICENSE, README.md], no @vsslicer deps besides tooling devDep ^0.8.1 from registry) matches mesh; LICENSE identical to mesh's AGPL text; no relative paths into other modules; .gitignore is the root one (mesh has none either). Ran pnpm lint/test/build in the module: green. Standalone: copied profiles-cura (identical scaffold to prusa/orca apart from names) to scratch without node_modules/dist, pnpm install --frozen-lockfile, lint, test (3 passed), build all green; adding src/domain/bad.ts importing ../application failed eslint with boundaries/dependencies. run.mjs discovers it by directory scan (run.mjs:27-31); guard script over the real module list: no unreleased-dependency problems. Pending: run.mjs ci (coordinator). Fixed in place (docs only): CHANGELOG.md had escaped backticks (\`domain/\`), unescaped. Minor: the "one placeholder test per layer" task has a domain test only; application is covered by test/layers.test.ts.
