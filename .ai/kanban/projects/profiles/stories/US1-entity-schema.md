---
id: US1
title: "A schema consumer validates every profile entity against a published JSON Schema"
status: reviewed
epic: VSS:E11
---

A developer of the slicer adapters, the filament inventory or the profiles extension uses `@vsslicer/profile-api` types and JSON Schema for vendor, printer_model, nozzle, surface, feeder, material, process and printer_instance, so every profile file can be validated with the same rules, in plain Node or by VS Code's JSON service.

## Acceptance criteria

- [ ] JSON Schema (draft 2020-12) exists for each entity; every hand-written fixture validates and every negative fixture fails with the expected path
- [ ] Shared fields `id`, `inherits[]`, `abstract`, `when`, `overrides[]` (`match: first|all`), `settings`, `renamed_from[]` and `meta` exist on every entity except `vendor`; keyed per-extruder values and `null` fall-through validate
- [ ] A `connection` block with a credential-like property fails validation
- [ ] Verified on fixtures only (D5)

## Out of scope

- Reading native files (E12); files on disk (E13); any UI.
