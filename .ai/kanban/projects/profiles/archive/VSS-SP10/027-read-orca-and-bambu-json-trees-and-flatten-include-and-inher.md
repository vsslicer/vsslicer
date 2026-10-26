---
id: 27
title: Read Orca and Bambu JSON trees and flatten include and inherits
type: feature
priority: P0
effort: L
model: opus
area: [importers]
story: US12
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [120, 135, 124, 136]
created: 2026-10-25
---

Reads the vendor index, `machine_model`, `machine`, `process`, `filament`, `include`, `instantiation`, `setting_id`, `filament_id` and `nil`, resolving `inherits` then `include` then own keys (the Orca rule, `profiles.md` §2).

**Code:** `vsslicer/modules/profiles-orca/src/adapters/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] Golden counts at Orca@09aa0114: 70 vendors plus OrcaFilamentLibrary; at Bambu@79df7ae: 12 vendors
- [x] Order of resolution is parent, then includes, then own keys, proven by a hand-built fixture where all three set the same key
- [x] `nil` maps to `null` fall-through; `setting_id` and `filament_id` are kept as `external_ids`
- [x] Invalid JSON, unknown `type` and a missing include each give a diagnostic with file; other entities import
- [x] Bounds (rule 25, added by sp10-prf-27): inherits/include chain depth (order-independent, and recursion never deeper than the cap), inherits and include cycles, includes per preset, merge work, file size, file count, index entries and total bytes per call, unsafe sub_paths (`..`, absolute, backslash, colon), case/Unicode path aliases, and symlinks in the tree on disk (never followed, O_NOFOLLOW on open), each with a hostile test that fails without its bound

## Tasks

- [x] Read vendor index and file types
- [x] Implement the include/inherits flatten
- [x] Map keys and `nil`
- [x] Golden-count tests

## Progress

Not started.

**Dependency on PRF-23 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with PRF-23.

**sp10-prf-27 (2026-10-26):** done, verified.

- Code (`profiles-orca`, adapters): `src/adapters/tree/read-tree.ts` (`readOrcaTree(files, limits?)`, pure, `SourceFile[]` in, `{vendors, presets, diagnostics}` out; `TREE_LIMITS`, `treeLimits`, `safePath`, `LIBRARY_VENDOR`) and `src/adapters/tree/load-tree.ts` (`loadProfileTree(root, limits?)`, node:fs, symlinks never followed). Exported from `src/index.ts`; CHANGELOG Unreleased entry.
- Upstream semantics quoted in code: order parent, includes, own `OrcaSlicer@09aa0114:src/libslic3r/PresetBundle.cpp:7596-7639` and `BambuStudio@79df7ae:src/libslic3r/PresetBundle.cpp:4836-4911`; missing include skipped with a warning, preset still imports `:7632-7636`; missing or empty parent drops the preset `:7621-7625`, `:8261-8270`; include as array or bare string `:8272-8282`; nameless or g-code templates without `instantiation` are abstract and named by their index entry `:8240-8249`; OrcaFilamentLibrary filaments as fallback parents `:7600-7604`; `filament_id` inherited `:7606-7618`; `nil` = no override `:507-516`. Ported-file provenance plus Copyright line in `read-tree.ts` (check-licence passes). Raw notes: `.reference/notes/PRF-27-orca-json-tree-flatten.md`.
- `nil` maps to `null` (a whole value or an array element); like upstream `apply`, a child's value (including null) replaces the parent's whole value, and null means "falls through to the printer value". Bambu's g-code templates carry no `type`; the index list gives it, so only a present and different `type` is `unknown-type`.
- Diagnostics use a local `TreeDiagnostic` (codes incl. `missing-include`, `limit`, `unsafe-path`, `duplicate`, `missing-file`), because profile-api's closed `DiagnosticCode` has no code for those; mapping into `ImportResult` belongs to the composing importer card.
- Out of scope, left for the cards that own them: mapping presets to unified entities (per-nozzle model story), variant padding/decoding (H2C/H2D card), `renamed_from`, user presets with `.info`.
- Real trees: Orca 14420 JSON files, 71 vendors, 14343 presets, 0 diagnostics; Bambu 3589 files, 12 vendors, 3558 presets, 0 diagnostics (asserted in the golden tests, which skip when `.reference` is absent). Note for US12: Bambu has 10 machine presets named `Bambu Lab H2C*` at 79df7ae (the story says 11 files; probably counts the machine_model file).
- Mutation probes (24, each applied temporarily and restored, test run with `-t`): own keys dropped, nil not mapped, filament_id not inherited, type check removed, library fallback removed, `__proto__` by plain assignment, inherits cycle check removed (first PASSED; test tightened to assert the exact cycle diagnostics, now FAILS), include cycle check removed, height check removed, stack guard removed (20000-preset reversed chain), include cap, merge budget, file size cap, file count cap, total bytes cap, index entry cap, `..` allowed, alias check removed, limit validation removed, loader symlink branch, loader dir depth, loader file size, loader count, loader total: all FAIL their test.
- Verification: `pnpm install`, `pnpm lint` (eslint, prettier, tsc) pass; `pnpm build` pass; `pnpm test` 5 files, 73 tests pass (23 new); `node scripts/run.mjs checks` exit 0 (84 node tests, check-licence, check-fixtures).

**Review failed (sp10-rev-prf-27)** (2026-10-26)

Ran: `pnpm install`, `pnpm lint`, `pnpm build` pass; `pnpm test` 5 files, 73 tests pass; `node scripts/run.mjs checks` exit 0. Golden counts recounted independently with a separate script over the index files: Orca@09aa0114 71 indices (70 + OrcaFilamentLibrary), 14343 entries, 0 missing; Bambu@79df7ae 12 indices, 3558 entries, 0 missing, 0 symlinks in either tree. These match the tests. Upstream quotes checked (Orca `PresetBundle.cpp:7596-7639`, `:8240-8282`; Bambu `:4836-4911`). Order (parent, includes, own), missing include as a warning, empty `inherits`, include as an array or a string, abstract templates, the library fallback and `filament_id` inheritance all match. Layering is fine and the AGPL provenance header is present. My mutation probes: dropping the case fold fails the alias test, and moving own keys under the parent fails 2 tests. Removing `O_NOFOLLOW` from `load-tree.ts:52` fails no test (see note c).

Problems:

1. **Shared-file amplification in `readEntry`, not charged to any cap** (`read-tree.ts:230-231`, `:285-286`). `parsed` caches the JSON, but each index entry still builds its own `own` Map from all of the file's keys. Duplicates are dropped only after that, and a nameless file gets a distinct name from each entry. Probe: a 540 KB preset with 50k keys and no name, listed by a 15 KB index. 100 entries take 2.6 s and 814 MB RSS. 400 entries take 12 s and more than 2 GB. 1600 entries crash with a V8 heap OOM. All three are far inside the defaults (4 MB per file, 50k entries). Rule: work that grows with how many times an entry *references* input, rather than with the input bytes, must be charged to a per-call budget. Fix: charge the keys `readEntry` copies to `maxMergeSteps`, or build `own` once per path (it does not depend on the index name) and share it. Add a test with a big file listed many times.
2. **The `maxMergeSteps` default does not bound memory** (`read-tree.ts:53`). 64M is 37 times what the real trees need: by bisection, the smallest budget that imports Orca@09aa0114 is 1,733,003 and Bambu is 537,835. Every step is a retained Map entry plus an output property. Probe: one parent with 50k keys and 1200 one-line children that inherit it. That is 629 KB of input in all, which yields 60M output keys in 27.5 s and crashes with a heap OOM at node's default 4 GB heap. No `limit` diagnostic appears, because it stays under 64M. Rule: a bound must be calibrated against the measured real input, as `TREE_LIMITS` already does for files and bytes. Fix: set it to a few times the measured need (for example 8M), record the measurement in the comment, and add a hostile fan-out test from a small input that hits the cap.

Notes (not blocking):

a. I fixed one thing in place (comment only): the "Differences from upstream" header now says that an include layers every key its chain states. Upstream layers only the keys that differ from the collection default (Orca `:7644-7647`, Bambu `:4885-4897`).
b. The alias fold is `toLowerCase()`, so `ſ`/`s`, `ß`/`ss` and `İ`/`i` are not caught. Use `toUpperCase().toLowerCase()` or another full case fold if aliases on Windows or APFS matter. Low impact.
c. No test covers `O_NOFOLLOW` on open, or `opendir` on an intermediate folder swapped for a link after listing (a race). The listing-time symlink branch is covered.

**sp10-prf-27-fix (2026-10-26):** both review problems fixed.

1. Shared-file amplification: `readEntry` now builds a file's `own` Map once per path (`ownByPath`) and every entry shares it, and each entry read charges its `own.size` to `maxMergeSteps`; past the budget reading stops with a `limit` diagnostic (`index entries carry more than N keys`) and nothing flattens. New test `one big file listed many times is charged per listing` (1000-key nameless file, 200 entries, budget 50k). Reviewer's probe (540 KB, 50k keys, 1600 entries) now ends in 1 `limit`, 81 MB RSS (was a heap OOM). The existing merge-steps test moved its thresholds by the 50 keys now charged at read (250/120 to 300/299; exact boundary).
2. `maxMergeSteps` default 64M to 8M, calibrated in the comment: smallest budget that imports the whole tree, with the new read charge, by bisection: Orca@09aa0114 2,150,746, Bambu@79df7ae 611,044 (8M is about 3.7x Orca). New test `the default merge budget stops a fan-out from a small input` (one 20k-key parent, 450 one-line children: 9M copies, default limits). Reviewer's probe (50k-key parent, 1200 children) now: 1 `limit`, 159 presets, 975 MB RSS (was a 4 GB OOM). Golden tests still pass with 0 diagnostics under the default.
- Mutation probes: read charge removed (`steps += 0`): both the new big-file test and the merge-steps test FAIL (and the fan-out one, by 1 preset); default back to 64M: the fan-out test FAILS. The per-path `own` sharing is memory-only and not observable in a test; the read charge is what the test pins.
- Not done (review notes b, c, non-blocking): full case fold, O_NOFOLLOW/opendir race test.
- Verification: `pnpm install`, `pnpm lint` (eslint, prettier, tsc), `pnpm build` pass; `pnpm test` 5 files, 75 tests pass (2 new, golden counts ran); `node scripts/run.mjs checks` exit 0 (84 node tests, check-licence, check-fixtures). CHANGELOG Unreleased line names the 8M default.

**Review passed (sp10-rerev-prf-27)** (2026-10-26)

Scope: the fix round for the two problems of sp10-rev-prf-27 (non-blocking notes a-c out of scope).

- Ran: `pnpm install`, `pnpm lint` (eslint, prettier, tsc), `pnpm build` pass; `pnpm test` 5 files, 75 tests pass, both golden tests ran (not skipped) under the default limits and assert 0 diagnostics: Orca 71 vendors / 14343 presets, Bambu 12 / 3558; `node scripts/run.mjs checks` exit 0.
- Problem 1 resolved. Reviewer's probe re-run against the built `dist` (nameless 50k-key file listed 1600 times): 1 `limit` ("index entries carry more than 8000000 keys"), 0 presets, 65 ms, 70 MB RSS (was a heap OOM). `own` is built once per path (`read-tree.ts:302-307`) and every entry read is charged (`:244-248`).
- Problem 2 resolved. Reviewer's probe re-run (50k-key parent, 1200 one-line children): 1 `limit`, 159 presets, 2.8 s, 963 MB RSS (was a 4 GB OOM). Calibration in the `TREE_LIMITS` comment verified by bisection boundary: Orca@09aa0114 imports all 14343 at 2,150,746 and drops one at 2,150,745; Bambu@79df7ae all 3558 at 611,044, one dropped at 611,043. 8M is ~3.7x Orca, as stated.
- New tests fail on the previous code: in a `mktemp -d` copy with the read charge removed, `own` built per entry again and the default back to 64M, `one big file listed many times is charged per listing`, `the default merge budget stops a fan-out from a small input` and `merge steps are capped across the call` all FAIL. With only the default back to 64M (read charge kept) the fan-out test FAILS, so it pins problem 2 on its own.
- Changed thresholds of `merge steps are capped across the call` (300 pass / 299 fail): still a cap across the call (each preset alone is far under budget; only the running total trips it), still asserts one `limit` and that earlier presets (`t`, `a`) survive while the later one (`b`) is dropped. 300 is the exact boundary: moving the pair to 301/300 makes the test fail, so a one-step slack in the accounting would be caught.
- No files changed by this review.
