---
id: 248
title: Write the spike report and the decision record
type: docs
priority: P2
effort: M
model: opus
area: [embedded]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [244, 245, 246, 247]
created: 2026-10-25
---

Compares the candidates on the same fixtures and records the choice and the packaging decision (in `vsslicer.slicer` or a separate extension, by VSIX size).

**Code:** `docs/research/` (module: `slicer-embedded`, layer: n/a (docs))

## Acceptance criteria

- [ ] The report in `docs/research/` has a table of measured numbers per candidate on the I5 fixture set
- [ ] A decision record is added on the VSS board with the choice, the packaging decision and the consequences for the cards below
- [ ] The report lists which cards of E66 need revising if the choice is not the expected one

## Tasks

- [ ] Collect numbers
- [ ] Write the report
- [ ] Write the decision

## Progress

Not started.
