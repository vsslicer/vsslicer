---
id: 76
title: Bound block sizes in the .bgcode reader
type: bug
priority: P0
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Module `gcode-bgcode`, application and adapters layers. A 4-byte Heatshrink block claiming 4 GB allocates 4.3 GB; a 204 KB deflate block inflates to 210 MB before the size check (finding 1). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [ ] A block whose uncompressedSize exceeds 64 MiB, or 16 times compressedSize for Heatshrink, yields a `block-too-large` diagnostic and is not decoded
- [ ] Deflate decoding stops at the declared size (`maxOutputLength`)
- [ ] A test with a 4-byte block claiming 4 GB passes without allocating more than a few MB

## Tasks

- [ ] Size check in `readBgcode` before decoding
- [ ] `maxOutputLength` in the deflate codec
- [ ] Regression tests for both codecs
- [ ] Release a patch version

## Progress

Not started.
