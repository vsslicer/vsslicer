---
id: 117
title: "Manual check: exported bundles load in the desktop apps"
type: chore
priority: P1
effort: S
model: sonnet
area: [export]
story: US49
milestone: "VSS:M2"
sprint: "VSS:SP19"
depends_on: [116]
created: 2026-10-25
---

Loads one exported `.orca_printer` and one `.bbscfg` into the real apps and records versions.

**Code:** `vsslicer/modules/profiles-extension/test/manual/bundles.md` (module: `profiles-extension`, layer: n/a (manual verification))

## Acceptance criteria

- [ ] An exported `.orca_printer` loads in OrcaSlicer and an exported `.bbscfg` loads in Bambu Studio; both app versions recorded
- [ ] Any rejection by the app is written up as a bug card

## Tasks

- [ ] Export the two bundles
- [ ] Load them
- [ ] Record versions

## Progress

Not started.
