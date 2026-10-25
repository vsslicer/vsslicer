---
id: 131
title: Read and write .curaprofile archives with safety limits
type: feature
priority: P1
effort: S
model: opus
area: [importers, export]
story: US48
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [121, 135]
created: 2026-10-25
---

Archive handling for Cura profile files using fflate directly; no archive module is shared with other adapters (KISS). Security-sensitive.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/archive/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] Path traversal, absolute paths, zip bomb, symlink and 10 000 entries are rejected with a message and nothing is written (archives built in the test)
- [ ] Entry-count and size limits have tests at the limit and one over

## Tasks

- [ ] Write the guarded reader/writer
- [ ] Malicious-archive tests

## Progress

Not started.
