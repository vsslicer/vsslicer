---
id: 27
title: Read Orca and Bambu JSON trees and flatten include and inherits
type: feature
priority: P0
effort: L
model: opus
area: [importers]
story: US12
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [120, 135, 124, 136]
created: 2026-10-25
---

Reads the vendor index, `machine_model`, `machine`, `process`, `filament`, `include`, `instantiation`, `setting_id`, `filament_id` and `nil`, resolving `inherits` then `include` then own keys (the Orca rule, `profiles.md` §2).

**Code:** `vsslicer/modules/profiles-orca/src/adapters/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] Golden counts at Orca@09aa0114: 70 vendors plus OrcaFilamentLibrary; at Bambu@79df7ae: 12 vendors
- [ ] Order of resolution is parent, then includes, then own keys, proven by a hand-built fixture where all three set the same key
- [ ] `nil` maps to `null` fall-through; `setting_id` and `filament_id` are kept as `external_ids`
- [ ] Invalid JSON, unknown `type` and a missing include each give a diagnostic with file; other entities import

## Tasks

- [ ] Read vendor index and file types
- [ ] Implement the include/inherits flatten
- [ ] Map keys and `nil`
- [ ] Golden-count tests

## Progress

Not started.

**Dependency on PRF-23 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with PRF-23.
