---
id: 44
title: "Implement ProfileStore get, list, query and the index"
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US20
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [38, 135, 136]
created: 2026-10-25
---

The in-memory index over entities by id, kind, vendor and compatibility, with a `ProfileFiles` port (file system and in-memory) and identity from `id`, never from file names.

**Code:** `vsslicer/modules/profiles/src/application/store/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [x] `get`, `list` and `query` return the expected entities from the in-memory port, including a vendor tree of 14 420 entities
- [x] Two files with the same `id` give a diagnostic and the one in the user layer wins
- [x] Renaming a file does not change an entity's identity (test)

## Tasks

- [x] Define the port and the index
- [x] Implement get/list/query
- [x] Tests

## Progress

Done. Files: vsslicer/modules/profiles/src/application/store/{profile-store.ts,index.ts}, test/profile-store.test.ts.
Port `ProfileFiles.read()` returns entries {path, layer user|bundled, kind, entity}; `createProfileStore(files)` gives load/get/list/query over Maps (by id, vendor, external_id). Identity is entity.id only. Compatibility is not indexed: ProfileQuery (profile-api) has only vendor and external_id; compatibleMaterials/Processes belong to the resolver cards.
Bounds: 200 000 entities, id at most 256 chars (exact-cap tests); Maps, `__proto__`/`constructor` tested. Duplicate-id diagnostic uses code 'invalid-json' (shortcut, DiagnosticCode has no store code).
Probes (each made the named test fail, then restored): criterion 1 (14 420 tree): vendor+external_id filter replaced by one index; vendor-entity self-index removed; criterion 2: user-first sort removed, duplicate branch disabled; criterion 3 (rename): none, the test passes by construction since the path is never read as identity; entity cap >= to >; id cap > to >=.
Verify: pnpm lint, build, test (57 passed, 7 files), `node scripts/run.mjs checks` ran clean. CI gate platform: nothing path-dependent.
Release lines:
CHANGELOG: Add the in-memory profile store (get, list, query, ProfileFiles port) with user-layer precedence on duplicate ids.
src/application/index.ts: export * from './store/index.ts';

**Review passed (sp12-rev-prf-44)**

Ran in `vsslicer/modules/profiles`: `pnpm install` ok; `pnpm build` ok; `pnpm test` 76 of 77 passed, the one failure
(`test/adapters/worker/run-import-in-worker.test.ts`, worker crash) and the one lint error (`budget` unused,
plus prettier, in `src/adapters/worker/run-import-in-worker.ts`) are in PRF-39's uncommitted worker files, not this
card. This card's files alone: eslint and prettier clean, `tsc -p tsconfig.test.json` no errors in them, 
`vitest run test/profile-store.test.ts` 8 of 8; `node scripts/run.mjs checks` exit 0.

Mutation probes on `src/application/store/profile-store.ts` (each restored, diff empty afterwards), every one failed
at least one test:
1. Criterion 3 (rename): id taken from the file name instead of `entity.id`: 6 tests fail, the rename test included.
2. Criterion 2: user-first sort removed: 1 fails; duplicate branch disabled (`winner && false`): 1 fails.
3. Criterion 1: vendor self-index removed: 1 fails; `vendor`+`external_id` intersection replaced by `external_id`
   alone: 1 fails.
4. Bounds: entity cap `>=` to `>`: 1 fails; id cap `>` to `>=`: 1 fails. Both tests assert the exact cap
   (`MAX_STORE_ENTITIES` loaded of `MAX+1`; a 256-char id kept, 257 refused).
5. `__proto__`/`constructor`: `get` rewritten over a plain object: 1 fails.
6. Unreadable port keeps the old index: index cleared before `read()`: 1 fails.

Hostile inputs read in code: null entity, non-string id, non-string vendor, non-object `external_ids` are all
refused or skipped without throwing; Maps throughout. Layering: application only, imports `@vsslicer/profile-api`
and the module's own `../import/registry.ts`; no VS Code, no I/O. Expected values in tests are computed from the
fixture (721 = 14 420 / 20 for v3), not read from the code.

Notes, not blocking:
- The card text promises a file-system `ProfileFiles` and a compatibility index; neither is here. Both have their
  own cards (PRF-45 file-system store, PRF-50 compatibleMaterials/Processes), and `ProfileQuery` has no
  compatibility field, so this card's scope is right.
- Refused entries each add one diagnostic, so a port returning far more than 200 000 entities gives one diagnostic
  per extra entry. Worth folding into one summary diagnostic (as `MAX_IMPORT_FILES` does) when PRF-45 adds a real
  port.
- `query` with both `vendor` and `external_id` filters with `Array.includes` (O(n*m)); fine at today's sizes.
- Release line for `src/application/index.ts` is not applied yet (coordinator's shared file).
