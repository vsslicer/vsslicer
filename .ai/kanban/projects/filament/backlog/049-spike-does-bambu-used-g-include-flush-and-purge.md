---
id: 49
title: "Spike: does Bambu used_g include flush and purge"
type: spike
priority: P1
effort: S
model: opus
area: [consumption]
story: US21
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [44, 47]
created: 2026-10-25
---

Compare a multi-colour H2C print's `used_g` with scale readings of the spools before and after, and record whether `remain_g` is reported (firmware version and date recorded).

**Code:** `vsslicer/modules/filament/docs/` (module: `filament`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] A written note with the three weights per spool, the `used_g` values, the firmware version/date and the verdict on flush and purge
- [ ] If `used_g` omits purge, a follow-up decision is recorded as an OWNER question

## Tasks

- [ ] Weigh spools
- [ ] Print
- [ ] Compare and write the note

## Progress

Not started.
