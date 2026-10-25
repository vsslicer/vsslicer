---
id: 257
title: Count triangles for a quality setting and reuse the result
type: feature
priority: P1
effort: S
model: sonnet
area: [step, mesh]
story: US68
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [256]
created: 2026-10-25
---

Tessellates at a quality once, returns the triangle count, and hands the same result to the import so the preview count equals the imported count.

**Code:** `vsslicer/modules/mesh-step/src/application/preview.ts` (module: `mesh-step`, layer: `application`)

## Acceptance criteria

- [ ] The previewed count equals the imported count for every preset
- [ ] A repeated call with the same quality does not tessellate again

## Tasks

- [ ] Cache by bytes hash and quality
- [ ] Tests

## Progress

Not started.
