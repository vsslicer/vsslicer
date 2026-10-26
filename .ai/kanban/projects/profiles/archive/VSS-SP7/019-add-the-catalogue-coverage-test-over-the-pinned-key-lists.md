---
id: 19
title: Add the catalogue coverage test over the pinned key lists
type: feature
priority: P0
effort: M
model: sonnet
area: [schema]
story: US8
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-prf-19
depends_on: [18]
created: 2026-10-25
---

The regression guard that catches an upstream key silently dropped: every key in every pinned list is mapped or native-only.

**Code:** `vsslicer/modules/profile-api/src/domain/catalogue/` tests (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] Key lists pinned for Orca@09aa0114, Bambu@79df7ae, Prusa@b028299 and @30ef591, SuperSlicer@1f3d287, Cura@5bea2f8; the test fails when a key is unassigned (a deleted entry makes it red)
- [x] Zero unassigned keys; group counts match the table within the `hidden` allowance
- [x] Fixtures only (D5)

## Tasks

- [x] Check in the pinned key lists (names only, with PROVENANCE)
- [x] Write the coverage test
- [x] Write the group-count test

## Progress

Done: pinned key lists written once from the generators' own parsers by `tools/catalogue/keys.ts` into `test/fixtures/catalogue-keys/<dialect>.json` (orca 804, bambu 615, prusa 396, prusa3 415, superslicer 652, cura 762 keys; names only, each file records its commit). `test/catalogue-coverage.test.ts` fails when a listed key is named by no entry (`native.<dialect>.key`, a split conversion's `keys`, or a `tool.` prefixed Prusa 3.0 feature), proves red on a deleted SuperSlicer entry, and asserts from `data/groups.json` that shown plus hidden equals the key count per dialect (Prusa 3.0 adds its 30 hardware features, Cura 2 for the two split entries). Orca group counts vs the E11 table with the Orca deltas stay in PRF-18's catalogue-groups test; the other dialects' tables are approximations (see groups.json notes), so no per-group allowance is asserted for them.
Files: vsslicer/modules/profile-api/tools/catalogue/keys.ts, test/catalogue-coverage.test.ts, test/fixtures/catalogue-keys/*.json (6).
Verified: pnpm lint && pnpm test (21 files, 409 tests) && pnpm build all green.
Not done: PROVENANCE line for the key-list fixtures (shared file, see below).

### Coordinator: shared-file changes

PROVENANCE.md: add a line "test/fixtures/catalogue-keys/*.json: key names only, extracted by tools/catalogue/keys.ts from OrcaSlicer@09aa0114, BambuStudio@79df7ae, PrusaSlicer@b028299 (2.9) and @30ef591 (3.0), SuperSlicer@1f3d287 (AGPL-3.0), Cura@5bea2f8 (LGPL-3.0)". CHANGELOG: "Added: catalogue coverage test over pinned key lists."
Review (sp7-rev-prf1920): PASS. Ran vitest on catalogue-coverage + mappings (306 pass), eslint on the card files and tsc --noEmit clean. Fixture key counts orca 804 / bambu 615 / prusa 396 / prusa3 415 / superslicer 652 / cura 762, each with its pinned commit; shown+hidden asserted per dialect (orca 651+153=804 matches PRF-18's E11 test). Red proof uses the same unassigned() the real test uses on the committed lists; my probe deleting the Orca top_shell_layers entry also reported its key unassigned. Per-group table check left to PRF-18 (Orca), acceptable since other dialect tables are approximations. PROVENANCE line still pending for the coordinator.
