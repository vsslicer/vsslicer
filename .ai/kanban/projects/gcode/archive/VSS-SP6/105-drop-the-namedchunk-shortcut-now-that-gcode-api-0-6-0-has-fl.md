---
id: 105
title: Drop the NamedChunk shortcut now that gcode-api ^0.6.0 has flavourName
type: bug
priority: P2
effort: XS
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP6"
docs: [.ai/audits/SP5-audit.md]
created: 2026-10-26
---

Module: gcode-parser (domain). Finding 8 of the SP5 audit, `.ai/audits/SP5-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] chunk-writer.ts and collect.ts use gcode-api's Chunk directly
- [ ] A test that fails before the fix

## Tasks

- [ ] Fix as the audit describes

## Progress

Done in gcode-parser (needs gcode-api ^0.7.0, set under GCP-99 Part B). Removed `NamedChunk` and its shortcut comment from src/domain/chunk-writer.ts (take() returns `Chunk`, which has `flavourName`), and from src/application/collect.ts (takes `AsyncIterable<Chunk>`, returns `ParsedFile`, no local `& { flavourName }`); dropped the NamedChunk import/annotation in test/tags.test.ts. Verified: lint, build, 338 tests incl. golden pass.
Files: src/domain/chunk-writer.ts, src/application/collect.ts, test/tags.test.ts.
Changelog: Internal: chunks and collect() use gcode-api's Chunk/ParsedFile `flavourName` directly.
Review passed (gcp99b-105-reviewer): NamedChunk gone from chunk-writer.ts, collect.ts and tests.ts; collect still propagates flavourName; lint/build/338 tests pass. Restored a dropped sentence in collect.ts doc comment (comment only).
