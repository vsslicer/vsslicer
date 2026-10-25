---
id: 169
title: Rehearse the rebase onto the next VSCodium release
type: spike
priority: P2
effort: M
model: opus
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [167]
created: 2026-10-25
---

After the first release, waits for the next VSCodium tag and rebases our patch series, recording the cost (E69: monthly rebase over 41 top-level patches plus ours). Starts only when upstream has a newer tag.

**Code:** `vsslicer/modules/vsslicer-build/docs/rebase-rehearsal.md` (module: `vsslicer-build`, layer: n/a (docs))

## Acceptance criteria

- [ ] `docs/rebase-rehearsal.md` records the tags, time spent, patches that broke and how each was fixed
- [ ] The pin file and build succeed on the new tag; the smoke tests pass
- [ ] The document ends with a recommended cadence

## Tasks

- [ ] Wait for the tag
- [ ] Rebase and fix
- [ ] Record time and breakage

## Progress

Not started.
