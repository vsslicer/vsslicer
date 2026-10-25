---
id: 84
title: Check the browser entry in the VSIX content assertion
type: feature
priority: P2
effort: S
model: sonnet
area: [web]
story: US50
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [81, 21]
created: 2026-10-25
---

For an extension with a `browser` field the packaging task also asserts that the entry file is in the VSIX, that its bundle passes the Node-built-in check, and that the size budget covers it.

**Code:** `vsslicer/modules/tooling/src/package/...` (module: `tooling`, layer: `adapters`)

## Acceptance criteria

- [ ] A VSIX whose `browser` file is missing, or whose bundle contains a built-in import, fails packaging (fixtures for both)
- [ ] An extension without `browser` is unaffected

## Tasks

- [ ] Assertion
- [ ] Fixtures

## Progress

Not started.
