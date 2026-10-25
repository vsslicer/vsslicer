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
- [x] One `.gcode.3mf` sliced for the H2C in Bambu Studio is in the corpus (version recorded)
- [x] A PrusaSlicer `.bgcode` and `.gcode` twin pair is present

## Tasks

- [ ] Slice the fixtures with the installed slicers (ask on the board with `board.py ask` if a slicer is missing)
- [x] Keep files small; use the fixture storage PLT sets up
- [x] Write the manifest and the golden harness
- [x] Add a script to regenerate goldens

## Progress

Module `vsslicer/modules/gcode-parser` (fixtures, manifest, goldens, test support only; no src or version change). "Repository root" for tooling read as `vsslicer/`.

Done:
- Harness (criterion 2) and the PrusaSlicer `.bgcode`/`.gcode` twin pair (criterion 4), earlier.
- Criterion 3 (Q10): owner-exported `bambu-studio/h2c-cube.gcode.3mf` and `h2c-cube.3mf` recorded in manifest.json (Bambu Studio 02.08.02.61, H2C 0.6 nozzle, source `exported`) and bambu-studio/PROVENANCE.md; size+hash goldens; manifest type gained format `3mf`.
- Q9 (no installs): searched the cloned repos and the upstream GitHub trees (Cura, CuraEngine, SuperSlicer, PrusaSlicer, libbgcode) with `gh api`; none carries Cura/SuperSlicer samples. Added two GPL-3.0 third-party files (kageurufu/preprocess_cancellation, commit 44140d6): `cura/cube-cylinder-4.10.0.gcode` (Cura 4.10.0) and `superslicer/superslicer-2.3.56-arcwelder.gcode` (SuperSlicer 2.3.56, ArcWelder post-processed, so G2/G3). Headers checked; PROVENANCE.md per folder. Corpus now 15 files.
- Those two files expose parser gaps (SuperSlicer 2.3 role names give `unknown-role`; Cura has no config block, `;LAYER:` layers). The line-scan tests in tags/metadata/summary skip them through `lineScannable` (test/support/golden.ts) until the parser cards cover them; the golden harness covers them. Search details in .reference/notes/GCP-2-golden-corpus.md.
- Verified: `pnpm golden:update`, `pnpm lint`, `pnpm test` (243 pass), `pnpm build`, `node scripts/run.mjs checks` (check-fixtures passes).

Not done (criterion 1 stays unticked; pending in manifest.json): PrusaSlicer 20 mm cube and a multi-material sample under the cap (only the 12 MB upstream file), SuperSlicer cube / multi-material / arcs off, Cura multi-material, Bambu Studio multi-material (CLI limit). Orca has cube, multi-material and arcs on/off.

Files (under vsslicer/modules/gcode-parser/): test/fixtures/manifest.json, test/fixtures/bambu-studio/{h2c-cube.gcode.3mf,h2c-cube.3mf,PROVENANCE.md}, test/fixtures/cura/*, test/fixtures/superslicer/*, test/golden/** (4 new, others rewritten by parser cards' summariser), test/support/golden.ts, test/{tags,metadata,summary}.test.ts (use `lineScannable`). Also .reference/notes/GCP-2-golden-corpus.md.
