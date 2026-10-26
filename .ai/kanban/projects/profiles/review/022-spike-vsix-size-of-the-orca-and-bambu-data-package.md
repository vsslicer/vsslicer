---
id: 22
title: "Spike: VSIX size of the Orca and Bambu data package"
type: spike
priority: P0
effort: S
model: sonnet
area: [importers]
story: US17
milestone: "VSS:M2"
sprint: "VSS:SP8"
owner: sp7-prf-22
depends_on: [1]
created: 2026-10-25
---

Measures the compressed size of the 30 MB of JSON and decides between shipping it inside `vsslicer.profiles` or as a separate data extension.

**Code:** `vsslicer/fixtures/profile-research/data-package-size.md` (layer: n/a (spike notes))

## Acceptance criteria

- [x] Compressed sizes measured for Orca@09aa0114 (23.4 MB JSON) and Bambu@79df7ae (6.5 MB JSON) as a VSIX payload
- [x] A decision with numbers: inside the extension or a separate package, against the PLT-21 VSIX budget

## Tasks

- [x] Pack the trees into a test VSIX
- [x] Record the sizes
- [x] Write the decision

## Progress

Done. Measured both trees (18,009 JSON files, 29.9 MiB): zip -6 14.0 MB (Orca 11.2, Bambu 2.6), tar.gz 2.6 MB, tar.xz 1.2 MB. Decision: separate data extension, since 14 MB is about 70x the 200 KB PLT-21 budget. Files: vsslicer/fixtures/profile-research/data-package-size.md, .reference/notes/PRF-22-vsix-size.md. No shared-file changes.
