---
id: 94
title: Return an exact ArrayBuffer from latin1ToBytes
type: bug
priority: P2
effort: XS
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: gcode-bgcode (domain). Finding 10 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] latin1ToBytes(text).buffer holds exactly the text's bytes, not Node's shared pool (test)

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Not started.
