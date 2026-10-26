---
id: 111
title: "Spike: the .curaprofile layout from a file saved by Cura 5.x"
type: spike
priority: P1
effort: S
model: opus
area: [importers]
story: US46
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [121, 135]
created: 2026-10-25
---

The layout is unverified (`profiles.md` Comparison); this settles it from a real Cura 5.x file (kept as the module's fixture) or moves the format to E57.

**Code:** `vsslicer/modules/profiles-cura/docs/spikes/curaprofile.md` (module: `profiles-cura`, layer: n/a (spike notes))

## Acceptance criteria

- [ ] A real `.curaprofile` saved by Cura 5.x (version recorded) is inspected and its structure written down
- [ ] Decision: implement in this epic, or defer to E57 with the reason; if deferred the two Cura cards below are closed with that note

## Tasks

- [ ] Save a profile from Cura
- [ ] Document the layout
- [ ] Decide

## Progress

Not started.
