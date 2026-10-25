---
id: US82
title: "Fill regions with bucket, smart and gap fill, height range and clear"
status: reviewed
epic: VSS:E52
---

As a user, I want to fill whole regions, fill narrow gaps, paint a Z band and clear paint, so that I do not have to brush large areas by hand.

## Acceptance criteria

- [ ] Bucket fill, smart fill (with an angle limit), gap fill, height range and clear each work for supports, seams and colours and are one undo step
- [ ] Bucket, smart and gap fill select the same triangles as Orca's recorded results on the fixtures
- [ ] Large fills run in a worker and do not freeze the viewer
- [ ] Clear asks for confirmation and clears only the selected kind on the selected object
- [ ] Verified only on fixtures (D5)

## Out of scope

- Brush strokes (US81)
- Smart fill tuning beyond the angle limit
