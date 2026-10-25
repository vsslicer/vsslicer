---
id: 37
title: Fall back to the imported native JSON for unmodelled keys and report them
type: feature
priority: P0
effort: M
model: opus
area: [orca]
story: US9
milestone: "VSS:M3"
sprint: "VSS:SP12"
depends_on: [32, 33, 34, 7, PRF-140]
created: 2026-10-25
---

The unified schema may not model every Orca key. The emitter copies those from the original imported native JSON and records which, so the slice report can list them as warnings.

**Code:** `vsslicer/modules/slicer-orca/src/application/...` (module: `slicer-orca`, layer: `application`)

## Acceptance criteria

- [ ] Keys not in the schema but in the imported native JSON are written unchanged; a key missing in both is absent, not defaulted
- [ ] The keys that fell back are returned as `Warning` events once per slice
- [ ] A profile with no native source emits a warning that fallback is unavailable
- [ ] Defaults for absent thumbnail size and count (one 300x300 PNG) are reported as a warning

## Tasks

- [ ] Fallback merge
- [ ] Warning events
- [ ] Tests with a profile that has extra keys

## Progress

Not started.
