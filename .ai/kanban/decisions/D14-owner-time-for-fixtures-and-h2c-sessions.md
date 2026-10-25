---
id: D14
title: "Owner time for GUI-only fixtures and H2C sessions, grouped per milestone"
status: accepted
date: 2026-10-25
cards: [30, 31, 32, 33, 34, 36, 38]
---

## Context

Some cards in M2 to M5 have an oracle that only a person can produce:

- **GUI exports:** Bambu Studio, Cura and Orca GUI exports (VWR-10 to VWR-12, VWR-72, SLC-45, SLC-49) and the Cura oracle run (SLC-62).
- **H2C sessions:** the Bambu H2C hardware checks (PRF-102, PRN-30, PRN-58, SLC-128 to SLC-130, VWR-99, VWR-200, FIL-50, FIL-65, FIL-78, and the H2C cards of I7, I9 and I10). D5 makes the H2C the only hardware.

The sprint plan assumes these cards finish inside their sprint like any other.

## Decision (proposed)

**Recommended default:**

1. Agents produce fixtures through the slicer CLIs wherever one exists (PrusaSlicer, OrcaSlicer, CuraEngine). The owner exports only what a GUI alone can produce. Each fixture records the slicer's version, the latest stable release at capture time, in `PROVENANCE.md`.
2. The H2C cards of a milestone are done in one owner session near the milestone's end. Until then they stay open, and the milestone closes with them carried over rather than blocking the other cards.
3. Firmware version and date are recorded with every H2C result (D5).

## Alternatives

- **Owner on call during each sprint.** The fastest feedback, but it needs the owner at the planned times, which run around the clock.
- **No hardware checks until a later milestone.** Simpler, but bugs found late are expensive, and Bambu changes LAN behaviour between firmware releases.

## What changes if the owner picks differently

H2C cards move into dedicated "hardware" sprints, set with `board.py set <card> sprint=...` after
planning. Nothing else depends on the grouping.
