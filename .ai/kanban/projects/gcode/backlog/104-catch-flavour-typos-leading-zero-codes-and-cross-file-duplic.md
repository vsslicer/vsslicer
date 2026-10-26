---
id: 104
title: "Catch flavour typos, leading-zero codes and cross-file duplicates in the catalogue lint"
type: bug
priority: P2
effort: XS
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP6"
docs: [.ai/audits/SP5-audit.md]
created: 2026-10-26
---

Module: gcode-language (domain). Finding 7 of the SP5 audit, `.ai/audits/SP5-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] The lint rejects an unknown flavour name, G01-style codes and the same code and flavour in two files; klipper:M104 duplicate removed
- [ ] A test that fails before the fix

## Tasks

- [ ] Fix as the audit describes

## Progress

Not started.
