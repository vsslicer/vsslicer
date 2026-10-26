---
id: 21
title: Read Bambu and Orca project config and embedded presets
type: feature
priority: P0
effort: M
model: opus
area: [3mf]
story: US5
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [20]
created: 2026-10-25
---

Ports the key tables and config-part reading: `project_settings.config` JSON and `*_settings_N.config` presets returned as raw blobs for E12.

Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` and `BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Raw project config and every embedded preset blob are returned and match the fixture byte for byte
- [ ] The printable area (bed shape) is exposed on the Project when present
- [ ] Each ported file keeps the upstream notice and a `Ported from <repo>@<commit>:<path>` line (checked by `tools/check-licence`)

## Tasks

- [ ] Port key tables
- [ ] Read config parts
- [ ] Notice and provenance lines
- [ ] Tests

## Progress

Not started.

**Dependency on VWR-10 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with VWR-10.
