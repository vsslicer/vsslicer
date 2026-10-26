---
id: 34
title: Write the capability table by model and firmware and the Mode A/F selector
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [31, 14]
created: 2026-10-25
---

Select the capability set from model, firmware and the `print.fun` Developer Mode flag.

**Code:** `vsslicer/modules/printer-bambu/src/domain/...` (module: `printer-bambu`, layer: `domain`)

## Acceptance criteria

- [ ] `fun` enabled/disabled fixtures select the full or the read-only set with the 'requires Developer Mode' reason
- [ ] Unknown model or firmware falls back to read-only with a warning (test)

## Tasks

- [ ] Table data
- [ ] Selector
- [ ] Tests

## Progress

Not started.
