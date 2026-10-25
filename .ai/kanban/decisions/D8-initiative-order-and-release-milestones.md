---
id: D8
title: Initiative order I1-I11 and release milestones M1-M6
status: proposed
date: 2026-10-25
cards: [19]
---

## Context

The owner wants the order of initiatives, then epics, so sprints can be planned, with the goal of
feature parity with PrusaSlicer, OrcaSlicer/Bambu Studio and Cura. The roadmap orders work
testability first, usability next, functionality last. D2 (AGPL) and D3 (Bambu first) changed two
things since the roadmap: porting is allowed, and the Bambu adapter leads the printers work.

## Decision (proposed)

```
 M1 Preview     I1  G-code preview, simulation, foundations        PLT, GCP   -> 2026-12-20
 M2 Open        I2  3MF library and model viewer (read-only)       VWR        -> 2027-02-28
                I3  Profiles                                       PRF           (parallel with I2)
 M3 Print       I4  Printers: API, Bambu, open ecosystems, daemon  PRN        -> 2027-05-31
                I5  Slicing through external engines (end to end)  SLC
 M4 Daily use   I6  Project editor                                 VWR        -> 2027-10-31
                I7  Cameras                                        PRN           (parallel with I6)
                I8  Filament management                            FIL           (parallel with I6)
                I9  Fleet, queue, history                          PRN
 M5 Parity      I10 Parity breadth (P2 rows, more engines/printers) all        -> 2028-03-31
 M6 Build       I11 Distribution: VSSlicer build, Open VSX, themes PLT        -> 2028-06-30
```

Dependencies: I2, I4, I5 need I1; I5 needs I2, I3, I4; I6 needs I2, I5; I7 needs I4; I8 needs
I3, I4; I9 needs I4, I5 (I8 for material checks); I10 per epic; I11 needs everything and a budget.

Each initiative's document carries its own exit criteria and rationale. Milestone dates assume
two-week sprints from 2026-11-02; they are re-forecast from measured velocity after Sprint 1.

## Alternatives considered

- **Bambu printing before the viewer (I4 before I2).** Rejected: a Bambu send needs the
  `.gcode.3mf` layout from the 3MF library, and I4 cannot be verified end to end without it.
- **Profiles first (I3 before I1).** Viable (no dependencies, strong oracles) but delivers
  nothing a user sees until slicing exists; the preview is useful on day one.
- **One initiative per milestone.** Rejected: I2 and I3, and I6 to I8, have no mutual
  dependencies and should run in parallel sprints.

## What changes if the owner picks differently

Initiatives are documents; reordering is editing `order:` and the milestone map. Epics carry
their dependencies as `KEY:E<n>` so a reorder shows what breaks. Only I5 is immovable: it needs
I1 to I4.

## Review

Reviewed by the planner against gstack's `plan-ceo-review` criteria (premise, existing-code
leverage, 12-month ideal, alternatives) and `autoplan`'s six principles, by reading the skills'
criteria rather than running their interactive flow (unattended run). Outcome in
`.reference/notes/VSS-18-planning.md`.
