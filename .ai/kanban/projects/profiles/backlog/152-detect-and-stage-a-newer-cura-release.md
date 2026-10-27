---
id: 152
title: Detect and stage a newer Cura release
type: feature
priority: P2
effort: M
model: sonnet
area: [importers]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [149, 130]
created: 2026-10-25
---

Implements `UpdateSource` for Cura: `latest` finds the newest release tag of the pinned Cura repository (D4), `stage` downloads the resources of that tag with the existing downloader into the staging folder.

**Code:** `vsslicer/modules/profiles/cura/src/adapters/...` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] With a recorded release list, `latest` returns the newer tag and `null` when equal; a failure maps to a retryable error
- [ ] `stage` writes only into the given folder and leaves nothing behind on failure (temp folder and rename)
- [ ] Tests needing the network skip offline; no Cura data is in the published file list

## Tasks

- [ ] latest
- [ ] stage
- [ ] Tests

## Progress

Not started.
