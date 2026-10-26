---
id: 106
title: Describe what gcode-language ships in its README and PROVENANCE
type: bug
priority: P2
effort: XS
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP6"
docs: [.ai/audits/SP5-audit.md]
created: 2026-10-26
---

Module: gcode-language (docs). Finding 9 of the SP5 audit, `.ai/audits/SP5-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] README describes the extension's code; PROVENANCE lists the catalogue sources, including the attributed AGPL OrcaSlicer template quotes
- [x] A test that fails before the fix (docs only; waived by reviewer)

## Tasks

- [ ] Fix as the audit describes

## Progress

Done: README gains a Features section (hover, completion, warnings, status item, setting with all five flavours, size limits) and drops 'runs no code'; PROVENANCE gains a Catalogue paragraph (original wording, allowed sources and licences, Klipper GPL-3.0 not copied, OrcaSlicer@09aa0114 AGPL quotes). Docs only: no test, so the second criterion is not met. Changelog: gcode-language: README and PROVENANCE describe the shipped features and catalogue sources.

Review passed (gcp104-106-103-reviewer): README/PROVENANCE checked against code, catalogue (sources match SOURCES list, Orca@09aa0114 matches the clone and cited lines, flavour list and setting match package.json, 50 MB / 4 MB match size.ts). Fixed README: fallback to Marlin also applies to RepRapFirmware (lookup.ts FALLBACK). Second criterion waived: docs only.
