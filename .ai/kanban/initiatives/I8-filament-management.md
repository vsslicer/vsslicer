---
id: I8
title: Filament management: database, spool inventory, consumption from printer feedback
status: reviewed
milestone: M4
order: 8
projects: FIL
phases: 8
---

## Problem

No mainline slicer tracks spools; users run Spoolman or spreadsheets. The owner's product definition names a filament database, an inventory and consumption booked from printer feedback.

## Outcome

`vsslicer.filament`: a Spoolman-compatible superset model (Brand, Material, Filament, Spool, ConsumptionEvent, Tag) stored locally with an append-only event log; OFD import with SpoolmanDB filling gaps; optional Spoolman sync and Moonraker's Spoolman proxy; booking in trust order Moonraker, Bambu AMS `remain`/`tag_uid`, slicer total, manual scale; OpenPrintTag reading through the printer; spools linked to material profiles through `slicer_ids`.

## Roadmap phases and feature-matrix rows

Roadmap phase(s) 8 (`.ai/plans/roadmap.md`). Rows (`docs/research/feature-matrix.md`): §14 Filament database import, Spool inventory, Consumption from printer feedback, RFID and NFC spool tags (Filament presets are PRF).

## Exit criteria

- Event-log invariants hold under property tests (used weight equals the sum of events plus corrections; disagreements flagged)
- Importer passes against a pinned OFD snapshot; Spoolman REST contract tests pass against Spoolman in Docker
- Reconciliation on recorded job ends matches Moonraker `filament_used` and Bambu `used_g`/`remain`; the H2C's AMS spools appear in the inventory

## Order: 8 of 11

Eighth: usability, needing I4 (printer events) and I3 (material profiles); the Bambu AMS path comes free from I4's order. Usable without a Spoolman (D6).

Order rationale follows the roadmap's rule: testability first (libraries checked against deterministic fixtures and external oracles), usability next (daily workflows on proven foundations), functionality last (breadth, optional engines, the fork).
