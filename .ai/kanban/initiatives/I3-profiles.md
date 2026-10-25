---
id: I3
title: Profiles: unified schema, importers, editor and add-printer flow
status: approved
milestone: M2
order: 3
projects: PRF
phases: 3
---

## Problem

Users already own PrusaSlicer, Orca, Bambu Studio and Cura profiles in four formats with different inheritance rules; without them nothing can be sliced for a real printer, and every slicer invents its own settings UI.

## Outcome

`vsslicer.profiles`: import from installed slicer configuration folders, from `.orca_*`, `.bbscfg`, `.bbsflmt` and INI bundles, and from upstream vendor packs on request (Prusa always from upstream, D4). One unified JSON schema (vendor, printer_model, nozzle, surface, feeder, material, process, printer_instance), a profile tree, a JSON Schema for text editing, a generated settings form with search, secrets in SecretStorage, and an add-printer flow. `ProfileStore.resolve` returns both the unified and the native form losslessly.

## Roadmap phases and feature-matrix rows

Roadmap phase(s) 3 (`.ai/plans/roadmap.md`). Rows (`docs/research/feature-matrix.md`): §1 all settings categories (as schema and UI; the SLA and Milling rows are deferred P3); §13 all rows; §14 Filament presets; §5 Multi-tool presets and toolchangers (schema side); §7 Placeholder macro language (schema and pass-through).

## Exit criteria

- Importer golden tests on pinned vendor packs pass with the entity counts from `profiles.md` §1 (for example 35 printer models and 238 printers in PrusaResearch.ini)
- Resolved values for sample tuples match native resolution; native export is byte-equivalent after a round trip
- Condition evaluator passes the truth table from Prusa `compatible_printers_condition` examples; every imported entity validates against the schema
- A user can add a printer (model, nozzle, material) and see its resolved process in the form; secrets never land in files

## Order: 3 of 11

Third because it is independent of I1 and I2 (it can run in parallel with I2) and I5 cannot start without it. Its oracles are strong: pinned vendor packs and native round trips.

Order rationale follows the roadmap's rule: testability first (libraries checked against deterministic fixtures and external oracles), usability next (daily workflows on proven foundations), functionality last (breadth, optional engines, the fork).
