---
id: 143
title: Plan a one-key write-back with a diff
type: feature
priority: P2
effort: S
model: sonnet
area: [calibration]
story: US47
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [133]
created: 2026-10-25
---

`planWriteBack(test, value, target)` returns a patch of exactly one key (value, previous value, preset kind) and the diff text; it never touches ProfileStore itself.

**Code:** `vsslicer/modules/calibration/src/domain/...` (module: `calibration`, layer: `domain`)

## Acceptance criteria

- [ ] The patch contains one key and no more for every test in the catalogue
- [ ] The key is valid for the target kind (material or printer); a mismatch is refused
- [ ] Applying and then reverting the patch returns the original object (pure test)

## Tasks

- [ ] Patch type
- [ ] Per-test key table
- [ ] Diff text
- [ ] Tests

## Progress

Not started.
