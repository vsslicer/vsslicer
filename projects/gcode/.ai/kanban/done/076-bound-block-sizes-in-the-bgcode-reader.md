---
id: 76
title: Bound block sizes in the .bgcode reader
type: bug
priority: P0
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-76-worker
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Module `gcode-bgcode`, application and adapters layers. A 4-byte Heatshrink block claiming 4 GB allocates 4.3 GB; a 204 KB deflate block inflates to 210 MB before the size check (finding 1). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [x] A block whose uncompressedSize exceeds 64 MiB, or 16 times compressedSize for Heatshrink, yields a `block-too-large` diagnostic and is not decoded
- [x] Deflate decoding stops at the declared size (`maxOutputLength`)
- [x] A test with a 4-byte block claiming 4 GB passes without allocating more than a few MB

## Tasks

- [x] Size check in `readBgcode` before decoding
- [x] `maxOutputLength` in the deflate codec
- [x] Regression tests for both codecs
- [x] Release a patch version

## Progress

Done in `gcode-bgcode` 0.3.1 (published to the local registry only). Tests written first and shown failing (output in `.reference/notes/GCP-76-bgcode-bounds.md`).
- `readBgcode`: compressed block with uncompressedSize > 64 MiB, or (Heatshrink) > 16x compressedSize, yields `block-too-large` (new diagnostic code), codec not called, block yielded with `data` undefined.
- Deflate codec: `maxOutputLength` = declared size.
- 4 regression tests incl. 4-byte/4 GB (arrayBuffers delta < 5 MB) and a 210 MB deflate bomb.
- Verified: lint, test (33), build, check-licence, and an empty-store frozen-lockfile install in a temp copy. Not done: tooling devDependency left at ^0.8.0 (0.8.1 exists).
Files: vsslicer/modules/gcode-bgcode/{src/domain/bgcode.ts,src/application/read-bgcode.ts,src/adapters/deflate-codec.ts,test/read-bgcode.test.ts,package.json,CHANGELOG.md}
