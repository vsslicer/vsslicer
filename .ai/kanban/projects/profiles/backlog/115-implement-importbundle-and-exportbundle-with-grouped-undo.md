---
id: 115
title: Implement importBundle and exportBundle with grouped undo
type: feature
priority: P1
effort: M
model: opus
area: [importers, export]
story: US49
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [55, 47, 92, 37, 136]
created: 2026-10-25
---

The use cases `importBundle(uri)` and `exportBundle(ids, format)` over the registered importers and exporters: imports land under one bundle group that can be deleted as a unit; exports never contain secrets.

**Code:** `vsslicer/modules/profiles/profiles/src/application/bundles/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] With fake bundle importers, importing adds entities under one bundle id; deleting the group removes exactly them (test)
- [ ] Unknown bundle type, missing listed file and version mismatch each give a diagnostic and write nothing for that bundle
- [ ] Entities with credentials in a fake vault never appear in what a fake exporter receives (test); the real-format scan is part of the extension's leak-scan

## Tasks

- [ ] Format detection
- [ ] Bundle grouping and undo
- [ ] Exclude credentials from exports
- [ ] Tests with fakes

## Progress

Not started.
