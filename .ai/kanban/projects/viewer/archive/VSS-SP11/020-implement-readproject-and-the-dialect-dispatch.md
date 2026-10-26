---
id: 20
title: Implement readProject and the dialect dispatch
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US7
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [13, 17]
created: 2026-10-25
---

Detects the dialect and dispatches to its reader; any reader that fails or is disabled falls back to core model plus preserved parts.

**Code:** `vsslicer/modules/3mf/src/application/readProject.ts` (module: `3mf`, layer: `application`)

## Acceptance criteria

- [x] `readProject(pkg)` returns a `Project` with `dialect` for every fixture
- [x] A disabled or failing dialect reader falls back to core plus preserved parts and says so in `Project.notices`
- [x] Unknown parts stay in the Project untouched

## Tasks

- [x] Dispatcher
- [x] Fallback and notices
- [x] Tests

## Progress

Done. Files: src/application/readProject.ts (createReadProject: detect, dispatch, fallback with notices), src/readProject.ts (default wiring, no dialect readers yet), src/domain/project/project.ts (+ optional `Project.notices`), test/readProject.test.ts.
Fallback: dialect `core`, core read + preserved (non-.model parts) + one notice naming the detected dialect and why (disabled / no reader / reader failed). Core-read errors propagate.
Mutation probes (all failed a test): disabled check removed; missing-reader check removed; core short-circuit removed; core.preserved dropped. Root-model exclusion was redundant (.model rule covers it), removed.
Verify: lint, build ok; 201 tests pass (13 files); `scripts/run.mjs checks` ok. CI gate platform: Linux (Node 24).
Release lines:
- CHANGELOG: `readProject(pkg)` dispatches on the detected dialect; a disabled, missing or failing dialect reader falls back to core plus preserved parts with `Project.notices`.
- src/index.ts: replace `readProject` in the resolveProject export line with `export { readProject } from './readProject.ts';` and add `export { createReadProject } from './application/readProject.ts'; export type { DialectReader, ReadProjectDeps } from './application/readProject.ts';`


**Review failed (sp11-rev-vwr-20)**
Ran in `vsslicer/modules/3mf`: `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test` 201/201 (13 files), `node scripts/run.mjs checks` exit 0. Layering ok: `src/application/readProject.ts` imports only domain; wiring in `src/readProject.ts`; index lines applied as the card says.
Mutation probes on `src/application/readProject.ts` (each restored after, file identical by `cmp`): disabled check removed, `...core.preserved` dropped, core short-circuit removed, reader error text dropped, `.model` filter made `true`: each fails 1 to 3 tests. Good.
Probe on all four `test/fixtures/real/*.3mf` through the public `readProject`: none throws; `pa_pattern` falls back to core with the Bambu notice and keeps its 8 non-model parts.

1. Unknown parts are dropped for every `core` package. `src/application/readProject.ts:37` (`if (dialect === 'core') return deps.readCore(pkg);`) returns the core read as is, and the core reader never fills `preserved`. Probe: `CubeDisplacement_oneside.3mf` reads with `preserved` empty, losing `3D/Texture/paperbag_mono.png` and `Metadata/thumbnail.png`; `booleans_operations.3mf` loses `Metadata/thumbnail.png`. Criterion 3 ("Unknown parts stay in the Project untouched") has no dialect qualifier, and `Project.preserved` is documented as the parts a save writes back. Rule: every path that does not go through a dialect reader keeps the parts the core read does not interpret; the core path does the same preserved merge as the fallback, without a notice. Add a test with a core package carrying a non-model part.
2. "Returns a Project with `dialect` for every fixture" is tested on 2 of the 4 real fixtures (`test/readProject.test.ts`, `describe('readProject on fixtures')`). Rule: iterate every `.3mf` in `test/fixtures/real` (readdir), so a new fixture is covered without editing the test; with fix 1, also assert that each fixture's non-model parts are in `preserved`.

**Rework (sp11-vwr-20-fix)**
Fix 1: `createReadProject` no longer short-circuits `core`; a core package takes the same core read plus non-`.model` parts as preserved, without a notice (src/application/readProject.ts). New test "a core package keeps its non-model parts".
Fix 2: fixture test now iterates every `.3mf` in `test/fixtures/real` (readdirSync) and asserts every non-model part is in `preserved`.
Mutation probe: core path returns `core` without the preserved merge: 3 tests fail (restored, 13/13 pass).
Verify: lint, build ok; 204 tests pass (13 files); `scripts/run.mjs checks` exit 0. CI gate platform: Linux (Node 24).
Release lines: unchanged from above (CHANGELOG line still accurate; add: a core package keeps its unknown parts in `preserved`).

**Review passed (sp11-rev2-vwr-20)**
Ran in `vsslicer/modules/3mf`: `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test` 204/204 (13 files), `node scripts/run.mjs checks` exit 0. Layering ok: `src/application/readProject.ts` imports domain only; adapters wired in `src/readProject.ts`; no cross-module imports; index lines applied as written.
Previous findings: 1 fixed (core path does the preserved merge, no notice; test "a core package keeps its non-model parts"). 2 fixed (fixture test iterates every `.3mf` in `test/fixtures/real` and checks every non-model part is preserved).
Mutation probes on `src/application/readProject.ts` (restored, `cmp` identical): core path returns `core` without merge (3 fail), core dialect sent to a reader (2 fail), disabled check removed (1 fail), missing reader returns core without notice (3 fail), `core.preserved` dropped (1 fail), `.model` filter made `true` (4 fail), error text dropped (1 fail).
Fixture probe through public `readProject`: CubeDisplacement keeps texture and thumbnail (2), booleans keeps thumbnail (1), pa_pattern falls back with the Bambu notice and keeps 8 non-model parts, production_ext keeps 0 (only models). No duplicates.
Non-blocking: dropping `.toLowerCase()` in the `.model` filter and dropping the dialect name from the notice's first clause pass all tests (the notice still names the dialect later). An unreferenced `.model` part is not preserved; the shortcut comment covers the opposite case only. Neither is a criterion.
