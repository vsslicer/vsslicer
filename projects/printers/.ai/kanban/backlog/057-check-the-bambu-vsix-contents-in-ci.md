---
id: 57
title: Check the Bambu VSIX contents in CI
type: chore
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US14
milestone: "VSS:M3"
depends_on: [50, PLT-21]
created: 2026-10-25
---

List the VSIX and fail on any closed binary, key or certificate other than Bambu's public CA chain.

**Code:** `vsslicer/modules/bambu-extension/` (module: `bambu-extension`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] CI step lists VSIX contents against an allow-list; a planted `.so` or private key fails the step (negative fixture)

## Tasks

- [ ] Allow-list
- [ ] Negative fixtures
- [ ] CI step

## Progress

Not started.
