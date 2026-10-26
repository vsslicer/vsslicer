---
id: 86
title: Speed up latin1 conversion in the bgcode-to-gcode twin
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: GCP-86-worker
docs: [.ai/audits/SP3-audit.md]
created: 2026-10-25
---

Module: gcode-bgcode (domain). Finding 3 of the SP3 audit, `.ai/audits/SP3-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] `latin1ToBytes` and `bytesToLatin1` use plain loops (or TextDecoder latin1) and convert at least 200 MB/s on this machine (benchmark test with a generous bound)

## Tasks

- [x] Write the failing test
- [x] Fix
- [x] Release a patch version of each changed module

## Progress

Replaced both functions in src/domain/ascii.ts with Node Buffer latin1 (Buffer.toString('latin1') / Buffer.from(s,'latin1')); TextDecoder rejected (windows-1252). Measured on 64 MB: before 37 MB/s (bytesToLatin1) and 16 MB/s (latin1ToBytes); after about 3100 and 2200 MB/s. Test in test/ascii.test.ts proves all 256 byte values round-trip and a 32 MB round trip above 200 MB/s. lint, test (40), build pass. Released gcode-bgcode 0.4.2. Note: Buffer is a Node global, so these functions need Node or the desktop extension host, not a browser.
Files: vsslicer/modules/gcode-bgcode/{src/domain/ascii.ts,test/ascii.test.ts,package.json,CHANGELOG.md}
