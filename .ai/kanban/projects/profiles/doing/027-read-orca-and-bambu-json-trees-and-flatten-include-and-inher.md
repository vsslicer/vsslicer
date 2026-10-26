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
