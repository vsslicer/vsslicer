---
id: 103
title: Add the Orca and Bambu bundle archive reader and writer with safety limits
type: feature
priority: P1
effort: M
model: opus
area: [export, importers]
story: US48
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [120, 135]
created: 2026-10-25
---

Archive handling for `.orca_*`, `.bbscfg` and `.bbsflmt` using fflate directly (no archive module is shared across adapters, KISS), enforcing Orca-style containment (`PresetBundle.cpp:2428`) and size limits; security-sensitive.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/archive/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] Malicious archives (path traversal, absolute path, zip bomb, symlink, 10 000 entries) are rejected with a message and write nothing (archives built in the test)
- [ ] Entry-count and uncompressed-size limits are constants with tests at the limit and one over
- [ ] Reading returns entries in memory; nothing is extracted to disk

## Tasks

- [ ] Write the reader with limits
- [ ] Write the writer
- [ ] Malicious-archive tests

## Progress

Not started.
