---
id: 13
title: Extract zip and tar.gz archives with a path-traversal guard
type: feature
priority: P0
effort: S
model: opus
area: [engine]
story: US2
milestone: "VSS:M3"
depends_on: [8]
created: 2026-10-25
---

Extracts release archives into the install directory. Security-sensitive: archive paths are untrusted.

**Code:** `vsslicer/modules/slicer-runtime/src/adapters/...` (module: `slicer-runtime`, layer: `adapters`)

## Acceptance criteria

- [ ] Entries with `..`, absolute paths or symlinks that escape the target are rejected (negative fixtures built at test time)
- [ ] Executable bits survive extraction on POSIX
- [ ] Extraction is all-or-nothing: a failure removes the partial directory

## Tasks

- [ ] Extractor
- [ ] Negative archives
- [ ] Tests

## Progress

Not started.
