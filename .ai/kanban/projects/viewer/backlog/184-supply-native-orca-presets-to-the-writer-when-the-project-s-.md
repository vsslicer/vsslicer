---
id: 184
title: "Supply native Orca presets to the writer when the project's printer selection changes"
type: feature
priority: P1
effort: M
model: sonnet
area: [plates]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [183, 108, PRF-142, PRF-144]
created: 2026-10-25
---

When the project-level printer, filament or process selection changes, asks `profiles` for the native Orca JSON and passes it to the writer; otherwise the original embedded presets are preserved.

**Code:** `vsslicer/modules/apps/project/src/application/nativePresets.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A changed selection yields the three JSON strings for the writer
- [ ] An unchanged selection yields nothing, so the original parts are kept byte-identical
- [ ] An export failure leaves the original presets and reports it

## Tasks

- [ ] Use case
- [ ] Tests with a fake exporter

## Progress

Not started.
