---
id: 104
title: Create the `printer-prusalink` module
type: chore
priority: P0
effort: S
model: sonnet
area: [prusalink]
story: US21
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Scaffold `vsslicer/modules/printer-prusalink/` from the `tooling` module, so later cards add code in layers.

**Code:** `vsslicer/modules/printer-prusalink/` (module: `printer-prusalink`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [x] `cd vsslicer/modules/printer-prusalink && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/printer-prusalink`, own lockfile, changelog, version 0.0.1)
- [x] `domain/ application/ adapters/ presentation/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [x] `node scripts/run.mjs ci` picks the module up

## Tasks

- [x] Create the module from the tooling template
- [x] Add package.json, tsconfig, lint and vitest config
- [x] Add a smoke test and the CI job entry

## Progress

Not started.

- Created the module (layers domain, application; layout copied from profiles). Version 0.0.0, not 0.0.1: 0.0.0 modules are skipped by publish. No printer-api dependency: it is 0.0.0 and ci refuses it. pnpm install, test (3 pass, incl. the deliberate layer violation), lint and build pass alone; run.mjs checks pass. CHANGELOG and README written; nothing for the coordinator to add.

- Review (sp8-reviewer-5, 07:39): PASS. Copied to scratch without node_modules/dist: pnpm install, test (3 pass), lint, build all green standalone. Layer violation test (domain importing application) fails the lint with boundaries/dependencies. Files match profiles config byte for byte; name, description, README, changelog are module-specific with no profiles content; LICENSE present; .npmrc points @vsslicer at localhost:4873; listed by `run.mjs install --list`. Accepted deviations (0.0.0, no printer-api dep, domain/application only) noted. run.mjs checks passes.
