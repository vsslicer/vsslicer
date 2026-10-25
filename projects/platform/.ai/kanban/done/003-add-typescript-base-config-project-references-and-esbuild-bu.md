---
id: 3
title: Add the TypeScript base config and esbuild bundling to the tooling module
type: feature
priority: P0
effort: M
model: sonnet
area: [monorepo]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-3-worker
depends_on: [2]
created: 2026-10-25
---

Module: `tooling` (shared build config; no layers). One `tsconfig.base.json` and a shared esbuild helper that bundles an extension for node (the browser target is added by E48), published in `@vsslicer/tooling` and consumed by every module as a dev dependency. Project references across modules don't apply under the module model; each module builds alone. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [x] `@vsslicer/tooling` exports `tsconfig.base.json` with strict mode, `noUncheckedIndexedAccess` and `verbatimModuleSyntax` on; documented in `CONTRIBUTING.md`
- [x] The sample library and extension are TypeScript, extend the base config through their `@vsslicer/tooling` dev dependency, and build with `tsc` alone in their own folder
- [x] The tooling esbuild helper produces one `dist/extension.js` bundle per extension with `vscode` external
- [x] After a tooling version bump, `node scripts/run.mjs build --changed <ref>` rebuilds tooling and its dependents only (asserted from the runner output)

## Tasks

- [x] Write the base config and the esbuild helper in `modules/tooling`
- [x] Convert the sample modules to TypeScript
- [x] Document how to add a module

## Progress

Done. Code is in `vsslicer/` (read "repository root" as `vsslicer/`).

- `@vsslicer/tooling` 0.2.0 (the bump-rule demonstration): `tsconfig.base.json` (strict, noUncheckedIndexedAccess, verbatimModuleSyntax, erasableSyntaxOnly, NodeNext, ES2023, `.ts` import extensions rewritten by tsc) exported as `@vsslicer/tooling/tsconfig.base.json`; bin `vsslicer-bundle` (esbuild: node, cjs, `vscode` external, sourcemap) to `dist/extension.js`. esbuild 0.28.2 is a tooling dependency; typescript 7.0.2 is a pinned devDependency of each consumer (so `tsc` is on its PATH). Old placeholder `src/index.js` removed.
- `@vsslicer/example` and `@vsslicer/example-extension` converted to TypeScript and bumped to 0.2.0 (published files changed; nothing was ever released outside the local registry, so I kept both at 0.2.0 for consistency, extension depends on `@vsslicer/example ^0.2.0`, both on tooling `^0.2.0`). Library: ESM, `build` = `tsc` (dist + .d.ts). Extension: `build` = `tsc && vsslicer-bundle`, stays CommonJS with module Preserve/Bundler (reason in notes); VS Code API only in `src/presentation/extension.ts`; `@types/vscode` 1.100.0 (engines minimum). Tests are `.ts` run by `node --test` via type stripping; vitest stays PLT-8.
- Verified: bundle contains `require("vscode")` once and the inlined `@vsslicer/example` code; criterion 4 shown in a scratch git copy (output in the notes file): tooling change rebuilds tooling, example, example-extension; an example-only change skips tooling. Lockfile rule followed (fresh registry, publish order, regenerated lockfiles, `--frozen-lockfile` with empty store per module); final from-scratch `scripts/registry.sh start && node scripts/run.mjs ci` green, runner tests 6/6, registry stopped.
- Side fixes: `run.mjs` retries the registry fetch (intermittent keep-alive "other side closed" during ci); pnpm 11 needs `allowBuilds: {esbuild: false}` in each module's `pnpm-workspace.yaml`. A bin main-guard bug (silent no-op via symlink) was found and fixed with a test.
- Not done / caveats: library tests are not type-checked (only the extension's `tsc` includes `test/`); the retry in run.mjs has no unit test (network code).
- Files: CONTRIBUTING.md; vsslicer/scripts/run.mjs; vsslicer/modules/tooling/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml,CHANGELOG.md,tsconfig.base.json,bin/vsslicer-bundle.mjs,test/bundle.test.mjs} (src/ and old test removed); vsslicer/modules/example/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml,CHANGELOG.md,tsconfig.json,src/index.ts,src/domain/greeting.ts,test/greeting.test.ts} (old .js removed); vsslicer/modules/example-extension/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml,CHANGELOG.md,tsconfig.json,src/presentation/{commands,extension}.ts,test/extension.test.ts} (old .js removed); .reference/notes/PLT-3-typescript-esbuild.md.
