---
id: 149
title: Apply the overlay and our patches to the pinned VSCodium sources
type: feature
priority: P2
effort: M
model: opus
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [147, 148]
created: 2026-10-25
---

The build script writes the overlay into the VSCodium checkout and applies our patch series in order; a patch that no longer applies fails with its name.

**Code:** `vsslicer/modules/tooling/vsslicer-build/src/adapters/apply.ts` (module: `vsslicer-build`, layer: `adapters`)

## Acceptance criteria

- [ ] `build/apply.mjs` produces the overlaid sources; a failing patch names the patch and the hunk
- [ ] Our patches are listed in one series file, each with a header saying why and its licence (AGPL-3.0-or-later)
- [ ] Removal of unrelated UI is limited to patches VSCodium already carries

## Tasks

- [ ] Write the apply script
- [ ] Create the series file
- [ ] Test with a deliberately broken patch

## Progress

Not started.
