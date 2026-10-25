---
id: 2
title: Check in the golden corpus and the golden-JSON harness
type: chore
priority: P0
effort: L
model: sonnet
area: [parser]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-2-worker
depends_on: [1]
created: 2026-10-25
---

Module: `gcode-parser` (test fixtures and golden harness); the corpus lives in `modules/gcode-parser/test/fixtures`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

The fixtures and oracle every parser, planner and renderer test uses.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] Calibration cube and a multi-material sample from PrusaSlicer, SuperSlicer, Orca, Bambu Studio and Cura, arc fitting on and off where available, are checked in with generating slicer and version recorded in a manifest
- [x] A harness writes and compares golden JSON per file through an injectable summariser; a vitest run fails on a difference. The golden fields grow with the parser: move count (GCP-3), layer count and role histogram (GCP-4), labels and thumbnails (GCP-7), summary (GCP-8), each card's own criterion
- [ ] One `.gcode.3mf` sliced for the H2C in Bambu Studio is in the corpus (version recorded)
- [x] A PrusaSlicer `.bgcode` and `.gcode` twin pair is present

## Tasks

- [ ] Slice the fixtures with the installed slicers (ask on the board with `board.py ask` if a slicer is missing)
- [x] Keep files small; use the fixture storage PLT sets up
- [x] Write the manifest and the golden harness
- [x] Add a script to regenerate goldens

## Progress

Coordinator: criterion 2 reworded (its fields need parsers that later cards build; the harness itself is done). Blocked on the owner: Q9 (install PrusaSlicer, SuperSlicer, Cura) for criterion 1, and an H2C `.gcode.3mf` exported from the Bambu Studio GUI for criterion 3 (Q10), because Bambu Studio 02.08.02.61's CLI cannot slice for multi-extruder printers. GCP-3 onward proceed on the corpus as it stands.


Module `vsslicer/modules/gcode-parser` (`@vsslicer/gcode-parser` 0.1.0), published to the local registry. "Repository root" for tooling read as `vsslicer/`; the corpus is under the module (`test/fixtures`), not a separate fixtures store.

Done:
- Corpus, 11 files, 2.7 MB: OrcaSlicer 2.5.0-dev (generic Marlin cube; X1C-profile cube, two-material sample with prime tower, cylinder with arc fitting on and off), Bambu Studio 02.08.02.61 (X1C cube, cylinder arcs on and off), PrusaSlicer 2.8.1 mini cube `.gcode` + `.bgcode` twin pair (libbgcode commit d4da907) and the 2.9.0-alpha1 vase. `test/fixtures/manifest.json` records slicer, version, printer, model, material, arc fitting, source; `PROVENANCE.md` per folder. Arc fitting is exercised on a cylinder (a cube has no curves).
- `scripts/slice-fixtures.sh` (+ `make-model.mjs`, `flatten-profile.mjs`) regenerates the Orca and Bambu Studio files from generated STLs.
- Harness: `test/golden.test.ts` compares a summary of every file with `test/golden/<file>.json` (injectable `Summariser`, `test/support/golden.ts`); `pnpm golden:update` rewrites them. Fields are interim (bytes, sha256, line count, G0-G3 counts, layer-change markers, thumbnail blocks); GCP-3/4/7/8 swap in move count, layer count, role histogram, labels, thumbnails, summary. Proven: changing a golden value fails the run (`g1: 1` vs 5944), reverted.
- Verified: `pnpm lint`, `pnpm test` (15 pass), `pnpm build`, published 0.1.0, `pnpm install --frozen-lockfile --store-dir <empty>` then test, build, lint. Registry left running.

Not done (criteria left unticked):
- Criterion 1: no PrusaSlicer/SuperSlicer/Cura cube or multi-material samples (not installed, board question Q9; their repos carry no usable sample G-code besides the PrusaSlicer files above); no Bambu Studio multi-material file.
- Criterion 2: harness works but its fields are the interim ones above.
- Criterion 3: the H2C `.gcode.3mf`. Bambu Studio 02.08.02.61's CLI cannot slice for the H2C ("Some filaments cannot be mapped to correct extruders"), many workarounds tried, see `.reference/notes/GCP-2-golden-corpus.md` and the manifest `pending`. Needs an H2C project exported once from the Bambu Studio GUI (owner) or a CLI fix.
- Fixtures size/PROVENANCE check (PLT-13) not run: tooling has none yet; files are all under 0.5 MB and every folder has PROVENANCE.md.

Files (repo-relative, all new, under vsslicer/modules/gcode-parser/): package.json, pnpm-lock.yaml, pnpm-workspace.yaml, .npmrc, .prettierignore, eslint.config.mjs, tsconfig.json, tsconfig.test.json, vitest.config.ts, LICENSE, CHANGELOG.md, src/index.ts, scripts/{make-model.mjs,flatten-profile.mjs,slice-fixtures.sh,update-golden.ts}, test/golden.test.ts, test/support/{golden.ts,interim-summary.ts}, test/fixtures/manifest.json, test/fixtures/{orca,bambu-studio,prusaslicer}/ (PROVENANCE.md and the 11 fixtures), test/golden/** (11 JSON). Also .reference/notes/GCP-2-golden-corpus.md.

Commands: `cd vsslicer/modules/gcode-parser && pnpm install && pnpm lint && pnpm test && pnpm build`; regenerate: `scripts/slice-fixtures.sh && pnpm golden:update`.
