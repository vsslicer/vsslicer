---
id: 229
title: Fetch and cache the pinned PrusaSlicer in the module CI job
type: chore
priority: P2
effort: S
model: sonnet
area: [prusa]
story: US70
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [219, 14, PLT-9]
created: 2026-10-25
---

CI downloads the pinned release on each OS with the verified downloader, caches it by hash, and fetches the upstream Prusa profile bundle for the fixtures (D4) from a pinned revision.

**Code:** `vsslicer/modules/slicer-prusa/` (module: `slicer-prusa`, layer: n/a (ci))

## Acceptance criteria

- [ ] A cold run downloads and verifies; a warm run uses the cache (log assertion)
- [ ] The profile bundle revision is pinned and recorded
- [ ] A tampered cache entry fails the job

## Tasks

- [ ] Cache step
- [ ] Profile fetch
- [ ] Hash check

## Progress

Not started.
