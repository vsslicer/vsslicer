---
id: 252
title: "Spike: licence of occt-import-js and of the OCCT build it embeds"
type: spike
priority: P1
effort: M
model: opus
area: [step, mesh]
story: US70
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [251]
created: 2026-10-25
---

`occt-import-js` was last published 2024-12 and its README states no licence. This spike confirms the licence of the package and of the OCCT it embeds, records the OCCT version, and decides whether to build OCCT's STEP reader to WASM ourselves (LGPL-2.1 with the OCCT exception), which spends an innovation token.

**Code:** `vsslicer/modules/mesh-step/docs/licence-spike.md` (module: `mesh-step`, layer: n/a (spike notes))

## Acceptance criteria

- [ ] The licence texts of the npm package and the embedded OCCT are quoted with versions
- [ ] A decision is written: use the package as is, or build our own WASM, with the reasons
- [ ] The relinking route (replacing the WASM file) is described and tested once by swapping the file

## Tasks

- [ ] Read package and sources
- [ ] Test the file swap
- [ ] Write the decision

## Progress

Not started.
