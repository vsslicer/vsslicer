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
depends_on: [2]
created: 2026-10-25
---

Module: `tooling` (shared build config; no layers). One `tsconfig.base.json` and a shared esbuild helper that bundles an extension for node (the browser target is added by E48), published in `@vsslicer/tooling` and consumed by every module as a dev dependency. Project references across modules don't apply under the module model; each module builds alone. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [ ] `@vsslicer/tooling` exports `tsconfig.base.json` with strict mode, `noUncheckedIndexedAccess` and `verbatimModuleSyntax` on; documented in `CONTRIBUTING.md`
- [ ] The sample library and extension are TypeScript, extend the base config through their `@vsslicer/tooling` dev dependency, and build with `tsc` alone in their own folder
- [ ] The tooling esbuild helper produces one `dist/extension.js` bundle per extension with `vscode` external
- [ ] After a tooling version bump, `node scripts/run.mjs build --changed <ref>` rebuilds tooling and its dependents only (asserted from the runner output)

## Tasks

- [ ] Write the base config and the esbuild helper in `modules/tooling`
- [ ] Convert the sample modules to TypeScript
- [ ] Document how to add a module

## Progress

Not started.
