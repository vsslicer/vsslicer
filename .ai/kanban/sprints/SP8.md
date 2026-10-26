---
id: SP8
title: Open 3
status: active
milestone: M2
start: "2026-10-26T07:20+00:00"
end: "2026-10-26T09:30+00:00"
capacity: 92
---

Planned by `board.py plan-sprints M2`: 91 points, 35 cards.

## Epics

- VSS:E11 Define the unified profile schema, settings catalogue and condition evaluator
- VSS:E9 Build @vsslicer/mesh for STL and OBJ parsing in workers with a BVH
- VSS:E12 Import vendor and installed profiles from PrusaSlicer, Orca, Bambu Studio and Cura
- VSS:E10 Ship vsslicer.project in viewer mode

## Plan at start (coordinator, 07:30)

Sized from workable cards only (estimation rules 6 and 23). Of the cards planned into SP8, the workable
ones are PRF-180, PRF-10, PRF-11, PRF-24, PRF-124 and PRF-125 (15 points); everything else in SP8 is
owner-blocked (Q7, Q8, Q12, Q14, Q15, Q16, Q19, Q20, D14, the owner's slicer exports), waits on a
pending decision (D17, D19, D20), or depends on a card that does (each carries an "SP8 start" note).
PRF-145 is on hold (Q20 and the vendored-data question); PRF-57 needs profiles releases planned for SP10.

Pulled in, all workable: PRF-35, PRF-70 (split per rule 17 into PRF-70 M and PRF-181 M), PRF-71, PRF-103,
PRF-136 from SP9 to SP11 (M2); GCP-41 (gcode-preview, M2); and from M3 the module scaffolds PRN-2, 15, 86,
95, 104, 112, 120, 130, SLC-2, 8, 15, 43, 55, 65, 100 and PLT-49.

| Lane (module) | Cards | Points |
|---|---|---|
| profile-api | PRF-180, PRF-136 (release) | 3 |
| profiles-prusa | PRF-10, PRF-24, PRF-11 | 9 |
| profiles-orca | PRF-124, PRF-103 | 5 |
| profiles-cura | PRF-125 | 2 |
| profiles | PRF-35, PRF-70, PRF-181, PRF-71 | 11 |
| gcode-preview | GCP-41 | 3 |
| 16 new modules | one scaffold card each | 32 |
| sprint cards | VSS-47 audit, VSS-82 retro | 4 |

Workable: 65 task points plus 4 for the audit and retro. Capacity at 20 points an hour per lane with
work over about 80 minutes of building (07:30 to 08:50; the audit gets 30 minutes or more after that)
exceeds the workable points, so the workable points are the plan, with PRF-33 (split) as the reserve.
Busiest lane: profiles, 11 points, about 35 minutes.
