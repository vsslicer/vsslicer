---
id: 28
title: Rehearse a full release of the pack and record the marketplace checks
type: chore
priority: P0
effort: M
model: opus
area: [publishing]
story: US6
milestone: "VSS:M1"
sprint: "VSS:SP9"
depends_on: [26, 27, 7]
created: 2026-10-25
---

Prove the feature-matrix row end to end with the pack alone (until E68 supplies `vsslicer.gcode`): publish, search, install, update.

## Acceptance criteria

- [ ] Pack published as pre-release on both marketplaces via a tag; searching "vsslicer" finds it in stock VS Code and in VSCodium; versions recorded
- [ ] Publishing a patch is picked up as an update by an installed copy
- [ ] Open VSX upload validation passes; results written to `.reference/notes/` and `CONTRIBUTING.md`

## Tasks

- [ ] Tag and release
- [ ] Install on stock VS Code and VSCodium
- [ ] Publish a patch and observe the update
- [ ] Record versions

## Progress

Not started.
