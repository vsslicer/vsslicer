---
id: I5
title: Slicing through external engines: the first end-to-end loop
status: approved
milestone: M3
order: 5
projects: SLC (with PRF emit, VWR thumbnails, PRN send)
phases: 5
---

## Problem

Until this lands VSSlicer can only view and send files sliced elsewhere. Writing a slicing engine is out of scope; driving the upstream ones is the fastest tested path (D2 makes bundling possible later).

## Outcome

`vsslicer.slicer`: detects an installed OrcaSlicer or downloads the upstream release, emits Orca preset JSON from `ProfileStore.resolve`, runs the CLI with typed exit codes, progress and cancel, moves output into `.vsslicer/sliced/`, injects thumbnails from `vsslicer.project`, and runs post-processing scripts as a VS Code task. A CuraEngine CLI adapter with our own settings resolution. Tasks and problem matchers for slice, upload and print. Open, slice, preview, print works end to end.

## Roadmap phases and feature-matrix rows

Roadmap phase(s) 5 (`.ai/plans/roadmap.md`). Rows (`docs/research/feature-matrix.md`): §2 all P0 and P1 rows (pass-through capability matrix per adapter); §7 External post-processing scripts, Placeholder macro language (engine side), `.gcode.3mf` sliced output, Thumbnails in G-code, Object labels and exclude object, Binary G-code output (Prusa adapter, I10); §1 is consumed through PRF.

## Exit criteria

- CI slices fixture models with fixture profiles through pinned Orca and CuraEngine releases; `@vsslicer/gcode` parses the result with the expected layer count and roles, and our time estimate is within tolerance of the engine's
- Cancel kills the process and leaves no partial output; every exit code maps to a user-visible error with a test
- Cura settings resolution matches the definitions' own `value` formulas on fixture tuples; emitted preset JSON snapshots match
- Spikes recorded: macOS quarantine and notarisation of downloaded engines, Orca progress text stability, CuraEngine headless contract
- A user slices a plate from a Bambu 3MF with an imported profile, previews it and sends it to the H2C

## Order: 5 of 11

Fifth because it needs I1 (preview), I2 (project model, thumbnails), I3 (profiles) and I4 (send). It closes the first complete loop, which is the first release worth announcing.

Order rationale follows the roadmap's rule: testability first (libraries checked against deterministic fixtures and external oracles), usability next (daily workflows on proven foundations), functionality last (breadth, optional engines, the fork).
