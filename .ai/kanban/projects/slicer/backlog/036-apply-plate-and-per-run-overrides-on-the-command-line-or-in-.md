---
id: 36
title: Apply plate and per-run overrides on the command line or in the JSON
type: feature
priority: P0
effort: M
model: sonnet
area: [orca]
story: US9
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [31, 33, 23, PRF-135]
created: 2026-10-25
---

An override goes on the command line as `--key=value` where Orca accepts it, else into the emitted JSON, using the refused-key classes from the spike.

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] A test per refused-key class shows the override in the JSON and not on the command line
- [ ] An accepted key shows on the command line and not in the JSON (no double application)
- [ ] An override of an unknown key is reported, not applied

## Tasks

- [ ] Classify keys
- [ ] Route overrides
- [ ] Tests per class

## Progress

Not started.
