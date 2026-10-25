---
id: E40
title: Build the inventory data model and append-only event log
status: reviewed
initiative: I8
project: FIL
order: 1
depends_on: [E1]
rows: []
---

Delivers the foundation of `vsslicer.filament`: a Spoolman-compatible superset model (Brand,
Material, Filament, Spool, ConsumptionEvent, Tag) stored locally per user, with an append-only
consumption log from which every spool's used weight is derived. It serves the other FIL epics
(import, booking, UI, tags, sync) and any extension that reads spools through the exported
`Inventory` API. It carries no feature-matrix row on its own; it is the substrate for §14 Spool
inventory (E43) and §14 Consumption from printer feedback (E42).

## Scope

In:
- `vsslicer.filament` extension skeleton (activation, settings, output channel) and a pure
  TypeScript model module with no `vscode` import, so it is unit-tested in Node and could be
  extracted into a library later. Written new (D2 allows porting, but there is nothing to port:
  Spoolman's schema is MIT and is followed as a field list, `filament-management.md` §1, §5).
- Entities per `filament-management.md` §5: `Brand` (name, `ofd_uuid`), `Material` (class, type,
  density, temperature ranges), `Filament` (colour variant: name, colours, diameter, net weight,
  empty spool weight, EAN/article number, `ofd_uuid`, `slicer_ids {bambu, orca, prusa, cura}`,
  `external_id`), `Spool` (initial weight, location string, lot, price, archived, first/last used,
  `last_remain_pct`, `last_remain_g`, `material_profile_id`), `Tag` (normalised UID, format,
  target), `ConsumptionEvent` (spool, job, printer, tool, source `gcode | extrusion | ams | tag |
  manual | scale`, grams, estimate flag, timestamp). User-defined extras as `extra {}` like
  Spoolman.
- Grams are canonical. Length to grams uses the filament's diameter and density
  (g = pi * (d/2)^2 * L * rho / 1000, d and L in mm, rho in g/cm3); missing density is an error,
  not a default.
- Store in `globalStorageUri` (inventory is per user, not per workspace): `entities.json`
  snapshot plus `events.jsonl` append-only log; the snapshot is a cache rebuildable from the log.
  Schema version field and forward migrations with a backup copy first.
- Idempotent events: id = hash(source, printer, job, spool, tool); a duplicate is ignored.
- Scale reading = absolute gross weight; it records a `scale` correction event so that
  `used = sum(events)` still holds.
- Multi-window safety: advisory lock file around appends and snapshot writes, reload on file
  change.
- Exported API `Inventory`: `spools()`, `get(id)`, `onDidChange`, `book(event)`,
  `measure(spoolId, grossGrams)`, `matchByTag(uid)`, `create/update/archive` for entities.

Out: any UI beyond commands for export/backup (E43), importers (E41), printer feedback (E42), tags
parsing (E44), Spoolman (E45). No SQLite (native module in VSIX; JSONL is enough at this size).

## Feature-matrix rows

None owned. Enables §14 Spool inventory (E43) and §14 Consumption from printer feedback (E42).

## Acceptance criteria

- [ ] Property tests (fast-check): for any sequence of book, measure, duplicate and replayed
      events, `spool.used_weight == sum(events)` and remaining = initial - used; replaying the log
      from empty reproduces the snapshot byte for byte (catches drift between cache and log).
- [ ] Duplicate event ids are ignored (catches double booking on redelivered job ends).
- [ ] Length-to-grams conversion matches Spoolman's `use_length` conversion on a table of
      fixtures computed from `Spoolman@488eb74:spoolman/database/spool.py:1161`; missing density
      raises a typed error that the caller must surface.
- [ ] A truncated last line in `events.jsonl` (simulated crash mid-write) is detected, quarantined
      to a `.corrupt` file and reported in the output channel and a warning; earlier events load.
- [ ] Two processes appending concurrently under the lock produce a valid log with every event
      once (Node child-process test).
- [ ] Migration from schema v1 to a test v2 keeps a backup and is reversible by restoring it.
- [ ] Model module has no `vscode` import (lint rule); package.json `"license": "AGPL-3.0-or-later"`.
- [ ] Verified on fixtures only; no hardware involved (D5).

## Dependencies

- Needs E1 (monorepo, CI, test tooling, publishing).
- Exposes `Inventory` (extension `exports`) to E41-E45 and to other projects that want spools
  (SLC filament cost, PRN AMS slot display); the event schema is the contract E42 and E45 write to.

## Risks and spikes

- Multi-window writes on Windows (no atomic O_APPEND guarantee): spike the lock file on all three
  CI platforms in the first sprint; fallback is single-writer through `vsslicer-agent` (E22),
  an open question for the coordinator.
- Extension kind: the roadmap lists `workspace`, but E41 and E45 need network and the store is per
  user. Proposal `extensionKind: ["ui", "workspace"]`; decide before E40 starts.

## Eng review

- Scope challenge: the smallest epic that makes E41-E45 possible. Deliberately out: UI, any
  network. Considered folding a minimal tree view in so the epic is user-visible; rejected, the
  UI is its own deliverable (E43) and E40 is testable without it.
- Tests name their regressions (drift, double booking, torn writes, concurrent appends,
  migration loss). Oracle: Spoolman's conversion code for units, property tests for invariants.
- Boring technology: JSON files, no database, no innovation token.
- Blast radius: a corrupt store is user data loss; mitigated by append-only log, backups before
  migration, quarantine instead of discard. A crash here does not affect other extensions (no
  heavy work; log replay for 10^5 events stays under 200 ms, measured in a benchmark test).
- Reversibility: schema versioned, backup before migration; the extension can be disabled
  without touching other extensions.
- Zero silent failures: corrupt line, missing density, lock timeout each have a typed error, a
  user-visible warning and a test.

## Coordinator reconciliation

- `extensionKind: ["ui", "workspace"]` with the store in `globalStorageUri`, as proposed; two-window writes use the lock file and idempotent event ids (spiked on Windows first).
