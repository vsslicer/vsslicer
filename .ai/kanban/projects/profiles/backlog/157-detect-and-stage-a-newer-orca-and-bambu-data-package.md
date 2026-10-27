---
id: 157
title: Detect and stage a newer Orca and Bambu data package
type: feature
priority: P2
effort: M
model: sonnet
area: [importers]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [149, 145]
created: 2026-10-25
---

Implements `UpdateSource` for the Orca and Bambu trees: `latest` reads the release index of the `profiles-data-orca` package (version, tarball URL, sha256) from a configurable index URL; `stage` downloads the tarball, verifies the checksum and extracts it with the archive safety limits.

**Code:** `vsslicer/modules/profiles/orca/src/adapters/...` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] A recorded index gives the newer version and `null` when equal; a checksum mismatch aborts with a typed error and removes the partial download
- [ ] Extraction refuses path traversal and oversized entries (fixture archive)
- [ ] Nothing is written outside the staging folder

## Tasks

- [ ] Index reader
- [ ] Download and verify
- [ ] Safe extract
- [ ] Tests

## Progress

Not started.
