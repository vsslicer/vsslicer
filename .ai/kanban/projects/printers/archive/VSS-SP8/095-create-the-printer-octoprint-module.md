---
id: 95
title: Create the `printer-octoprint` module
type: chore
priority: P0
effort: S
model: sonnet
area: [octoprint]
story: US20
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Scaffold `vsslicer/modules/printer-octoprint/` from the `tooling` module, so later cards add code in layers.

**Code:** `vsslicer/modules/printer-octoprint/` (module: `printer-octoprint`, layer: `n/a (module scaffold)`)

## Acceptance criteria

- [x] `cd vsslicer/modules/printer-octoprint && pnpm install && pnpm test && pnpm build` works alone inside the module (package `@vsslicer/printer-octoprint`, own lockfile, changelog, version 0.0.1)
- [x] `domain/ application/ adapters/ presentation/` folders exist as needed; the layer-boundary lint is on and one deliberate violation fails it
- [x] `node scripts/run.mjs ci` picks the module up

## Tasks

- [ ] Create the module from the tooling template
- [ ] Add package.json, tsconfig, lint and vitest config
- [ ] Add a smoke test and the CI job entry

## Progress

Not started.

- PRN-scaffold-a-worker: scaffolded from modules/profiles. 3 tests, lint and build pass alone; `run.mjs checks` passes. Deviations: version 0.0.0 not 0.0.1 (0.0.0 modules are skipped by publish); only domain/ and application/ folders; no dependency on printer-api (unreleased 0.0.0, ci refuses it). Nothing for the coordinator to add to existing files.

- Review (sp8-reviewer-5, 07:39): PASS. Copied to scratch without node_modules/dist: pnpm install, test (3 pass), lint, build all green standalone. Layer violation test (domain importing application) fails the lint with boundaries/dependencies. Files match profiles config byte for byte; name, description, README, changelog are module-specific with no profiles content; LICENSE present; .npmrc points @vsslicer at localhost:4873; listed by `run.mjs install --list`. Accepted deviations (0.0.0, no printer-api dep, domain/application only) noted. run.mjs checks passes.
