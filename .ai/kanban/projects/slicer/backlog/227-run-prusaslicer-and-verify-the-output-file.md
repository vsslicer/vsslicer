---
id: 227
title: Run PrusaSlicer and verify the output file
type: feature
priority: P2
effort: M
model: sonnet
area: [prusa]
story: US66
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [14, 222, 225, 226, GCP-3, GCP-14]
created: 2026-10-25
---

Runs the CLI through the runtime module, then applies the success rule: file exists, is non-empty, parses with the G-code parser (text or `.bgcode`) and stderr has no error line.

**Code:** `vsslicer/modules/slicer/prusa/src/adapters/...` (module: `slicer-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] One test per failure case with the recorded stderr: missing output, empty output, unparseable output, error line with an output file
- [ ] Exit code 0 with any of those is a failure with the typed error (regression test named in the test title)
- [ ] Cancel through the runner leaves nothing in the staging area

## Tasks

- [ ] Compose runner and rules
- [ ] Parse check
- [ ] Failure matrix
- [ ] Cancel test

## Progress

Not started.
