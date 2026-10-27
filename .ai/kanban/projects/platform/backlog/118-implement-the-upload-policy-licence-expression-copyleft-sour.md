---
id: 118
title: Enforce the registry policy in the index generator
type: feature
priority: P0
effort: S
model: sonnet
area: [registry]
story: US72
milestone: "VSS:M6"
sprint: "VSS:SP15"
depends_on: [222]
created: 2026-10-25
---

The policy E68 put on an Open VSX server now runs in the generator (D24): every entry needs a licence expression, a copyleft entry needs a repository link, and only the `vsslicer` namespace is accepted (`licensing.md` §2 (e); roadmap question 20's default).

**Code:** `src/domain/policy.ts` (repo: `vsslicer/vsslicer-marketplace`, layer: `domain`)

## Acceptance criteria

- [ ] `checkPolicy(entry)` returns named violations: missing licence, copyleft without repository, foreign namespace
- [ ] The generator (PLT-223) fails the workflow listing every violation by extension and version
- [ ] Fixture tests for each violation and for a clean entry

## Tasks

- [ ] Policy function
- [ ] Wire into the generator
- [ ] Tests

## Progress

Not started.
