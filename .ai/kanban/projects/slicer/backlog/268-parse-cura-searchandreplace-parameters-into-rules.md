---
id: 268
title: Parse Cura SearchAndReplace parameters into rules
type: feature
priority: P2
effort: S
model: sonnet
area: [postprocess]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [265, PRF-139]
created: 2026-10-25
---

Reads the SearchAndReplace entries from an imported Cura profile's post-processing script settings and turns them into the same rule type.

**Code:** `vsslicer/modules/slicer-extension/src/domain/...` (module: `slicer-extension`, layer: `domain`)

## Acceptance criteria

- [ ] A fixture Cura profile with two SearchAndReplace entries yields two rules; regex and plain-text modes map to flags
- [ ] Other post-processing scripts in the list are ignored here and left to the script runner
- [ ] A missing or empty field is reported with the script name

## Tasks

- [ ] Locate the settings
- [ ] Map to rules
- [ ] Tests

## Progress

Not started.
