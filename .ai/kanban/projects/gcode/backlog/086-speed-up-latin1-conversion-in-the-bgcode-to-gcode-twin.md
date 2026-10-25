---
id: 86
title: Speed up latin1 conversion in the bgcode-to-gcode twin
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP4"
docs: [.ai/audits/SP3-audit.md]
created: 2026-10-25
---

Module: gcode-bgcode (domain). Finding 3 of the SP3 audit, `.ai/audits/SP3-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] `latin1ToBytes` and `bytesToLatin1` use plain loops (or TextDecoder latin1) and convert at least 200 MB/s on this machine (benchmark test with a generous bound)

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] Release a patch version of each changed module

## Progress

Not started.
