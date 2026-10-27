---
id: 79
title: "Extend the golden corpus to PrusaSlicer, SuperSlicer, Cura and Bambu multi-material"
type: chore
priority: P2
effort: S
model: sonnet
area: [parser]
story: US1
milestone: "VSS:M7"
owner: GCP-79-worker
depends_on: [2, 10]
created: 2026-10-25
---

Module: `gcode-parser` (test fixtures). Module model: `.ai/instructions.md` "Architecture rules" and D12.

The rest of GCP-2's corpus, pushed to a much later sprint by the owner (Q11: "focus on Bambu/Orca style G-code for now"). Needs the slicers installed or GUI exports from the owner (Q9 said don't install for SP2).

## Acceptance criteria

- [ ] PrusaSlicer: a 20 mm calibration cube and a multi-material (MMU) sample under 5 MB, arc fitting on and off, generating version recorded
- [ ] SuperSlicer: a calibration cube and a multi-material sample, arcs off (the current sample is ArcWelder post-processed)
- [ ] Cura: a multi-material sample
- [ ] Bambu Studio: a multi-material sample (the CLI can't slice multi-extruder; GUI export)
- [x] GCP-10's arc checks run on the PrusaSlicer arc-fitted fixture; goldens regenerated and cross-checked

## Tasks

- [ ] Ask the owner for the slicers or GUI exports
- [x] Add fixtures with PROVENANCE.md and manifest entries (the one available)
- [x] Regenerate and cross-check goldens

## Progress

Partly done; four of five criteria need input only the owner can give. Not published (fixtures only; CHANGELOG under Unreleased).

- Added `prusaslicer/test_arcs_ps2.9.0-alpha1.gcode` (PrusaSlicer `resources/test_data/test.gcode` from the local clone @30ef591, 3.7 MB, 2.9.0-alpha1, MINI, `arc_fitting = emit_center`, 10,808 G2/G3 lines). Manifest entry, PROVENANCE row, golden, and it joins the GCP-10 arc checks in `test/arc-fixtures.test.ts` (criterion 5 met; the independent move-count cross-check in `golden.test.ts` passes on it). Manifest `pending` for PrusaSlicer updated.
- Not done, unticked: PrusaSlicer 20 mm cube and MMU sample with arcs on/off; SuperSlicer cube and MMU, arcs off; Cura MMU; Bambu Studio MMU. PrusaSlicer, SuperSlicer and Cura are not installed, no upstream sample is within the 5 MB cap (GCP-2 search: `.reference/notes/GCP-2-golden-corpus.md`), and the Bambu CLI cannot slice multi-extruder. Nothing was downloaded. Needs the owner: GUI exports (or installing the slicers) for those four.
- Verified: `pnpm golden:update` (other goldens unchanged), `pnpm lint`, `pnpm test` (333 pass).
- Files (vsslicer/modules/core/gcode-parser): test/fixtures/prusaslicer/test_arcs_ps2.9.0-alpha1.gcode, test/fixtures/prusaslicer/PROVENANCE.md, test/fixtures/manifest.json, test/golden/prusaslicer/test_arcs_ps2.9.0-alpha1.gcode.json, test/arc-fixtures.test.ts, CHANGELOG.md.

Review passed (criterion 5); criteria 1-4 wait on owner slicer exports. (GCP-79-reviewer, 00:16; re-added by the coordinator after a stray-file cleanup deleted it.)

**Moved to M7 (Owner setup) at SP9 (sp9-coordinator):** owner answer Q19 ("Defer this to a later stage"): the fixture projects the owner exports from the slicers are deferred, so this card leaves the sprints.
