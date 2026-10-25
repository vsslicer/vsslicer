---
id: E65
title: Drive the PrusaSlicer CLI and write binary G-code
status: draft
initiative: I10
project: SLC
order: 9
depends_on: [E26, E27, E29, E30, E12, E13, E3]
rows: ["§7 Binary G-code (`.bgcode`) output"]
---

Adds the PrusaSlicer CLI as a third engine adapter, 2.9.x first and 3.0 once stable, which brings binary G-code output for Prusa printers and completes the Prusa-only features of the capability matrix (pressure equalizer, ramping travels, regex substitution natively). It is for Prusa printer owners whose profiles come from upstream Prusa bundles (D4).

## Scope

In:
- Adapter in `vsslicer.slicer` for PrusaSlicer 2.9.x CLI (INI config via `--load`) and, behind a setting, 3.0 (`--load` JSON, preset names with `--datadir`, `--export-config-schema` to drive the capability table; `slicing-engine-embedding.md` §1).
- The exit-code bug: PrusaSlicer 3.0 returns 0 when slicing fails; success requires the output file to exist, parse, and stderr to carry no error line (ENG §5). No progress output; indeterminate progress.
- Forced preset update prompt: run with a private `--datadir` so the 30 s preset-update gate cannot block slicing.
- Emission of Prusa INI or JSON from `ProfileStore.resolve(...).native("prusa")` (E13).
- `.bgcode` output through `binary_gcode`; our output assembler (E27) injects thumbnails before conversion or uses the engine's own thumbnail blocks; E3 reads the result.
- Capability table and effect tests for the Prusa column of E30's rows; E64's regex step switches off when Prusa applies `gcode_substitutions` itself.

Out: Prusa Connect or PrusaLink upload (PRN), SLA (E67), SuperSlicer as a separate adapter (it would reuse this adapter with a different binary; not planned).

## Feature-matrix rows

- §7 Binary G-code (`.bgcode`) output (P2): done when `.bgcode` produced through this adapter is parsed by `@vsslicer/gcode` with the same moves as the text output of the same slice, and thumbnails are present.

## Acceptance criteria

- [ ] Every failure path detected despite exit 0: missing output, empty output, stderr error line; one test per case with recorded stderr (regression: a failed slice reported as success)
- [ ] Fixture slices on pinned 2.9.x in CI on three platforms; parser layer count and roles as in I5
- [ ] `.bgcode` versus text G-code move equality on fixtures (oracle: E3 parsing both)
- [ ] Capability table generated from `--export-config-schema` (3.0) matches the hand-maintained table (2.9.x) for shared keys
- [ ] Fixtures only (D5: no Prusa hardware)

## Dependencies

- Needs E26, E27, E29, E30, E12 and E13 (Prusa importer and native export), E3 (`.bgcode` reader).
- Exposes a third `SlicerEngine`, and the Prusa oracle runs E64 needs for regex substitution.

## Risks and spikes

- Spike: PrusaSlicer 3.0 CLI stability and whether a non-GUI build or published release appears (ENG open questions); decides when 3.0 replaces 2.9.x as the default.
- Risk: Prusa profile repositories are fetched from upstream, not bundled (D4); CI caches a pinned fetch.

## Eng review

- Scope challenge: kept as one adapter epic of about two to three sprints; binary G-code is its only owned row because the other Prusa features are cells in E30's and E64's rows.
- Explicit over clever: success is defined by output validation, not exit code, for this engine only, recorded in its adapter rather than in the shared interface.
