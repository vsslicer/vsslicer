---
id: 12
title: Download a file with SHA-256 verification and distinct failures
type: feature
priority: P0
effort: M
model: opus
area: [engine]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [8]
created: 2026-10-25
---

Downloads to a temp file, verifies the size and SHA-256, then renames into place. Security-sensitive: the binary is run later.

**Code:** `vsslicer/modules/slicer/runtime/src/adapters/...` (module: `slicer-runtime`, layer: `adapters`)

## Acceptance criteria

- [ ] A checksum mismatch, an offline error and an HTTP error each give a distinct typed result and leave no file in the target directory (tests against a local HTTP fixture server)
- [ ] Redirects are followed only to https; plain http is refused except `localhost` in tests
- [ ] An interrupted download leaves nothing and a second attempt starts clean
- [ ] Progress callback reports bytes

## Tasks

- [ ] Downloader
- [ ] Fixture HTTP server
- [ ] Failure tests

## Progress

Not started.
