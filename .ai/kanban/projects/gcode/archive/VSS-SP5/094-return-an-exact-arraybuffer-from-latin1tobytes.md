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

- [x] latin1ToBytes(text).buffer holds exactly the text's bytes, not Node's shared pool (test)

## Tasks

- [x] Write the failing test
- [x] Fix
- [ ] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Done. latin1ToBytes now uses Buffer.allocUnsafeSlow + write(latin1): own ArrayBuffer sized exactly. Test added (byteOffset 0, buffer.byteLength 5). README notes Node requirement.
Verified in gcode-bgcode: pnpm lint, test (41 passed, incl. the 200 MB/s speed test), build all pass.
CHANGELOG: - Fixed: latin1ToBytes returns bytes backed by an exact-size ArrayBuffer instead of Node's shared pool.
Files: vsslicer/modules/gcode-bgcode/src/domain/ascii.ts, test/ascii.test.ts, README.md.

Review (gcode94-review): PASS, lint/test (41)/build green; empty string and non-latin1 input byte-identical to Buffer.from(latin1) with exact own ArrayBuffer (probe); large strings same speed as Buffer.from (small ones ~0.3us slower, immaterial); README line accurate.
