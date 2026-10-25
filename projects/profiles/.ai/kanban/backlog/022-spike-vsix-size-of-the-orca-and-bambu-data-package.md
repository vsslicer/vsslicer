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
depends_on: [1]
created: 2026-10-25
---

Measures the compressed size of the 30 MB of JSON and decides between shipping it inside `vsslicer.profiles` or as a separate data extension.

**Code:** `vsslicer/fixtures/profile-research/data-package-size.md` (layer: n/a (spike notes))

## Acceptance criteria

- [ ] Compressed sizes measured for Orca@09aa0114 (23.4 MB JSON) and Bambu@79df7ae (6.5 MB JSON) as a VSIX payload
- [ ] A decision with numbers: inside the extension or a separate package, against the PLT-21 VSIX budget

## Tasks

- [ ] Pack the trees into a test VSIX
- [ ] Record the sizes
- [ ] Write the decision

## Progress

Not started.
